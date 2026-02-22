import os
import re
import json
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# LangChain and vector store imports
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

# ──────────────────────────────────────────────
# Pydantic Models
# ──────────────────────────────────────────────

class StationInfo(BaseModel):
    charger_id: str
    location: str
    charger_type: str
    model: str

class PredictionDetails(BaseModel):
    failing_component: str
    expected_error_code: str
    probability_score: float
    time_to_failure_hours: float
    telemetry_context: str

class Ticket(BaseModel):
    ticket_id: str
    timestamp: str
    status: str
    urgency: str
    station_info: StationInfo
    prediction_details: PredictionDetails

class ChecklistItem(BaseModel):
    task: str
    completed: bool = False
    notes: str = ""

class ChecklistUpdateRequest(BaseModel):
    completed: bool
    notes: Optional[str] = None

class TicketStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="One of: predicted_failure, in_progress, completed, offline")

class ChatRequest(BaseModel):
    message: str
    ticket_id: str

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str
    checklist_item_index: Optional[int] = None  # which checklist item this relates to

class ChatResponse(BaseModel):
    answer: str
    ticket_id: str
    history_length: int

# ──────────────────────────────────────────────
# In-Memory State Store
# ──────────────────────────────────────────────

# Maps ticket_id -> current status string
ticket_states: dict[str, str] = {}

# Maps ticket_id -> list of ChecklistItem (cached after first generation)
ticket_checklists: dict[str, list[dict]] = {}

# Maps ticket_id -> list of ChatMessage dicts
chat_histories: dict[str, list[dict]] = {}

# The raw alerts loaded from JSON (populated on startup)
raw_alerts: list[dict] = []

VALID_STATUSES = {"predicted_failure", "in_progress", "completed", "offline"}
URGENCY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────

DATA_DIR = "dummy_data"
MANUALS_DIR = os.path.join(DATA_DIR, "manuals")
ALERTS_FILE = os.path.join(DATA_DIR, "telemetry_alerts.json")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")

# Global RAG variables
vector_store = None
rag_chain = None


def _load_alerts() -> list[dict]:
    """Load alerts from JSON file and initialize in-memory state."""
    global raw_alerts
    with open(ALERTS_FILE, "r") as f:
        raw_alerts = json.load(f)
    # Initialize ticket states from original data
    for alert in raw_alerts:
        tid = alert["ticket_id"]
        if tid not in ticket_states:
            ticket_states[tid] = alert["status"]
    return raw_alerts


def _get_ticket_by_id(ticket_id: str) -> dict | None:
    """Find a ticket by ID from raw alerts."""
    return next((t for t in raw_alerts if t["ticket_id"] == ticket_id), None)


def _enrich_ticket(ticket: dict) -> dict:
    """Overlay the in-memory status onto a ticket dict."""
    enriched = dict(ticket)
    tid = enriched["ticket_id"]
    if tid in ticket_states:
        enriched["status"] = ticket_states[tid]
    return enriched


def init_rag():
    global vector_store, rag_chain
    print("Initializing RAG Pipeline...")

    # Load alerts into memory on startup
    _load_alerts()
    print(f"Loaded {len(raw_alerts)} alerts into memory.")

    if "GOOGLE_API_KEY" not in os.environ:
        print("WARNING: GOOGLE_API_KEY not found in environment. RAG will not function.")
        return

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

    persist_dir = "./chroma_db"

    if os.path.exists(persist_dir):
        print("Loading existing Chroma DB...")
        vector_store = Chroma(persist_directory=persist_dir, embedding_function=embeddings)
    else:
        print(f"Creating new Chroma DB in {persist_dir}...")
        loader = DirectoryLoader(MANUALS_DIR, glob="**/*.md", loader_cls=TextLoader)
        docs = loader.load()
        print(f"Loaded {len(docs)} manuals.")

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        vector_store = Chroma.from_documents(
            documents=splits, embedding=embeddings, persist_directory=persist_dir
        )

    llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL, temperature=0.1)

    system_prompt = (
        "You are the Data Pigeon Field Tech Copilot, an expert AI assistant for EV repair technicians.\n"
        "You are currently helping a technician on-site with a broken EV charger.\n"
        "Use the following retrieved context from the proprietary repair manuals to answer the technician's questions.\n"
        "If the answer is not in the manuals, say that you don't have that specific data, but provide general electrical mechanic advice.\n"
        "Always emphasize LOTO (Lockout/Tagout) and high-voltage safety.\n\n"
        "Context:\n{context}\n"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    print("RAG Pipeline initialized and ready!")


# ──────────────────────────────────────────────
# App Lifespan
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_rag()
    yield

app = FastAPI(title="Data Pigeon Copilot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# API ROUTES
# ──────────────────────────────────────────────


# ---------- Tickets ----------

@app.get("/api/tickets")
def get_tickets(status: Optional[str] = Query(None, description="Filter by status")):
    """
    Returns the simulated predictive alerts from Data Pigeon.
    Sorted by urgency (critical first) and probability score.
    Optionally filter by status (e.g., ?status=completed).
    """
    try:
        tickets = [_enrich_ticket(t) for t in raw_alerts]

        # Filter by status if provided
        if status:
            if status not in VALID_STATUSES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status '{status}'. Must be one of: {', '.join(VALID_STATUSES)}"
                )
            tickets = [t for t in tickets if t["status"] == status]

        # Sort by urgency (critical first), then by probability score (highest first)
        tickets.sort(
            key=lambda t: (
                URGENCY_ORDER.get(t["urgency"], 99),
                -t["prediction_details"]["probability_score"],
            )
        )

        return tickets
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load alerts: {str(e)}")


@app.get("/api/tickets/{ticket_id}")
def get_ticket(ticket_id: str):
    """Returns a single ticket with its current in-memory status."""
    ticket = _get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return _enrich_ticket(ticket)


@app.patch("/api/tickets/{ticket_id}/status")
def update_ticket_status(ticket_id: str, request: TicketStatusUpdateRequest):
    """Update the status of a ticket (e.g., move to in_progress or completed)."""
    ticket = _get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    if request.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{request.status}'. Must be one of: {', '.join(VALID_STATUSES)}"
        )

    ticket_states[ticket_id] = request.status
    return _enrich_ticket(ticket)


# ---------- Checklists ----------

@app.get("/api/tickets/{ticket_id}/checklist")
def get_ticket_checklist(ticket_id: str):
    """
    Returns the repair checklist for a ticket.
    Generated via RAG on first call, then cached in memory for subsequent calls.
    """
    # Return cached checklist if it exists
    if ticket_id in ticket_checklists:
        return {
            "ticket_id": ticket_id,
            "checklist": ticket_checklists[ticket_id],
        }

    # Generate new checklist via RAG
    if not rag_chain:
        raise HTTPException(
            status_code=500,
            detail="RAG Pipeline not initialized (Check GOOGLE_API_KEY)"
        )

    ticket = _get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    try:
        model = ticket["station_info"]["model"]
        error_code = ticket["prediction_details"]["expected_error_code"]
        context = ticket["prediction_details"]["telemetry_context"]

        prompt = (
            f"Create a concise, step-by-step repair checklist for a technician working on "
            f"a '{model}' charger with expected error code '{error_code}'. "
            f"The telemetry context is: '{context}'. "
            f"Only output a numbered checklist of tasks to perform."
        )

        response = rag_chain.invoke({"input": prompt})

        # Parse the response into checklist items
        raw_steps = response["answer"].split('\n')
        checklist = []
        for step in raw_steps:
            step = step.strip()
            if step and (step[0].isdigit() or step.startswith('-') or step.startswith('*')):
                clean_step = re.sub(r'^(\d+\.|\-|\*)\s*', '', step)
                if clean_step:
                    checklist.append({"task": clean_step, "completed": False, "notes": ""})

        # Fallback if no list format was detected
        if not checklist:
            checklist = [
                {"task": step.strip(), "completed": False, "notes": ""}
                for step in raw_steps
                if step.strip()
            ]

        # Cache the checklist
        ticket_checklists[ticket_id] = checklist

        # Auto-set ticket status to in_progress when checklist is first generated
        if ticket_states.get(ticket_id) not in ("in_progress", "completed"):
            ticket_states[ticket_id] = "in_progress"

        return {
            "ticket_id": ticket_id,
            "checklist": checklist,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/tickets/{ticket_id}/checklist/{item_index}")
def update_checklist_item(ticket_id: str, item_index: int, request: ChecklistUpdateRequest):
    """
    Update a checklist item's completion status and optional notes.
    If all items become completed, the ticket status is auto-set to 'completed'.
    """
    if ticket_id not in ticket_checklists:
        raise HTTPException(
            status_code=404,
            detail=f"No checklist found for ticket {ticket_id}. Generate one first via GET."
        )

    checklist = ticket_checklists[ticket_id]

    if item_index < 0 or item_index >= len(checklist):
        raise HTTPException(
            status_code=400,
            detail=f"Item index {item_index} is out of range. Checklist has {len(checklist)} items (0-{len(checklist) - 1})."
        )

    checklist[item_index]["completed"] = request.completed
    if request.notes is not None:
        checklist[item_index]["notes"] = request.notes

    # Check if all items are now completed -> auto-complete the ticket
    # If an item is unchecked after auto-completion, revert to in_progress
    all_completed = all(item["completed"] for item in checklist)
    if all_completed:
        ticket_states[ticket_id] = "completed"
    elif ticket_states.get(ticket_id) == "completed":
        ticket_states[ticket_id] = "in_progress"

    return {
        "ticket_id": ticket_id,
        "item_index": item_index,
        "item": checklist[item_index],
        "all_completed": all_completed,
        "ticket_status": ticket_states.get(ticket_id, "unknown"),
        "checklist": checklist,
    }


# ---------- AI Chat ----------

@app.post("/api/chat")
def chat_with_copilot(request: ChatRequest):
    """
    Answers a technician's question using the RAG manuals.
    Maintains per-ticket conversation history for multi-turn support.
    """
    if not rag_chain:
        raise HTTPException(
            status_code=500,
            detail="RAG Pipeline not initialized (Check GOOGLE_API_KEY)"
        )

    try:
        # Validate that the ticket exists
        ticket = _get_ticket_by_id(request.ticket_id)
        if not ticket:
            raise HTTPException(status_code=404, detail=f"Ticket {request.ticket_id} not found")

        # Initialize chat history for this ticket if needed
        if request.ticket_id not in chat_histories:
            chat_histories[request.ticket_id] = []

        history = chat_histories[request.ticket_id]

        # Build context from ticket data
        ticket_context = ""
        if ticket:
            model = ticket["station_info"]["model"]
            error_code = ticket["prediction_details"]["expected_error_code"]
            component = ticket["prediction_details"]["failing_component"]
            telemetry = ticket["prediction_details"]["telemetry_context"]
            ticket_context = (
                f"\n\nCurrent Ticket Context:\n"
                f"- Charger: {model}\n"
                f"- Failing Component: {component}\n"
                f"- Expected Error Code: {error_code}\n"
                f"- Telemetry: {telemetry}\n"
            )

        # Build conversation history string (last 10 messages for context window)
        history_str = ""
        recent_history = history[-10:]
        if recent_history:
            history_str = "\n\nConversation History:\n"
            for msg in recent_history:
                role_label = "Technician" if msg["role"] == "user" else "Copilot"
                history_str += f"{role_label}: {msg['content']}\n"

        # Compose the full input with ticket context and history
        full_input = f"{ticket_context}{history_str}\nTechnician's current question: {request.message}"

        response = rag_chain.invoke({"input": full_input})

        now = datetime.now(timezone.utc).isoformat()

        # Store both user message and assistant response in history
        history.append({
            "role": "user",
            "content": request.message,
            "timestamp": now,
            "checklist_item_index": None,
        })
        history.append({
            "role": "assistant",
            "content": response["answer"],
            "timestamp": now,
            "checklist_item_index": None,
        })

        return ChatResponse(
            answer=response["answer"],
            ticket_id=request.ticket_id,
            history_length=len(history),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tickets/{ticket_id}/chat/history")
def get_chat_history(ticket_id: str):
    """Returns the full chat history for a ticket."""
    ticket = _get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    history = chat_histories.get(ticket_id, [])
    return {
        "ticket_id": ticket_id,
        "history": history,
        "message_count": len(history),
    }


# ──────────────────────────────────────────────
# Entry Point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
