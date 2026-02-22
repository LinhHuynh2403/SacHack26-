// frontend/src/app/api.ts

// You can swap this out with your production URL once deployed
const API_BASE_URL = 'http://localhost:8000';

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

// 2. Sending a chat message to the copilot
export const sendChatMessage = async (message: string, ticketId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // main.py expects a JSON body with keys "message" and "ticket_id"
            body: JSON.stringify({
                message: message,
                ticket_id: ticketId
            }),
        });

        if (!response.ok) {
            throw new Error(`Chat API failed: ${response.statusText}`);
        }

        const data = await response.json();
        // Returns: { answer: "...", ticket_id: "..." }
        return data;
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw error;
    }
};
