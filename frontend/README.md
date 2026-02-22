# Field Tech Copilot - Frontend

The frontend for the **Field Tech Copilot**, an AI-powered mobile assistant for EV charger maintenance technicians. Built as a Progressive Web App (PWA) for hands-free field use.

UI originally designed in [Figma](https://www.figma.com/design/cqk5aRMklpyMTTSRBkJBo6/EV-Charger-Maintenance-App).

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool + dev server)
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI primitives)
- **React Router v7** (client-side routing)
- **Recharts** (telemetry line charts)
- **Motion** (Framer Motion animations)
- **Material UI** + **Lucide** icons
- **PWA** via `vite-plugin-pwa` (offline-capable, installable on mobile)

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | TicketList | Active and past ticket tabs, sorted by urgency |
| `/ticket/:ticketId` | TicketDetail | Ticket context with telemetry charts |
| `/past-ticket/:ticketId` | PastTicketDetail | Completed ticket view with AI-generated notes |
| `/checklist/:ticketId` | ChecklistPage | Interactive repair checklist with progress tracking |
| `/chat/:ticketId` | ChatInterface | AI copilot chat with voice and camera input |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

### API Configuration

The backend API base URL is configured in `src/app/api.ts`. For local development, update it to point to your local backend:

```typescript
const API_BASE_URL = "http://localhost:8000";
```

The production deployment points to the hosted backend on Render.

## Project Structure

```
frontend/
├── index.html               # HTML entry point
├── package.json              # Dependencies & scripts
├── vite.config.ts            # Vite config (React, Tailwind, PWA)
├── tsconfig.json             # TypeScript config
├── public/                   # PWA icons (192px, 512px)
└── src/
    ├── main.tsx              # React entry point
    ├── styles/
    │   ├── index.css         # CSS entry (imports fonts, tailwind, theme)
    │   ├── tailwind.css      # Tailwind v4 setup
    │   └── theme.css         # CSS custom properties (light/dark theme)
    └── app/
        ├── App.tsx           # Root component (RouterProvider)
        ├── routes.ts         # Route definitions
        ├── api.ts            # API client (6 functions)
        ├── types.ts          # TypeScript interfaces (Ticket, ChatMessage, ChecklistItem)
        └── pages/
            ├── TicketList.tsx
            ├── TicketDetail.tsx
            ├── PastTicketDetail.tsx
            ├── ChecklistPage.tsx
            └── ChatInterface.tsx
```

## Attributions

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for credits (shadcn/ui, Unsplash).
