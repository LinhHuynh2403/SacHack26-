import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Ticket, BackendTicket } from "../types";
import { fetchTicket } from "../api";
import { mapBackendTicket } from "../mapper";
import { ErrorState } from "../ErrorHandling/ErrorState";
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, ChevronsRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SwipeToStart } from "../components/SwipeToStart";

export function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setError(null);
    try {
      const alert: BackendTicket = await fetchTicket(ticketId);
      setTicket(mapBackendTicket(alert));
    } catch (err: any) {
      console.error("Failed to load ticket details", err);
      setError("Unable to retrieve ticket details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ticketId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 pt-12">
        <ErrorState title="Ticket Load Error" message={error || "Ticket not found"} onRetry={loadData} />
      </div>
    );
  }

  const telemetry = ticket.telemetryHistory || [];
  const latestData = telemetry[telemetry.length - 1];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Roboto'] relative pb-28">
      {/* Dynamic Header Background (Yellow Warning from Figma) */}
      <div className="absolute top-0 left-0 w-full h-[184px] bg-[#FFF28B] z-0"></div>

      {/* Header Content */}
      <div className="px-5 pt-12 relative z-10">
        <button onClick={() => navigate(-1)} className="mb-6 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-[#000000]" />
        </button>

        <h1 className="text-[22px] font-semibold text-[#000000] tracking-[0.15px] leading-tight">
          {ticket.stationId}
        </h1>
        <div className="mt-4">
          <p className="text-[12px] text-[#000000] tracking-[0.4px]">Location</p>
          <p className="text-[13px] text-[#000000] tracking-[0.4px] font-medium mt-0.5">
            {ticket.location}
          </p>
        </div>
      </div>

      <div className="px-4 mt-8 relative z-10 space-y-6">

        {/* Error Details Section */}
        <section>
          <h2 className="text-[14px] font-medium text-[#000000] tracking-[0.25px] mb-3 ml-1">
            Error Details
          </h2>
          <div className="bg-white rounded-[20px] p-4 shadow-[0px_0px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-[18px] h-[18px] text-[#B3261E] mt-0.5 flex-shrink-0" />
              <h3 className="text-[13px] font-medium text-[#B3261E] tracking-[0.4px]">
                Potential failure in {ticket.component}
              </h3>
            </div>
            <p className="text-[13px] text-[#000000] tracking-[0.4px] leading-relaxed ml-6 whitespace-pre-line">
              {ticket.predictedFailure}
            </p>
          </div>
        </section>

        {/* Current Status (Telemetry Grid) */}
        {latestData && (
          <section>
            <h2 className="text-[14px] font-medium text-[#000000] tracking-[0.25px] mb-3 ml-1">
              Current Status
            </h2>
            <div className="grid grid-cols-2 gap-4">

              {/* Temperature Box */}
              <div className="bg-[#FFFACE] rounded-[15px] p-4 flex flex-col justify-between h-[110px]">
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#B67909] tracking-[0.4px]">Temperature</span>
                  <TrendingUp className="w-4 h-4 text-[#B67909]" />
                </div>
                <div>
                  <p className="text-[20px] font-medium text-[#754C00] tracking-[0.5px]">
                    {latestData.temperature}°C
                  </p>
                  <p className="text-[11px] text-[#B67909] tracking-[0.4px] mt-0.5">
                    Above normal (35-50°C)
                  </p>
                </div>
              </div>

              {/* Pressure Box */}
              <div className="bg-[#FFDED9] rounded-[15px] p-4 flex flex-col justify-between h-[110px]">
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#E84036] tracking-[0.4px]">Pressure</span>
                  <TrendingDown className="w-4 h-4 text-[#E84036]" />
                </div>
                <div>
                  <p className="text-[20px] font-medium text-[#852221] tracking-[0.5px]">
                    {latestData.pressure} bar
                  </p>
                  <p className="text-[11px] text-[#E84036] tracking-[0.4px] mt-0.5 leading-tight">
                    Below normal (2.5-3.5)
                  </p>
                </div>
              </div>

              {/* Voltage Box */}
              <div className="bg-[#CBF6E8] rounded-[15px] p-4 flex flex-col justify-between h-[110px]">
                <span className="text-[12px] text-[#004629] tracking-[0.4px]">Voltage</span>
                <div>
                  <p className="text-[20px] font-medium text-[#006E40] tracking-[0.5px]">
                    {latestData.voltage}V
                  </p>
                  <p className="text-[11px] text-[#004629] tracking-[0.4px] mt-0.5">Normal</p>
                </div>
              </div>

              {/* Current Box */}
              <div className="bg-[#CBF6E8] rounded-[15px] p-4 flex flex-col justify-between h-[110px]">
                <span className="text-[12px] text-[#004629] tracking-[0.4px]">Current</span>
                <div>
                  <p className="text-[20px] font-medium text-[#006E40] tracking-[0.5px]">
                    {latestData.current}A
                  </p>
                  <p className="text-[11px] text-[#004629] tracking-[0.4px] mt-0.5">Normal</p>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Trends Section */}
        {telemetry.length > 0 && (
          <section>
            <h2 className="text-[14px] font-medium text-[#000000] tracking-[0.25px] mb-3 ml-1">
              Trends
            </h2>
            <div className="space-y-4">

              {/* Pressure Chart */}
              <div className="bg-white rounded-[20px] p-4 shadow-[0px_0px_20px_rgba(0,0,0,0.08)]">
                <p className="text-[13px] text-black mb-4">Pressure</p>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetry} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <XAxis dataKey="timestamp" tick={false} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Line type="monotone" dataKey="pressure" stroke="#E84036" strokeWidth={2} dot={{ r: 3, fill: '#E84036', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Temperature Chart */}
              <div className="bg-white rounded-[20px] p-4 shadow-[0px_0px_20px_rgba(0,0,0,0.08)]">
                <p className="text-[13px] text-black mb-4">Temperature</p>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetry} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <XAxis dataKey="timestamp" tick={false} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Line type="monotone" dataKey="temperature" stroke="#FFA600" strokeWidth={2} dot={{ r: 3, fill: 'white', stroke: '#FFA600', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Action */}
      {/* Added max-w-[430px] to keep it inside the app wrapper */}
      <div className="fixed bottom-6 w-full max-w-[430px] px-6 z-50 flex justify-center">
        <SwipeToStart ticketId={ticketId || ""} />
      </div>

    </div>
  );
}
