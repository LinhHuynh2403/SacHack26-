// frontend/src/app/types.ts

export type TicketStatus = 'predicted_failure' | 'in_progress' | 'completed' | 'offline';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Ticket {
    id: string;
    stationId: string;
    component: string;
    priority: TicketPriority;
    status: TicketStatus;
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
        // Component-specific sensor fields
        rfidLatency?: number;
        sessionTimeouts?: number;
        signalStrength?: number;
        isolation?: number;
        coolantFlow?: number;
        pumpRpm?: number;
        backlight?: number;
        touchFailures?: number;
        heartbeatLatency?: number;
        coolantInlet?: number;
        coolantOutlet?: number;
    }>;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    image?: string;
    checklist_item_index?: number;
}

export interface StationInfo {
    charger_id: string;
    location: string;
    charger_type: string;
    model: string;
}

export interface PredictionDetails {
    failing_component: string;
    expected_error_code: string;
    probability_score: number;
    time_to_failure_hours: number;
    telemetry_context: string;
}

export interface BackendTicket {
    ticket_id: string;
    timestamp: string;
    status: TicketStatus;
    urgency: TicketPriority;
    station_info: StationInfo;
    prediction_details: PredictionDetails;
    ai_notes?: string[];
    checklist_progress?: {
        total: number;
        completed: number;
        percentage: number;
    };
    telemetry_snapshots?: Array<any>;
    telemetry_history?: Array<any>;
}

export interface ChecklistItem {
    task: string;
    completed: boolean;
    notes: string;
}
