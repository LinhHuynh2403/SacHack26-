// frontend/src/app/api.ts

// You can swap this out with your production URL once deployed
const API_BASE_URL = 'https://sachack26-backend.onrender.com';

// 1. Fetching all the tickets
export const fetchTickets = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets`);
        if (!response.ok) {
            throw new Error(`Failed to fetch tickets: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching tickets:", error);
        throw error;
    }
};

// 1.5 Fetching a single ticket
export const fetchTicket = async (ticketId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ticket: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching ticket:", error);
        throw error;
    }
};

// 2. Sending a chat message to the copilot
export const sendChatMessage = async (message: string, ticket_id: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: message,
                ticket_id: ticket_id
            }),
        });

        if (!response.ok) {
            throw new Error(`Chat API failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw error;
    }
};

// 3. Update ticket status
export const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error(`Failed to update status: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating ticket status:", error);
        throw error;
    }
};

// 4. Fetch checklist
export const fetchChecklist = async (ticketId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/checklist`);
        if (!response.ok) {
            throw new Error(`Failed to fetch checklist: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching checklist:", error);
        throw error;
    }
};

// 5. Update checklist item
export const updateChecklistItem = async (ticketId: string, itemIndex: number, completed: boolean, notes?: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/checklist/${itemIndex}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ completed, notes }),
        });
        if (!response.ok) {
            throw new Error(`Failed to update checklist item: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating checklist item:", error);
        throw error;
    }
};

// 6. Fetch chat history
export const fetchChatHistory = async (ticketId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/chat/history`);
        if (!response.ok) {
            throw new Error(`Failed to fetch chat history: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching chat history:", error);
        throw error;
    }
};
