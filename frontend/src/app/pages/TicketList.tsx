import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Ticket, BackendTicket } from "../types";
import { fetchTickets } from "../api";
import { mapBackendTicket } from "../mapper";
import { ErrorState } from "../ErrorHandling/ErrorState";
import { Wrench, Clipboard } from "lucide-react";

export function TicketList() {
  // Read the URL parameters to see if we should start on the "past" tab
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"active" | "past">(
    searchParams.get("tab") === "past" ? "past" : "active"
  );

  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [pastTickets, setPastTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTickets();
      const allTickets: Ticket[] = data.map((alert: BackendTicket) => mapBackendTicket(alert));

      const priorityOrder: Record<string, number> = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4
      };

      allTickets.sort((a, b) => {
        const pA = priorityOrder[a.priority] || 99;
        const pB = priorityOrder[b.priority] || 99;
        return pA - pB;
      });

      setActiveTickets(allTickets.filter((t) => t.status !== "completed"));
      setPastTickets(allTickets.filter((t) => t.status === "completed"));
    } catch (err: any) {
      console.error(err);
      setError("We couldn't load your maintenance tickets. The server might be offline.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const currentTickets = activeTab === "active" ? activeTickets : pastTickets;

  const getStatusPill = (status: string) => {
    switch (status) {
      case "completed":
        // Matches the new #00CB8B green from Figma
        return <span className="bg-[#00CB8B] text-white px-3 py-1 rounded-full text-[15px] font-normal font-['SF Pro']">Completed</span>;
      case "in_progress":
        return <span className="bg-[#FF383C] text-white px-3 py-1 rounded-full text-[15px] font-normal font-['SF Pro']">In Process</span>;
      default: // predicted_failure, offline
        return <span className="bg-[#cce7ff] text-[#5A5A5A] px-3 py-1 rounded-full text-[15px] font-normal font-['SF Pro']">Not started</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 pt-12 text-center flex flex-col items-center justify-center">
        <ErrorState title="Dashboard Error" message={error} onRetry={loadTickets} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Roboto'] pb-6">
      {/* Header matching Figma exactly */}
      <div className="px-5 pt-16 pb-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-normal text-[#1E1E1E] font-['Inter'] leading-tight">Technician #3560</h1>
            <p className="text-[14px] text-[#1E1E1E] mt-1 font-['Inter']">Davis, CA</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
            alt="Technician Avatar"
            className="w-[49px] h-[49px] rounded-full object-cover"
          />
        </div>
      </div>

      {/* Figma exact Pill-shaped Tabs */}
      <div className="px-4 pb-6">
        <div className="flex bg-[#D9EDFD] p-0.5 rounded-full items-center">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-1.5 text-[14px] font-medium rounded-full transition-all ${activeTab === "active"
              ? "bg-white text-black shadow-sm"
              : "text-black/70 hover:text-black"
              }`}
          >
            Active Ticket
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 py-1.5 text-[14px] font-medium rounded-full transition-all ${activeTab === "past"
              ? "bg-white text-black shadow-sm"
              : "text-black/70 hover:text-black"
              }`}
          >
            Past Ticket
          </button>
        </div>
      </div>

      {/* Ticket Cards List */}
      <div className="px-4 space-y-4">
        {currentTickets.map((ticket: Ticket) => {
          const isCompleted = ticket.status === "completed";

          return (
            <Link
              key={ticket.id}
              to={activeTab === "active" ? `/ticket/${ticket.id}` : `/past-ticket/${ticket.id}`}
              className="block bg-white rounded-[20px] p-5 shadow-[0px_0px_20px_rgba(0,0,0,0.10)] active:scale-[0.98] transition-transform relative"
            >

              {/* Top Header: ID & Pill */}
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-medium text-black tracking-[0.5px]">
                    {ticket.stationId}
                  </h2>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${ticket.priority === 'critical' ? 'bg-red-50 text-red-600 border-red-200' :
                    ticket.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        'bg-green-50 text-green-600 border-green-200'
                    }`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </div>
                {getStatusPill(ticket.status)}
              </div>

              {/* Subtitle Details */}
              <div className="space-y-1 mb-4">
                <p className="text-[12px] text-[#595959] tracking-[0.4px]">
                  {ticket.location}
                </p>
                <div className="flex items-center gap-1.5 text-[#595959]">
                  <Wrench className="w-3.5 h-3.5" />
                  <span className="text-[12px] tracking-[0.4px]">{ticket.component}</span>
                </div>
              </div>

              {/* Telemetry/Prediction Box (Red for Active, Gray for Completed) */}
              <div
                className={`border-[0.5px] rounded-[10px] p-3 ${isCompleted
                  ? "bg-[#EEEEEE] border-[#5A5A5A]"
                  : "bg-[#FFDED9] border-[#852221]"
                  }`}
              >
                <p
                  className={`text-[12px] leading-tight tracking-[0.4px] whitespace-pre-line ${isCompleted ? "text-[#49454F]" : "text-[#852221]"
                    }`}
                >
                  {ticket.predictedFailure}
                </p>
              </div>

              {/* AI Notes Box (Only for Past Tickets) */}
              {isCompleted && ticket.aiNotes && ticket.aiNotes.length > 0 && (
                <div className="bg-[#D6E3EE] border-[0.5px] border-[#1271BD] rounded-[10px] p-3 mt-3">
                  <div className="flex items-center gap-2 mb-1.5 text-[#1271BD]">
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="font-medium text-[12px]">Note from fixity</span>
                  </div>
                  <ul className="list-disc list-inside text-[12px] text-[#1271BD] space-y-0.5">
                    {ticket.aiNotes.map((note: string, idx: number) => (
                      <li key={idx} className="leading-snug tracking-[0.4px]">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Link>
          );
        })}

        {currentTickets.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            No {activeTab} tickets found.
          </div>
        )}
      </div>
    </div>
  );
}