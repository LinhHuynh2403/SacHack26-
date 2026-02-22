import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Ticket } from "../types";
import { fetchTicket, fetchChecklist } from "../api";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  MapPin,
  Clock,
  AlertCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MOCK_PAST_TELEMETRY = [
  { timestamp: "09:00", pressure: 3.1, temperature: 40, voltage: 232, current: 15.2 },
  { timestamp: "10:00", pressure: 3.0, temperature: 41, voltage: 231, current: 15.3 },
  { timestamp: "11:00", pressure: 3.2, temperature: 39, voltage: 233, current: 15.1 },
];

export function PastTicketDetail() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!ticketId) return;
      try {
        const alert = await fetchTicket(ticketId);
        const mappedTicket: Ticket = {
          id: alert.ticket_id,
          stationId: alert.station_info.charger_id,
          component: alert.prediction_details.failing_component,
          priority: alert.urgency as any,
          status: 'resolved',
          predictedFailure: alert.prediction_details.telemetry_context,
          assignedTo: "Tech #4521",
          timestamp: alert.timestamp,
          location: alert.station_info.location,
          completedDate: alert.timestamp, // Fallback
        };
        setTicket(mappedTicket);

        const checklistData = await fetchChecklist(ticketId);
        setSteps(checklistData.checklist.map((s: any, idx: number) => ({
          id: idx + 1,
          title: s.task,
          description: s.task, // Fallback
          completed: s.completed,
          aiNote: s.notes
        })) || []);

      } catch (error) {
        console.error("Failed to load past ticket", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [ticketId]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (!ticket) return <div className="p-8 text-center text-gray-500">Ticket not found</div>;

  const telemetry = MOCK_PAST_TELEMETRY;
  const completedSteps = steps;
  const hasAiNotes = completedSteps.some((step) => step.aiNote);

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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{ticket.stationId}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full text-green-700 bg-green-100">
                RESOLVED
              </span>
            </div>
            <p className="text-gray-600 mt-1">{ticket.component}</p>
          </div>
        </div>
      </div>

      {/* Completion Info Banner */}
      <div className="bg-green-600 text-white px-4 py-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Repair Completed</p>
            <p className="text-sm text-green-100 mt-1">
              Completed on {ticket.completedDate ? new Date(ticket.completedDate).toLocaleString() : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Location & Details */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-medium text-gray-900 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {ticket.location}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Predicted At</p>
            <p className="font-medium text-gray-900 mt-1 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(ticket.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-sm text-gray-700">{ticket.predictedFailure}</p>
        </div>
      </div>

      {/* Completed Repair Steps */}
      <div className="px-4 py-4">
        <h2 className="font-semibold text-gray-900 mb-3">Repair Steps Completed</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {completedSteps.map((step) => (
              <div
                key={step.id}
                className={`p-4 ${step.aiNote ? "bg-blue-50" : "bg-white"}`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">
                      Step {step.id}: {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>

                    {/* AI Note for this step */}
                    {step.aiNote && (
                      <div className="mt-3 bg-blue-100 border border-blue-300 rounded-md p-3">
                        <div className="flex items-start gap-2 mb-1">
                          <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs font-semibold text-blue-800">AI NOTE</span>
                        </div>
                        <p className="text-sm text-blue-900 leading-relaxed">
                          {step.aiNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Notes Summary - Only show if there are AI notes */}
      {hasAiNotes && (
        <div className="px-4 pb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Key Learnings</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900">Important Notes from This Repair</h3>
                <p className="text-sm text-blue-700 mt-1">
                  These insights were captured during the repair and can help with future similar issues
                </p>
              </div>
            </div>
            <div className="space-y-2 mt-3">
              {completedSteps
                .filter((step) => step.aiNote)
                .map((step) => (
                  <div key={step.id} className="bg-white rounded-md p-3 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Step {step.id}: {step.title}</p>
                    <p className="text-sm text-gray-700">{step.aiNote}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Context from Repair Day */}
      {telemetry && telemetry.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Telemetry from Repair Day</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-4">
              Sensor data captured on {ticket.completedDate ? new Date(ticket.completedDate).toLocaleDateString() : "repair day"}
            </p>

            {/* Current Readings at time of completion */}
            {telemetry[telemetry.length - 1] && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <span className="text-xs text-green-700">Temperature</span>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {telemetry[telemetry.length - 1].temperature}°C
                  </p>
                  <p className="text-xs text-green-600 mt-1">Normal range</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <span className="text-xs text-green-700">Pressure</span>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {telemetry[telemetry.length - 1].pressure} bar
                  </p>
                  <p className="text-xs text-green-600 mt-1">Normal range</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <span className="text-xs text-blue-700">Voltage</span>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {telemetry[telemetry.length - 1].voltage}V
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Normal range</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <span className="text-xs text-blue-700">Current</span>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {telemetry[telemetry.length - 1].current}A
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Normal range</p>
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="space-y-4">
              {/* Pressure Chart */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pressure Trend During Repair</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="pressure"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Temperature Chart */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Temperature Trend During Repair</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Voltage Chart */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Voltage Trend During Repair</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="voltage"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
