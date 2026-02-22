import { useEffect, useState } from "react";
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

  const latestData = telemetry?.[telemetry.length - 1];

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
            Data leading up to the prediction (last 30 minutes)
          </p>

          {/* Current Readings */}
          {latestData && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-700">Temperature</span>
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {latestData.temperature}°C
                </p>
                <p className="text-xs text-orange-600 mt-1">Above normal (35-50°C)</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-700">Pressure</span>
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {latestData.pressure} bar
                </p>
                <p className="text-xs text-red-600 mt-1">Below normal (2.5-3.5 bar)</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-700">Voltage</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {latestData.voltage}V
                </p>
                <p className="text-xs text-blue-600 mt-1">Normal range</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-700">Current</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {latestData.current}A
                </p>
                <p className="text-xs text-blue-600 mt-1">Normal range</p>
              </div>
            </div>
          )}

          {/* Charts */}
          {telemetry && (
            <div className="space-y-4">
              {/* Pressure Chart */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pressure Trend</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="pressure"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Temperature Chart */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Temperature Trend</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
