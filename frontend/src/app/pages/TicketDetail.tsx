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

  // Dynamic threshold evaluation for telemetry cards
  const getTemperatureStatus = (temp: number) => {
    if (temp > 60) return { label: "Critical", range: ">60°C", color: "red", Icon: TrendingUp };
    if (temp > 50) return { label: "Above normal", range: "35-50°C", color: "orange", Icon: TrendingUp };
    if (temp < 20) return { label: "Below normal", range: "35-50°C", color: "blue", Icon: TrendingDown };
    return { label: "Normal range", range: "35-50°C", color: "green", Icon: undefined };
  };

  const getPressureStatus = (pressure: number) => {
    if (pressure < 1.5) return { label: "Critical low", range: "2.5-3.5 bar", color: "red", Icon: TrendingDown };
    if (pressure < 2.5) return { label: "Below normal", range: "2.5-3.5 bar", color: "red", Icon: TrendingDown };
    if (pressure > 3.5) return { label: "Above normal", range: "2.5-3.5 bar", color: "orange", Icon: TrendingUp };
    return { label: "Normal range", range: "2.5-3.5 bar", color: "green", Icon: undefined };
  };

  const getVoltageStatus = (voltage: number) => {
    if (voltage < 380) return { label: "Below normal", range: "390-410V", color: "red", Icon: TrendingDown };
    if (voltage < 390) return { label: "Slightly low", range: "390-410V", color: "orange", Icon: TrendingDown };
    if (voltage > 410) return { label: "Above normal", range: "390-410V", color: "orange", Icon: TrendingUp };
    return { label: "Normal range", range: "390-410V", color: "blue", Icon: undefined };
  };

  const getCurrentStatus = (current: number) => {
    if (current > 200) return { label: "High draw", range: "<150A", color: "orange", Icon: TrendingUp };
    if (current > 150) return { label: "Elevated", range: "<150A", color: "orange", Icon: TrendingUp };
    return { label: "Normal range", range: "<150A", color: "blue", Icon: undefined };
  };

  const colorMap: Record<string, { bg: string; border: string; label: string; value: string; text: string }> = {
    red: { bg: "bg-red-50", border: "border-red-200", label: "text-red-700", value: "text-red-900", text: "text-red-600" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", label: "text-orange-700", value: "text-orange-900", text: "text-orange-600" },
    blue: { bg: "bg-blue-50", border: "border-blue-200", label: "text-blue-700", value: "text-blue-900", text: "text-blue-600" },
    green: { bg: "bg-green-50", border: "border-green-200", label: "text-green-700", value: "text-green-900", text: "text-green-600" },
  };

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
          {latestData && (() => {
            const tempStatus = getTemperatureStatus(latestData.temperature);
            const pressureStatus = getPressureStatus(latestData.pressure);
            const voltageStatus = getVoltageStatus(latestData.voltage);
            const currentStatus = getCurrentStatus(latestData.current);
            const tc = colorMap[tempStatus.color];
            const pc = colorMap[pressureStatus.color];
            const vc = colorMap[voltageStatus.color];
            const cc = colorMap[currentStatus.color];

            return (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`${tc.bg} border ${tc.border} rounded-md p-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${tc.label}`}>Temperature</span>
                  {tempStatus.Icon && <tempStatus.Icon className={`w-4 h-4 ${tc.text}`} />}
                </div>
                <p className={`text-2xl font-bold ${tc.value} mt-1`}>
                  {latestData.temperature}°C
                </p>
                <p className={`text-xs ${tc.text} mt-1`}>{tempStatus.label} ({tempStatus.range})</p>
              </div>

              <div className={`${pc.bg} border ${pc.border} rounded-md p-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${pc.label}`}>Pressure</span>
                  {pressureStatus.Icon && <pressureStatus.Icon className={`w-4 h-4 ${pc.text}`} />}
                </div>
                <p className={`text-2xl font-bold ${pc.value} mt-1`}>
                  {latestData.pressure} bar
                </p>
                <p className={`text-xs ${pc.text} mt-1`}>{pressureStatus.label} ({pressureStatus.range})</p>
              </div>

              <div className={`${vc.bg} border ${vc.border} rounded-md p-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${vc.label}`}>Voltage</span>
                  {voltageStatus.Icon && <voltageStatus.Icon className={`w-4 h-4 ${vc.text}`} />}
                </div>
                <p className={`text-2xl font-bold ${vc.value} mt-1`}>
                  {latestData.voltage}V
                </p>
                <p className={`text-xs ${vc.text} mt-1`}>{voltageStatus.label} ({voltageStatus.range})</p>
              </div>

              <div className={`${cc.bg} border ${cc.border} rounded-md p-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${cc.label}`}>Current</span>
                  {currentStatus.Icon && <currentStatus.Icon className={`w-4 h-4 ${cc.text}`} />}
                </div>
                <p className={`text-2xl font-bold ${cc.value} mt-1`}>
                  {latestData.current}A
                </p>
                <p className={`text-xs ${cc.text} mt-1`}>{currentStatus.label} ({currentStatus.range})</p>
              </div>
            </div>
            );
          })()}

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
