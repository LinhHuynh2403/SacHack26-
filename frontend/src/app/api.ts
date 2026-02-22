const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// For production, set VITE_API_BASE_URL to your Render backend URL:
// e.g. https://sachack26-backend.onrender.com/api

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
export async function sendChatMessage(message: string, ticketId: string, stepIdx?: number, imageBase64?: string) {
    // Strip the data URL prefix (e.g. "data:image/jpeg;base64,") to send raw base64
    let cleanedImage: string | undefined;
    if (imageBase64) {
        cleanedImage = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    }

    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // Matches ChatRequest Pydantic model
        body: JSON.stringify({
            message,
            ticket_id: ticketId,
            image_base64: cleanedImage || null,
            step_idx: stepIdx !== undefined ? stepIdx : null,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to send chat message');
    }
    return response.json();
}

// Fetch the conversation history for a specific ticket
export async function fetchChatHistory(ticketId: string, stepIdx?: number) {
    const queryParams = stepIdx !== undefined ? `?step_idx=${stepIdx}` : '';
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/chat/history${queryParams}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch chat history for ticket ${ticketId}`);
    }
    // Returns { ticket_id: string, history: [...], message_count: int }
    return response.json();
}

// Reset all demo data (tickets, checklists, chat histories) back to defaults
export async function resetAllData(): Promise<{ message: string; tickets_reset: number }> {
    const response = await fetch(`${API_BASE_URL}/admin/reset?key=sachack2026`, {
        method: "POST",
    });
    if (!response.ok) {
        throw new Error("Failed to reset demo data");
    }
    return response.json();
}