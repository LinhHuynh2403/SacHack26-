import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain and vector store imports
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI(title="Data Pigeon Copilot API")

# Enable CORS for the frontend app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DATA_DIR = "dummy_data"
MANUALS_DIR = os.path.join(DATA_DIR, "manuals")
ALERTS_FILE = os.path.join(DATA_DIR, "telemetry_alerts.json")

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")

# Global variables to hold our RAG chain
vector_store = None
rag_chain = None

def init_rag():
    global vector_store, rag_chain
    print("Initializing RAG Pipeline...")

    # 3. Create Vector Store (using Google's Embeddings)
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
        
        # 1. Load the 24 dummy manuals
        loader = DirectoryLoader(MANUALS_DIR, glob="**/*.md", loader_cls=TextLoader)
        docs = loader.load()
        print(f"Loaded {len(docs)} manuals.")

        # 2. Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        vector_store = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=persist_dir)

    # 4. Create the LLM (Gemini Flash/Pro)
    llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL, temperature=0.1)

    # 5. Create the prompt template
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

    # 6. Build the retrieval chain
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    print("RAG Pipeline initialized and ready!")

@app.on_event("startup")
async def startup_event():
    init_rag()

# ---------- API ROUTES ----------

@app.get("/api/tickets")
def get_tickets():
    """Returns the simulated predictive alerts from Data Pigeon."""
    try:
        with open(ALERTS_FILE, "r") as f:
            alerts = json.load(f)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load alerts: {str(e)}")

class ChatRequest(BaseModel):
    message: str
    ticket_id: str

@app.post("/api/chat")
def chat_with_copilot(request: ChatRequest):
    """Answers a technician's question using the RAG manuals."""
    if not rag_chain:
        raise HTTPException(status_code=500, detail="RAG Pipeline not initialized (Check GOOGLE_API_KEY)")
    
    try:
        response = rag_chain.invoke({"input": request.message})
        return {
            "answer": response["answer"],
            "ticket_id": request.ticket_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
