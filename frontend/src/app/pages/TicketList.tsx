import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Ticket, BackendTicket } from "../types";
import { fetchTickets } from "../api";
import { mapBackendTicket } from "../mapper";
import { ErrorState } from "../ErrorHandling/ErrorState";
import { Wrench, Clipboard } from "lucide-react";

export function TicketList() {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
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
        return <span className="bg-status-completed-bg text-status-completed-text px-3 py-1 rounded-full text-[15px] font-normal font-['SF Pro']">Completed</span>;
      case "in_progress":
        return <span className="bg-status-process-bg text-status-process-text px-3 py-1 rounded-full text-[15px] font-normal font-['SF Pro']">In Process</span>;
      default: // predicted_failure, offline
        return <span className="bg-status-notstarted-bg text-status-notstarted-text px-3 py-1 rounded-full text-[15px] font-normal font-['SF Pro']">Not started</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-app">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-app p-4 pt-12 text-center flex flex-col items-center justify-center">
        <ErrorState title="Dashboard Error" message={error} onRetry={loadTickets} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app font-['Roboto'] pb-6">
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
        <div className="flex bg-tab-container p-0.5 rounded-full items-center">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-1.5 text-[14px] font-medium rounded-full transition-all ${activeTab === "active"
                ? "bg-tab-active text-text-primary shadow-sm"
                : "text-text-primary/70 hover:text-text-primary"
              }`}
          >
            Active Ticket
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 py-1.5 text-[14px] font-medium rounded-full transition-all ${activeTab === "past"
                ? "bg-tab-active text-text-primary shadow-sm"
                : "text-text-primary/70 hover:text-text-primary"
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
              className="block bg-bg-card rounded-[20px] p-5 shadow-[0px_0px_20px_rgba(0,0,0,0.10)] active:scale-[0.98] transition-transform relative"
            >

              {/* Top Header: ID & Pill */}
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-[16px] font-medium text-text-primary tracking-[0.5px]">
                  {ticket.stationId}
                </h2>
                {getStatusPill(ticket.status)}
              </div>

              {/* Subtitle Details */}
              <div className="space-y-1 mb-4">
                <p className="text-[12px] text-text-secondary tracking-[0.4px]">
                  {ticket.location}
                </p>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Wrench className="w-3.5 h-3.5" />
                  <span className="text-[12px] tracking-[0.4px]">{ticket.component}</span>
                </div>
              </div>

              {/* Telemetry/Prediction Box */}
              <div
                className={`border-[0.5px] rounded-[10px] p-3 ${isCompleted
                    ? "bg-gray-50 border-gray-200"
                    : "bg-box-error-bg border-box-error-border"
                  }`}
              >
                <p
                  className={`text-[12px] leading-tight tracking-[0.4px] whitespace-pre-line ${isCompleted ? "text-gray-700" : "text-box-error-text"
                    }`}
                >
                  {ticket.predictedFailure}
                </p>
              </div>

              {/* AI Notes Box (Only for Past Tickets) */}
              {isCompleted && ticket.aiNotes && ticket.aiNotes.length > 0 && (
                <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-[10px] p-3 mt-3">
                  <div className="flex items-center gap-2 mb-1.5 text-[#2563eb]">
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="font-semibold text-[12px]">Note from fixity</span>
                  </div>
                  <ul className="list-disc list-inside text-[12px] text-[#1e40af] space-y-0.5">
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