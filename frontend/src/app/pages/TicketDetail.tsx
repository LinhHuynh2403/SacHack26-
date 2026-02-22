import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router";
import { Ticket, BackendTicket } from "../types";
import { fetchTicket, fetchChecklist } from "../api";
import { mapBackendTicket } from "../mapper";
import { ErrorState } from "../ErrorHandling/ErrorState";
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


// ── Metric definition type ──────────────────────────────
interface MetricDef {
  key: string;
  label: string;
  unit: string;
  chartColor: string;
  getStatus: (value: number) => { label: string; range: string; color: string; Icon: typeof TrendingUp | typeof TrendingDown | undefined };
}

// ── Metric definitions ──────────────────────────────────

const METRIC_DEFS: Record<string, MetricDef> = {
  temperature: {
    key: "temperature", label: "Temperature", unit: "°C", chartColor: "#f97316",
    getStatus: (v) => {
      if (v > 60) return { label: "Critical", range: ">60°C", color: "red", Icon: TrendingUp };
      if (v > 50) return { label: "Above normal", range: "35-50°C", color: "orange", Icon: TrendingUp };
      if (v < 20) return { label: "Below normal", range: "35-50°C", color: "blue", Icon: TrendingDown };
      return { label: "Normal range", range: "35-50°C", color: "green", Icon: undefined };
    },
  },
  pressure: {
    key: "pressure", label: "Pressure", unit: " bar", chartColor: "#ef4444",
    getStatus: (v) => {
      if (v < 1.5) return { label: "Critical low", range: "2.5-3.5 bar", color: "red", Icon: TrendingDown };
      if (v < 2.5) return { label: "Below normal", range: "2.5-3.5 bar", color: "red", Icon: TrendingDown };
      if (v > 3.5) return { label: "Above normal", range: "2.5-3.5 bar", color: "orange", Icon: TrendingUp };
      return { label: "Normal range", range: "2.5-3.5 bar", color: "green", Icon: undefined };
    },
  },
  voltage: {
    key: "voltage", label: "Voltage", unit: "V", chartColor: "#3b82f6",
    getStatus: (v) => {
      if (v < 380) return { label: "Below normal", range: "390-410V", color: "red", Icon: TrendingDown };
      if (v < 390) return { label: "Slightly low", range: "390-410V", color: "orange", Icon: TrendingDown };
      if (v > 410) return { label: "Above normal", range: "390-410V", color: "orange", Icon: TrendingUp };
      return { label: "Normal range", range: "390-410V", color: "blue", Icon: undefined };
    },
  },
  current: {
    key: "current", label: "Current", unit: "A", chartColor: "#8b5cf6",
    getStatus: (v) => {
      if (v > 200) return { label: "High draw", range: "<150A", color: "orange", Icon: TrendingUp };
      if (v > 150) return { label: "Elevated", range: "<150A", color: "orange", Icon: TrendingUp };
      return { label: "Normal range", range: "<150A", color: "blue", Icon: undefined };
    },
  },
  rfidLatency: {
    key: "rfidLatency", label: "RFID Latency", unit: "ms", chartColor: "#ef4444",
    getStatus: (v) => {
      if (v > 1500) return { label: "Critical", range: "<300ms", color: "red", Icon: TrendingUp };
      if (v > 500) return { label: "Degraded", range: "<300ms", color: "orange", Icon: TrendingUp };
      return { label: "Normal range", range: "<300ms", color: "green", Icon: undefined };
    },
  },
  sessionTimeouts: {
    key: "sessionTimeouts", label: "Session Timeouts", unit: "", chartColor: "#dc2626",
    getStatus: (v) => {
      if (v >= 3) return { label: "Frequent", range: "0 expected", color: "red", Icon: TrendingUp };
      if (v >= 1) return { label: "Intermittent", range: "0 expected", color: "orange", Icon: TrendingUp };
      return { label: "None", range: "0 expected", color: "green", Icon: undefined };
    },
  },
  signalStrength: {
    key: "signalStrength", label: "Signal Strength", unit: " dBm", chartColor: "#6366f1",
    getStatus: (v) => {
      if (v < -90) return { label: "No signal", range: "> -80 dBm", color: "red", Icon: TrendingDown };
      if (v < -80) return { label: "Weak", range: "> -80 dBm", color: "orange", Icon: TrendingDown };
      return { label: "Adequate", range: "> -80 dBm", color: "green", Icon: undefined };
    },
  },
  isolation: {
    key: "isolation", label: "Isolation", unit: " kOhm", chartColor: "#ef4444",
    getStatus: (v) => {
      if (v < 150) return { label: "Critical low", range: ">500 kOhm", color: "red", Icon: TrendingDown };
      if (v < 300) return { label: "Degraded", range: ">500 kOhm", color: "orange", Icon: TrendingDown };
      return { label: "Normal range", range: ">500 kOhm", color: "green", Icon: undefined };
    },
  },
  coolantFlow: {
    key: "coolantFlow", label: "Coolant Flow", unit: " L/min", chartColor: "#06b6d4",
    getStatus: (v) => {
      if (v < 5) return { label: "Low flow", range: "6-8 L/min", color: "red", Icon: TrendingDown };
      if (v < 6) return { label: "Below normal", range: "6-8 L/min", color: "orange", Icon: TrendingDown };
      return { label: "Normal range", range: "6-8 L/min", color: "green", Icon: undefined };
    },
  },
  pumpRpm: {
    key: "pumpRpm", label: "Pump RPM", unit: " RPM", chartColor: "#14b8a6",
    getStatus: (v) => {
      if (v < 2700) return { label: "Critical low", range: "3000-3500", color: "red", Icon: TrendingDown };
      if (v < 3000) return { label: "Below normal", range: "3000-3500", color: "orange", Icon: TrendingDown };
      return { label: "Normal range", range: "3000-3500", color: "green", Icon: undefined };
    },
  },
  backlight: {
    key: "backlight", label: "Backlight", unit: "%", chartColor: "#f59e0b",
    getStatus: (v) => {
      if (v < 60) return { label: "Critical low", range: ">85%", color: "red", Icon: TrendingDown };
      if (v < 75) return { label: "Degraded", range: ">85%", color: "orange", Icon: TrendingDown };
      return { label: "Normal range", range: ">85%", color: "green", Icon: undefined };
    },
  },
  touchFailures: {
    key: "touchFailures", label: "Touch Failures", unit: "/day", chartColor: "#dc2626",
    getStatus: (v) => {
      if (v >= 5) return { label: "Frequent", range: "0 expected", color: "red", Icon: TrendingUp };
      if (v >= 1) return { label: "Intermittent", range: "0 expected", color: "orange", Icon: TrendingUp };
      return { label: "None", range: "0 expected", color: "green", Icon: undefined };
    },
  },
  heartbeatLatency: {
    key: "heartbeatLatency", label: "Heartbeat Latency", unit: "ms", chartColor: "#e11d48",
    getStatus: (v) => {
      if (v > 5000) return { label: "Critical", range: "<500ms", color: "red", Icon: TrendingUp };
      if (v > 1000) return { label: "Degraded", range: "<500ms", color: "orange", Icon: TrendingUp };
      return { label: "Normal range", range: "<500ms", color: "green", Icon: undefined };
    },
  },
  coolantInlet: {
    key: "coolantInlet", label: "Coolant Inlet", unit: "°C", chartColor: "#0ea5e9",
    getStatus: (v) => {
      if (v > 35) return { label: "High", range: "25-30°C", color: "orange", Icon: TrendingUp };
      return { label: "Normal range", range: "25-30°C", color: "green", Icon: undefined };
    },
  },
  coolantOutlet: {
    key: "coolantOutlet", label: "Coolant Outlet", unit: "°C", chartColor: "#f97316",
    getStatus: (v) => {
      if (v > 45) return { label: "High", range: "35-42°C", color: "orange", Icon: TrendingUp };
      if (v > 42) return { label: "Elevated", range: "35-42°C", color: "orange", Icon: TrendingUp };
      return { label: "Normal range", range: "35-42°C", color: "green", Icon: undefined };
    },
  },
};

// Core metrics always checked; component-specific ones only shown if data exists
const CORE_KEYS = ["temperature", "pressure", "voltage", "current"];
const COMPONENT_KEYS = [
  "rfidLatency", "sessionTimeouts", "signalStrength",
  "isolation", "coolantFlow", "pumpRpm",
  "backlight", "touchFailures",
  "heartbeatLatency",
  "coolantInlet", "coolantOutlet",
];

const colorMap: Record<string, { bg: string; border: string; label: string; value: string; text: string }> = {
  red: { bg: "bg-red-50", border: "border-red-200", label: "text-red-700", value: "text-red-900", text: "text-red-600" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", label: "text-orange-700", value: "text-orange-900", text: "text-orange-600" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", label: "text-blue-700", value: "text-blue-900", text: "text-blue-600" },
  green: { bg: "bg-green-50", border: "border-green-200", label: "text-green-700", value: "text-green-900", text: "text-green-600" },
};


export function TicketDetail() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setError(null);
    try {
      const alert: BackendTicket = await fetchTicket(ticketId);
      setTicket(mapBackendTicket(alert));

      const checklistData = await fetchChecklist(ticketId);
      setSteps(checklistData?.checklist || []);

    } catch (err: any) {
      console.error("Failed to load ticket details", err);
      setError("Unable to retrieve ticket details. The connection to the maintenance server was interrupted.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const telemetry = ticket?.telemetryHistory || [];
  const latestData = telemetry?.[telemetry.length - 1];

  // Detect which metrics have real data (non-zero, non-undefined) in the telemetry
  const activeMetrics = useMemo(() => {
    if (telemetry.length === 0) return [];

    const hasData = (key: string): boolean =>
      telemetry.some((s: any) => s[key] !== undefined && s[key] !== null && s[key] !== 0);

    // Core metrics: include only if they have non-zero data
    const coreActive = CORE_KEYS.filter(hasData);

    // Component-specific: include if any snapshot has the field
    const componentActive = COMPONENT_KEYS.filter(hasData);

    // Prioritize component-specific metrics first (they're the interesting ones for the ticket),
    // then core metrics
    return [...componentActive, ...coreActive];
  }, [telemetry]);

  // Split into cards (top 4) and charts (top 4 most relevant)
  const cardMetrics = activeMetrics.slice(0, 4);
  const chartMetrics = activeMetrics.slice(0, 4);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-12">
        <ErrorState
          title="Ticket Load Error"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  if (!ticket) {
    return <div className="p-8 text-center text-gray-500">Ticket not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-blue-600 mb-3">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Tickets</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.stationId}</h1>
            <p className="text-gray-600 mt-1">{ticket.component}</p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-red-600 text-white px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{ticket.predictedFailure}</p>
            <p className="text-sm text-red-100 mt-1">Predicted at {new Date(ticket.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <p className="text-sm text-gray-600">Location</p>
        <p className="font-medium text-gray-900 mt-1">{ticket.location}</p>
      </div>

      {/* Repair Checklist Button */}
      <div className="px-4 py-4">
        <Link
          to={`/checklist/${ticketId}`}
          className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Repair Checklist</h3>
                <p className="text-sm text-gray-600">
                  {steps.length} steps to complete this repair
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Telemetry Context */}
      <div className="px-4 pb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Telemetry Context</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-4">
            Sensor data leading up to the prediction
          </p>

          {/* Dynamic Reading Cards */}
          {latestData && cardMetrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {cardMetrics.map((metricKey) => {
                const def = METRIC_DEFS[metricKey];
                if (!def) return null;
                const value = (latestData as any)[metricKey] ?? 0;
                const status = def.getStatus(value);
                const c = colorMap[status.color];
                return (
                  <div key={metricKey} className={`${c.bg} border ${c.border} rounded-md p-3`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${c.label}`}>{def.label}</span>
                      {status.Icon && <status.Icon className={`w-4 h-4 ${c.text}`} />}
                    </div>
                    <p className={`text-2xl font-bold ${c.value} mt-1`}>
                      {value !== null && value !== undefined ? value : "N/A"}{def.unit}
                    </p>
                    <p className={`text-xs ${c.text} mt-1`}>{status.label} ({status.range})</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic Charts */}
          {telemetry.length > 0 && chartMetrics.length > 0 && (
            <div className="space-y-4">
              {chartMetrics.map((metricKey) => {
                const def = METRIC_DEFS[metricKey];
                if (!def) return null;
                return (
                  <div key={metricKey}>
                    <p className="text-sm font-medium text-gray-700 mb-2">{def.label} Trend</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={telemetry}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                        <Tooltip
                          formatter={(value: number) => [`${value}${def.unit}`, def.label]}
                        />
                        <Line
                          type="monotone"
                          dataKey={metricKey}
                          stroke={def.chartColor}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
