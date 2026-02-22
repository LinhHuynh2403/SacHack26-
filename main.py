import os
import re
import json
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# LangChain and vector store imports
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    MarkdownHeaderTextSplitter,
)
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

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
    image_base64: Optional[str] = None  # base64-encoded JPEG from camera/photo input
    step_idx: Optional[int] = None  # which checklist step the technician is asking about

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str
    checklist_item_index: Optional[int] = None  # which checklist item this relates to

class ChatResponse(BaseModel):
    answer: str
    ticket_id: str
    history_length: int
    completed_steps: list[int] = []  # indices of checklist steps auto-completed by the AI
    sources: list[str] = []  # source document references used in the answer

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
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "sachack2026")
CHROMA_PERSIST_DIR = "./chroma_db"

# Global RAG variables — we store vector_store + llm separately instead of
# a pre-built chain, so we can control retrieval queries independently of
# the prompt context that gets sent to the LLM.
vector_store = None
llm = None


def _parse_manual_metadata(filepath: str) -> dict[str, str]:
    """Extract charger_model and component from a manual filename.

    Example: 'ABB_Terra_54_Cooling_Manual.md'
           -> {'charger_model': 'ABB_Terra_54', 'component': 'Cooling'}
    """
    basename = Path(filepath).stem  # e.g. 'ABB_Terra_54_Cooling_Manual'
    # Remove trailing '_Manual'
    name = re.sub(r'_Manual$', '', basename)
    # The component is the last segment, everything before is the model
    parts = name.rsplit('_', 1)
    if len(parts) == 2:
        return {"charger_model": parts[0], "component": parts[1]}
    return {"charger_model": name, "component": "General"}


def _build_telemetry_summary(ticket: dict) -> str:
    """Analyze telemetry snapshots and produce a human-readable trend summary
    that can be injected into the LLM prompt context.
    """
    snapshots = ticket.get("telemetry_snapshots", [])
    if not snapshots:
        return "No telemetry snapshot data available."

    # Filter out snapshots where all values are null (unit went offline)
    valid = [s for s in snapshots if any(
        v is not None for k, v in s.items() if k != "timestamp"
    )]
    if not valid:
        return "Unit is offline — all telemetry readings are null."

    lines = [f"Telemetry trend ({len(valid)} readings from {valid[0].get('timestamp', '?')} to {valid[-1].get('timestamp', '?')}):"]

    # Dynamically compute min/max/first/last/trend for every numeric key
    numeric_keys = [
        k for k in valid[0]
        if k != "timestamp" and isinstance(valid[0].get(k), (int, float))
    ]

    for key in numeric_keys:
        values = [s[key] for s in valid if s.get(key) is not None]
        if not values:
            continue
        first, last = values[0], values[-1]
        lo, hi = min(values), max(values)
        change = last - first
        if first != 0:
            pct = abs(change / first) * 100
        else:
            pct = 0.0

        direction = "stable"
        if change > 0:
            direction = "increasing"
        elif change < 0:
            direction = "decreasing"

        label = key.replace('_', ' ').title()
        lines.append(
            f"  - {label}: {first} -> {last} (min={lo}, max={hi}, "
            f"{direction} {pct:.1f}%)"
        )

    return "\n".join(lines)


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
    global vector_store, llm
    print("Initializing RAG Pipeline...")

    # Load alerts into memory on startup
    _load_alerts()
    print(f"Loaded {len(raw_alerts)} alerts into memory.")

    if "GOOGLE_API_KEY" not in os.environ:
        print("WARNING: GOOGLE_API_KEY not found in environment. RAG will not function.")
        return

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

    if os.path.exists(CHROMA_PERSIST_DIR):
        print("Loading existing Chroma DB...")
        vector_store = Chroma(persist_directory=CHROMA_PERSIST_DIR, embedding_function=embeddings)
    else:
        print(f"Creating new Chroma DB in {CHROMA_PERSIST_DIR}...")
        # ── Fix 3: Markdown-aware splitting ──
        # First split by markdown headers to keep sections intact,
        # then sub-split any oversized sections with character-based splitter.
        md_header_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[
                ("#", "manual_title"),
                ("##", "doc_type"),
                ("###", "section"),
            ],
            strip_headers=False,  # keep headers in the chunk text for context
        )
        # Sub-splitter for sections that exceed the chunk size
        sub_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,     # larger chunks to keep procedures intact
            chunk_overlap=200,
        )

        all_documents: list[Document] = []
        manual_files = list(Path(MANUALS_DIR).glob("**/*.md"))
        print(f"Found {len(manual_files)} manual files.")

        for filepath in manual_files:
            raw_text = filepath.read_text(encoding="utf-8")

            # ── Fix 2: Parse metadata from filename ──
            file_meta = _parse_manual_metadata(str(filepath))

            # Split by headers first
            header_chunks = md_header_splitter.split_text(raw_text)

            for chunk in header_chunks:
                # Merge file-level metadata with header metadata
                merged_meta = {**file_meta, **chunk.metadata}
                # Also store the source filename for Fix 4
                merged_meta["source"] = filepath.name

                # Sub-split if the chunk is too large
                if len(chunk.page_content) > 1500:
                    sub_chunks = sub_splitter.split_text(chunk.page_content)
                    for sc in sub_chunks:
                        all_documents.append(Document(
                            page_content=sc,
                            metadata=merged_meta,
                        ))
                else:
                    all_documents.append(Document(
                        page_content=chunk.page_content,
                        metadata=merged_meta,
                    ))

        print(f"Created {len(all_documents)} chunks from {len(manual_files)} manuals.")

        vector_store = Chroma.from_documents(
            documents=all_documents,
            embedding=embeddings,
            persist_directory=CHROMA_PERSIST_DIR,
        )

    # ── Fix 6: ChromaDB is now persisted to CHROMA_PERSIST_DIR ──
    # On subsequent startups it loads from disk without re-embedding.
    # To force a rebuild, delete the chroma_db directory.

    llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL, temperature=0.1)

    print("RAG Pipeline initialized and ready!")


# ──────────────────────────────────────────────
# App Lifespan
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_rag()
    yield

app = FastAPI(title="Field Tech Copilot API", lifespan=lifespan)

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
    Returns the simulated predictive alerts.
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
    if not vector_store or not llm:
        raise HTTPException(
            status_code=500,
            detail="RAG Pipeline not initialized (Check GOOGLE_API_KEY)"
        )

    ticket = _get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    try:
        model = ticket["station_info"]["model"]
        charger_type = ticket["station_info"]["charger_type"]
        component = ticket["prediction_details"]["failing_component"]
        error_code = ticket["prediction_details"]["expected_error_code"]
        context = ticket["prediction_details"]["telemetry_context"]

        # ── Fix 2: Metadata-filtered retrieval ──
        # Build a focused retrieval query (just the repair task),
        # filtered to the correct charger model.
        retrieval_query = (
            f"{model} {component} repair procedure for error {error_code}"
        )
        retriever = vector_store.as_retriever(
            search_kwargs={
                "k": 6,
                "filter": {"charger_model": charger_type},
            }
        )
        retrieved_docs = retriever.invoke(retrieval_query)
        manual_context = "\n\n---\n\n".join(doc.page_content for doc in retrieved_docs)

        # ── Fix 1: Separate retrieval from LLM prompt ──
        # The retrieval query above is clean. Now we build the LLM prompt
        # with the retrieved context injected into the system message.
        checklist_prompt = ChatPromptTemplate.from_messages([
            ("system",
             "You are the Field Tech Copilot. Use the following repair manual excerpts "
             "to create a concise step-by-step repair checklist.\n\n"
             "Manual Context:\n{manual_context}\n"),
            ("human",
             "Create a concise, step-by-step repair checklist for a technician working on "
             "a '{model}' charger with expected error code '{error_code}'. "
             "The telemetry context is: '{telemetry_context}'. "
             "Only output a numbered checklist of tasks to perform."),
        ])

        chain = checklist_prompt | llm
        response = chain.invoke({
            "manual_context": manual_context,
            "model": model,
            "error_code": error_code,
            "telemetry_context": context,
        })

        # Parse the response into checklist items
        raw_steps = response.content.split('\n')
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
    When step_idx is provided, injects the specific checklist step context
    and can auto-detect step completions via structured markers.

    RAG improvements applied:
    - Fix 1: Retrieval query is the user's question only (no prompt stuffing)
    - Fix 2: Retrieval is filtered by charger_model metadata
    - Fix 3: Uses markdown-aware chunks with k=6
    - Fix 4: Source document references included in response
    - Fix 5: Telemetry trend analysis injected into prompt context
    """
    if not vector_store or not llm:
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

        # ── Fix 1: Build a clean retrieval query ──
        # Use only the user's message + current step task (if any) for retrieval.
        # This prevents ticket context, history, and instructions from diluting
        # the semantic search.
        retrieval_query = request.message
        if (request.step_idx is not None and
                request.ticket_id in ticket_checklists and
                0 <= request.step_idx < len(ticket_checklists[request.ticket_id])):
            step_task = ticket_checklists[request.ticket_id][request.step_idx]["task"]
            retrieval_query = f"{step_task}: {request.message}"

        # ── Fix 2: Metadata-filtered retrieval ──
        charger_type = ticket["station_info"]["charger_type"]
        retriever = vector_store.as_retriever(
            search_kwargs={
                "k": 6,  # Fix 3: increased from 3 to get more complete procedures
                "filter": {"charger_model": charger_type},
            }
        )
        retrieved_docs = retriever.invoke(retrieval_query)

        # ── Fix 4: Extract source references ──
        source_set: set[str] = set()
        for doc in retrieved_docs:
            src = doc.metadata.get("source", "")
            section = doc.metadata.get("section", "")
            if src:
                ref = src.replace('.md', '').replace('_', ' ')
                if section:
                    ref = f"{ref} - {section}"
                source_set.add(ref)
        sources = sorted(source_set)

        manual_context = "\n\n---\n\n".join(doc.page_content for doc in retrieved_docs)

        # ── Build structured context for the LLM (NOT for the retriever) ──

        # Ticket context
        model = ticket["station_info"]["model"]
        error_code = ticket["prediction_details"]["expected_error_code"]
        component = ticket["prediction_details"]["failing_component"]
        telemetry_text = ticket["prediction_details"]["telemetry_context"]
        ticket_context = (
            f"Current Ticket Context:\n"
            f"- Charger: {model}\n"
            f"- Failing Component: {component}\n"
            f"- Expected Error Code: {error_code}\n"
            f"- Telemetry Summary: {telemetry_text}\n"
        )

        # ── Fix 5: Telemetry trend analysis ──
        telemetry_trends = _build_telemetry_summary(ticket)

        # Checklist context
        checklist_context = ""
        if request.ticket_id in ticket_checklists:
            checklist = ticket_checklists[request.ticket_id]
            checklist_overview = "\nRepair Checklist Overview:\n"
            for i, item in enumerate(checklist):
                status = "DONE" if item["completed"] else "PENDING"
                marker = " <-- CURRENT STEP" if (request.step_idx is not None and i == request.step_idx) else ""
                checklist_overview += f"  Step {i}: [{status}] {item['task']}{marker}\n"
            checklist_context += checklist_overview

            if request.step_idx is not None and 0 <= request.step_idx < len(checklist):
                current_step = checklist[request.step_idx]
                checklist_context += (
                    f"\nThe technician is currently working on Step {request.step_idx}: \"{current_step['task']}\"\n"
                    f"Step status: {'Completed' if current_step['completed'] else 'Not yet completed'}\n"
                )
                if current_step.get("notes"):
                    checklist_context += f"Step notes: {current_step['notes']}\n"

        # Conversation history (last 10 messages)
        history_str = ""
        recent_history = history[-10:]
        if recent_history:
            history_str = "\nConversation History:\n"
            for msg in recent_history:
                role_label = "Technician" if msg["role"] == "user" else "Copilot"
                history_str += f"{role_label}: {msg['content']}\n"

        # Image context
        image_context = ""
        if request.image_base64:
            image_context = (
                "\n[The technician has attached a photo of the issue. "
                "They are showing you what they see on-site. "
                "Please acknowledge the photo and provide visual diagnosis guidance "
                "based on the repair context above.]\n"
            )

        # Step completion detection instruction
        step_completion_instruction = ""
        if request.step_idx is not None and request.ticket_id in ticket_checklists:
            step_completion_instruction = (
                "\n\nIMPORTANT: If the technician's message indicates they have successfully completed "
                "the current step (e.g., they say 'done', 'finished', 'completed', 'fixed it', "
                "'it's working now', 'all good', 'checked', or describe having performed the action), "
                "append the marker [STEP_COMPLETE:{step_idx}] at the very end of your response. "
                "Only include this marker if the technician clearly confirms the step is done. "
                "Do NOT include the marker if they are just asking questions or need more guidance.\n"
            ).format(step_idx=request.step_idx)

        # ── Fix 1: Assemble the prompt with clean separation ──
        # System message gets: manual context + ticket context + telemetry + checklist + history
        # Human message gets: ONLY the technician's question
        chat_prompt = ChatPromptTemplate.from_messages([
            ("system",
             "You are the Field Tech Copilot, an expert AI assistant for EV repair technicians.\n"
             "You are currently helping a technician on-site with a broken EV charger.\n"
             "Use the following retrieved context from the proprietary repair manuals to answer "
             "the technician's questions.\n"
             "If the answer is not in the manuals, say that you don't have that specific data, "
             "but provide general electrical mechanic advice.\n"
             "Always emphasize LOTO (Lockout/Tagout) and high-voltage safety.\n"
             "Keep answers concise and field-practical.\n\n"
             "Repair Manual Context:\n{manual_context}\n\n"
             "{ticket_context}\n"
             "{telemetry_trends}\n"
             "{checklist_context}\n"
             "{history_str}\n"
             "{image_context}\n"
             "{step_completion_instruction}\n"),
            ("human", "{question}"),
        ])

        chain = chat_prompt | llm
        response = chain.invoke({
            "manual_context": manual_context,
            "ticket_context": ticket_context,
            "telemetry_trends": telemetry_trends,
            "checklist_context": checklist_context,
            "history_str": history_str,
            "image_context": image_context,
            "step_completion_instruction": step_completion_instruction,
            "question": request.message,
        })

        now = datetime.now(timezone.utc).isoformat()
        answer_text = response.content

        # Parse and process [STEP_COMPLETE:N] markers
        completed_steps: list[int] = []
        step_complete_pattern = r'\[STEP_COMPLETE:(\d+)\]'
        matches = re.findall(step_complete_pattern, answer_text)
        for match in matches:
            step_index = int(match)
            if (request.ticket_id in ticket_checklists and
                    0 <= step_index < len(ticket_checklists[request.ticket_id])):
                ticket_checklists[request.ticket_id][step_index]["completed"] = True
                completed_steps.append(step_index)

        # Strip the markers from the displayed response
        clean_answer = re.sub(step_complete_pattern, '', answer_text).strip()

        # Store both user message and assistant response in history
        step_idx_val = request.step_idx if request.step_idx is not None else None
        history.append({
            "role": "user",
            "content": request.message,
            "timestamp": now,
            "checklist_item_index": step_idx_val,
        })
        history.append({
            "role": "assistant",
            "content": clean_answer,
            "timestamp": now,
            "checklist_item_index": step_idx_val,
        })

        return ChatResponse(
            answer=clean_answer,
            ticket_id=request.ticket_id,
            history_length=len(history),
            completed_steps=completed_steps,
            sources=sources,
        )
    except HTTPException:
        raise
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


# ---------- Admin / Demo ----------

@app.post("/api/admin/reset")
def reset_all_data(key: str = Query(..., description="Admin secret key")):
    """
    Reset all mutable state (ticket statuses, checklists, chat histories)
    back to defaults. Used to reset the demo between presentations.
    Requires the ADMIN_SECRET key as a query parameter.
    """
    if key != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid admin key")

    ticket_states.clear()
    ticket_checklists.clear()
    chat_histories.clear()

    # Re-seed ticket statuses from original alert data
    for alert in raw_alerts:
        ticket_states[alert["ticket_id"]] = alert["status"]

    return {
        "message": "All data reset successfully",
        "tickets_reset": len(raw_alerts),
        "checklists_cleared": True,
        "chat_histories_cleared": True,
    }


# ──────────────────────────────────────────────
# Entry Point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)