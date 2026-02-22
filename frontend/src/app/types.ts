// frontend/src/app/types.ts

export interface Ticket {
    id: string;
    stationId: string;
    component: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'assigned' | 'in-progress' | 'resolved' | 'offline';
    predictedFailure: string;
    assignedTo: string;
    timestamp: string;
    location: string;
    completedDate?: string;
    aiNotes?: string[];
    completedSteps?: Array<{
        id: number;
        title: string;
        description: string;
        completed: boolean;
        aiNote?: string;
    }>;
    checklistProgress?: {
        total: number;
        completed: number;
        percentage: number;
    };
    telemetryHistory?: Array<{
        timestamp: string;
        pressure: number;
        temperature: number;
        voltage: number;
        current: number;
    }>;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
    image?: string;
    checklist_item_index?: number;
}

export interface ChecklistItem {
    task: string;
    completed: boolean;
    notes: string;
}
