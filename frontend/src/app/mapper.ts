import { BackendTicket, Ticket } from "./types";

export function mapBackendTicket(alert: BackendTicket): Ticket {
    return {
        id: alert.ticket_id,
        stationId: alert.station_info.charger_id,
        component: alert.prediction_details.failing_component,
        priority: alert.urgency,
        status: alert.status,
        predictedFailure: alert.prediction_details.telemetry_context,
        assignedTo: "Tech #4521",
        timestamp: alert.timestamp,
        location: alert.station_info.location,
        completedDate: alert.status === 'completed' ? alert.timestamp : undefined,
        aiNotes: alert.ai_notes || [],
        checklistProgress: alert.checklist_progress,
        telemetryHistory: (alert.telemetry_history || alert.telemetry_snapshots || [])
            .filter((s: any) => s.timestamp != null)
            .map((s: any) => ({
                timestamp: s.timestamp && s.timestamp.includes('T') ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (s.timestamp || ""),
                // Core metrics (present on most tickets)
                temperature: s.temperature ?? s.temperature_c ?? s.connector_temp_c ?? 0,
                pressure: s.pressure ?? s.pressure_bar ?? 0,
                voltage: s.voltage ?? s.voltage_dc ?? s.voltage_ac ?? 0,
                current: s.current ?? s.current_a ?? 0,
                // Component-specific sensors
                rfidLatency: s.rfid_latency_ms ?? undefined,
                sessionTimeouts: s.session_timeouts ?? undefined,
                signalStrength: s.signal_strength_dbm ?? undefined,
                isolation: s.isolation_kohm ?? undefined,
                coolantFlow: s.coolant_flow_lpm ?? undefined,
                pumpRpm: s.pump_rpm ?? undefined,
                backlight: s.backlight_pct ?? undefined,
                touchFailures: s.touch_failures_daily ?? undefined,
                heartbeatLatency: s.heartbeat_latency_ms ?? undefined,
                coolantInlet: s.coolant_inlet_c ?? undefined,
                coolantOutlet: s.coolant_outlet_c ?? undefined,
            }))
    };
}
