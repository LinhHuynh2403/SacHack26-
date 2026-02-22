import { BackendTicket, Ticket } from "./types";

export function mapBackendTicket(alert: BackendTicket): Ticket {
    return {
        id: alert.ticket_id,
        stationId: alert.station_info.charger_id,
        component: alert.prediction_details.failing_component,
        priority: alert.urgency,
        status: alert.status,
        predictedFailure: alert.prediction_details.telemetry_context,
        assignedTo: "Technician #3560",
        timestamp: alert.timestamp,
        location: alert.station_info.location,
        completedDate: alert.status === 'completed' ? alert.timestamp : undefined,
        aiNotes: alert.ai_notes || [],
        checklistProgress: alert.checklist_progress,
        telemetryHistory: (alert.telemetry_history || alert.telemetry_snapshots || [])
            .filter((s: any) =>
                s.temperature_c !== null ||
                s.connector_temp_c !== null ||
                s.pressure_bar !== null ||
                s.voltage_dc !== null ||
                s.temperature !== null ||
                s.pressure !== null
            )
            .map((s: any) => ({
                timestamp: s.timestamp && s.timestamp.includes('T') ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (s.timestamp || ""),
                temperature: s.temperature ?? s.temperature_c ?? s.connector_temp_c ?? 0,
                pressure: s.pressure ?? s.pressure_bar ?? 0,
                voltage: s.voltage ?? s.voltage_dc ?? s.voltage_ac ?? 0,
                current: s.current ?? s.current_a ?? 0
            }))
    };
}
