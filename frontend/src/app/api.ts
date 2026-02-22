const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Fetch all tickets
export async function fetchTickets() {
    const response = await fetch(`${API_BASE_URL}/tickets`);
    if (!response.ok) {
        throw new Error('Failed to fetch tickets');
    }
    return response.json();
}

// Fetch a single ticket by ID
export async function fetchTicket(ticketId: string) {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
    if (!response.ok) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
    }
    return response.json();
}

// Update ticket status
export async function updateTicketStatus(ticketId: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update ticket status for ${ticketId}`);
    }
    return response.json();
}

// Fetch (and trigger RAG generation of) the checklist
export async function fetchChecklist(ticketId: string) {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/checklist`);
    if (!response.ok) {
        throw new Error(`Failed to fetch checklist for ticket ${ticketId}`);
    }
    // Returns { ticket_id: string, checklist: [...] }
    return response.json();
}

// Update a specific checklist item
export async function updateChecklistItem(ticketId: string, index: number, completed: boolean) {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/checklist/${index}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        // Matches ChecklistUpdateRequest Pydantic model
        body: JSON.stringify({ completed }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update checklist item ${index}`);
    }
    return response.json();
}

// Send a chat message to the RAG Copilot
export async function sendChatMessage(message: string, ticketId: string, stepIdx?: number) {
    // We append the step context to the message if it exists, since the backend 
    // ChatRequest currently expects just `message` and `ticket_id`
    const finalMessage = stepIdx !== undefined
        ? `[Regarding Checklist Step ${stepIdx + 1}]: ${message}`
        : message;

    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // Matches ChatRequest Pydantic model
        body: JSON.stringify({
            message: finalMessage,
            ticket_id: ticketId
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to send chat message');
    }
    return response.json();
}

// Fetch the conversation history for a specific ticket
export async function fetchChatHistory(ticketId: string, stepIdx?: number) {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/chat/history`);
    if (!response.ok) {
        throw new Error(`Failed to fetch chat history for ticket ${ticketId}`);
    }
    // Returns { ticket_id: string, history: [...], message_count: int }
    return response.json();
}