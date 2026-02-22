# fixity

An AI-powered mobile assistant for EV maintenance technicians, built for the **SacHack VII**.

## The Mission

Critical infrastructure like EV chargers face constant reliability challenges leading to expensive downtime. Predictive analytics can identify these failures *before* they cause downtime, but there is still a massive gap in how **human technicians** get those insights and execute repairs in the field.

**fixity** bridges this gap. It is an intelligent support agent designed specifically to take predictive maintenance alerts and guide technicians through an ultra-fast, accurately-triaged repair process on-site.

## How it Works

1. **Prioritized Ticket List:** The app surfaces predictive telemetry alerts sorted by urgency (critical first) and failure probability. Technicians see exactly what needs attention and in what order.
2. **Context View:** Clicking a ticket reveals the telemetry trace -- the exact sensor anomalies that led to the prediction -- displayed as interactive line charts (temperature, pressure trends), so the tech has full context before arriving on-site.
3. **AI-Generated Checklist:** A step-by-step repair checklist is dynamically generated via RAG based on the charger model, error code, and telemetry context. The checklist is cached and tracks completion state.
4. **AI Support Chat:** While working through the checklist, the tech can chat with fixity. The chat maintains conversation history per ticket and includes full ticket context for multi-turn troubleshooting. Supports **voice input** (Web Speech API) and **camera/photo input** for hands-free field use.
5. **Guided Troubleshooting (RAG):** fixity is equipped with 24 mock repair manuals covering ABB, Tritium, ChargePoint, and Tesla chargers. It retrieves specific procedures, LOTO safety protocols, and diagnostic steps in real-time.
6. **Ticket Completion:** When all checklist items are marked done, the ticket auto-transitions to `completed`. Unchecking an item reverts it to `in_progress`.

## Business Impact

- **Maximize Uptime:** Pre-emptive repairs happen before a driver encounters a broken charger, preserving customer trust.
- **Reduce Operational Costs:** By guiding techs efficiently and diagnosing the exact part needed *before* the truck rolls, we minimize time-on-site and eliminate costly "return trips."

## Tech Stack

### Backend (Deployed on Render)
- **Runtime:** Python 3.10+
- **Framework:** FastAPI + Uvicorn
- **AI/LLM:** Google Gemini (`gemini-3-flash-preview`) via LangChain
- **RAG Pipeline:** LangChain + ChromaDB vector store + Google Embeddings (`gemini-embedding-001`)
- **Validation:** Pydantic v2
- **State Management:** In-memory (dict-based, resets on server restart)

### Frontend (Deployed on Vercel)
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Charts:** Recharts (telemetry visualization)
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **PWA:** Configured as a Progressive Web App for mobile field use with offline-capable service worker

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/tickets` | List all tickets, sorted by urgency. Optional `?status=` filter. |
| `GET` | `/api/tickets/{ticket_id}` | Get a single ticket with current status. |
| `PATCH` | `/api/tickets/{ticket_id}/status` | Update ticket status (`predicted_failure`, `in_progress`, `completed`, `offline`). |
| `GET` | `/api/tickets/{ticket_id}/checklist` | Get or generate the repair checklist (cached after first call). |
| `PATCH` | `/api/tickets/{ticket_id}/checklist/{item_index}` | Update a checklist item's completion and notes. Auto-completes ticket when all done. |
| `POST` | `/api/chat` | Chat with the AI copilot (with ticket context, conversation memory, and optional image). |
| `GET` | `/api/tickets/{ticket_id}/chat/history` | Retrieve full chat history for a ticket. |
| `POST` | `/api/admin/reset?key=SECRET` | Reset all demo data (statuses, checklists, chat histories) to defaults. |

Interactive API docs available at `/docs` when the server is running.

## Project Structure

```
SacHack26-/
├── main.py                          # FastAPI backend (all endpoints + RAG pipeline)
├── requirements.txt                 # Python dependencies
├── render.yaml                      # Render.com deployment config (backend)
├── .env                             # Environment variables (not committed)
├── dummy_data/
│   ├── telemetry_alerts.json        # 6 simulated predictive failure alerts
│   └── manuals/                     # 24 synthesized repair manuals (RAG knowledge base)
│       ├── ABB_Terra_54_*.md
│       ├── ChargePoint_CT4000_*.md
│       ├── Tesla_Supercharger_V3_*.md
│       └── Tritium_Veefil_RT_*.md
├── chroma_db/                       # Persisted ChromaDB vector store (auto-generated)
└── frontend/
    ├── package.json                 # NPM dependencies & scripts
    ├── vercel.json                  # Vercel deployment config (SPA routing)
    ├── vite.config.ts               # Vite config (React, Tailwind, PWA)
    ├── tsconfig.json                # TypeScript config
    ├── index.html                   # HTML entry point
    ├── public/                      # PWA icons
    └── src/
        ├── main.tsx                 # React entry point
        ├── styles/                  # Tailwind CSS, theme, fonts
        └── app/
            ├── App.tsx              # Root component (RouterProvider)
            ├── routes.ts            # React Router config (5 routes)
            ├── api.ts               # API client functions
            ├── types.ts             # TypeScript interfaces
            ├── mapper.ts            # Backend-to-frontend data mapper
            └── pages/
                ├── TicketList.tsx        # Home: active & past ticket tabs
                ├── TicketDetail.tsx      # Ticket view with telemetry charts
                ├── PastTicketDetail.tsx  # Completed ticket view with AI notes
                ├── ChecklistPage.tsx     # Interactive repair checklist
                └── ChatInterface.tsx     # AI chat with voice/camera input
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- A Google API key with Gemini access

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/LinhHuynh2403/SacHack26-.git
cd SacHack26-

# Create and activate virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file with:
# GOOGLE_API_KEY=your_google_api_key_here
# GEMINI_MODEL=gemini-3-flash-preview  (optional, this is the default)
# ADMIN_SECRET=sachack2026             (optional, for demo reset endpoint)

# Run the server
python main.py
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive Swagger UI.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend dev server starts on `http://localhost:5173` and is accessible on the local network.

> **Note:** The frontend API base URL is configured via the `VITE_API_BASE_URL` environment variable. It defaults to `http://localhost:8000/api` for local development. For production, set it to your Render backend URL (e.g., `https://your-backend.onrender.com/api`).

### Quick Test

```bash
# Get prioritized ticket list
curl http://localhost:8000/api/tickets

# Get a single ticket
curl http://localhost:8000/api/tickets/INC-9001

# Generate a checklist (requires GOOGLE_API_KEY)
curl http://localhost:8000/api/tickets/INC-9001/checklist

# Mark checklist item 0 as completed
curl -X PATCH http://localhost:8000/api/tickets/INC-9001/checklist/0 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Chat with the AI copilot
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "The coolant valve is stuck, what should I do?", "ticket_id": "INC-9001"}'
```

## Deployment

### Backend (Render)

The backend is configured for [Render.com](https://render.com) via `render.yaml`.

1. Connect your GitHub repo to Render.
2. Render will auto-detect the `render.yaml` configuration.
3. Set the `GOOGLE_API_KEY` environment variable in the Render dashboard.

### Frontend (Vercel)

The frontend is configured for [Vercel](https://vercel.com) via `frontend/vercel.json`.

1. Import the repo into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Vercel will auto-detect the Vite build (build command: `npm run build`, output: `dist`).
4. Add the environment variable `VITE_API_BASE_URL` pointing to your Render backend (e.g., `https://your-backend.onrender.com/api`).

## Demo Reset

The app includes a hidden reset feature to restore all data to its initial state between demo presentations. This clears all ticket statuses, generated checklists, and chat histories.

**How to trigger:**

1. **From the UI:** On the home screen, **long-press the technician avatar** (top right) for 3 seconds. A confirmation dialog will appear. Tap "Reset" to restore all data.

2. **From the API:** Send a POST request directly:
   ```bash
   curl -X POST "http://localhost:8000/api/admin/reset?key=sachack2026"
   ```

The default secret key is `sachack2026`. Override it by setting the `ADMIN_SECRET` environment variable.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
