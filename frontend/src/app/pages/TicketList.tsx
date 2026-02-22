import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Ticket, BackendTicket } from "../types";
import { fetchTickets } from "../api";
import { mapBackendTicket } from "../mapper";
import { ErrorState } from "../ErrorHandling/ErrorState";
import { AlertCircle, ChevronRight, Clock, MapPin, Wrench, CheckCircle, FileText, PlayCircle } from "lucide-react";

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
      // Map backend alerts to the expected frontend Ticket interface
      const allTickets: Ticket[] = data.map((alert: BackendTicket) => mapBackendTicket(alert));

      setActiveTickets(allTickets.filter(t => t.status !== 'completed'));
      setPastTickets(allTickets.filter(t => t.status === 'completed'));
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



  const priorityColors: Record<string, string> = {
    critical: "#ef4444", // red-500
    high: "#f97316",     // orange-500
    medium: "#eab308",   // yellow-500
    low: "#3b82f6",      // blue-500
  };

  const currentTickets = activeTab === "active" ? activeTickets : pastTickets;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-12 text-center flex flex-col items-center justify-center">
        <ErrorState
          title="Dashboard Error"
          message={error}
          onRetry={loadTickets}
        />
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Tickets</h1>
              <p className="text-sm text-gray-600 mt-1">Tech #4521</p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">On Duty</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors relative ${activeTab === "active"
              ? "text-blue-600"
              : "text-gray-600"
              }`}
          >
            Active Tickets
            {activeTab === "active" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors relative ${activeTab === "past"
              ? "text-blue-600"
              : "text-gray-600"
              }`}
          >
            Past Tickets
            {activeTab === "past" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>
      </div>

      {/* Notification Banner - Only for Active */}
      {activeTab === "active" && (
        <div className="bg-blue-600 text-white px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{activeTickets.length} predicted failures assigned</p>
              <p className="text-sm text-blue-100 mt-0.5">
                Prioritized by ML predictions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Past Summary Banner */}
      {activeTab === "past" && (
        <div className="bg-green-600 text-white px-4 py-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{pastTickets.length} completed repairs</p>
              <p className="text-sm text-green-100 mt-0.5">
                View AI notes and learnings from previous fixes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ticket List */}
      <div className="px-4 py-4 space-y-3">
        {currentTickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {activeTab === "active" ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">All clear!</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  No active maintenance tickets right now. All chargers are operating normally.
                </p>
              </>
            ) : (
              <>
                <FileText className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No past repairs</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Completed repairs will appear here with AI notes and learnings.
                </p>
              </>
            )}
          </div>
        )}
        {currentTickets.map((ticket: Ticket) => (
          <Link
            key={ticket.id}
            to={activeTab === "active" ? `/ticket/${ticket.id}` : `/past-ticket/${ticket.id}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden active:scale-98 transition-transform"
          >
            {/* Priority Indicator */}
            <div
              className="h-1"
              style={{
                backgroundColor: activeTab === "active" ? priorityColors[ticket.priority] : "#22c55e"
              }}
            ></div>

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-lg">
                      {ticket.stationId}
                    </span>
                    <div className="flex gap-1.5">
                      {activeTab === "active" ? (
                        <>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: `${priorityColors[ticket.priority]}20`,
                              color: priorityColors[ticket.priority]
                            }}
                          >
                            {ticket.priority.toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ticket.status === 'in_progress'
                            ? 'text-blue-700 bg-blue-100'
                            : 'text-gray-600 bg-gray-100'
                            }`}>
                            {ticket.status === 'in_progress' ? 'IN PROGRESS' : 'ASSIGNED'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full text-green-700 bg-green-100 font-bold">
                          COMPLETED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wrench className="w-4 h-4" />
                    <span className="font-medium">{ticket.component}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>

              {/* Prediction */}
              <div className={`${activeTab === "active"
                ? "bg-red-50 border-red-200"
                : "bg-gray-50 border-gray-200"
                } border rounded-md p-3 mb-3`}>
                <p className={`text-sm ${activeTab === "active" ? "text-red-800" : "text-gray-700"
                  }`}>
                  {ticket.predictedFailure}
                </p>
              </div>

              {/* Progress Bar - Only for In-Progress Active Tickets */}
              {activeTab === "active" && ticket.status === "in_progress" && ticket.checklistProgress && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-blue-700">
                      <PlayCircle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
                    </div>
                    <span className="text-xs font-bold text-blue-800">{ticket.checklistProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${ticket.checklistProgress.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] font-medium text-blue-600 uppercase">
                    Step {ticket.checklistProgress.completed} of {ticket.checklistProgress.total}
                  </p>
                </div>
              )}

              {/* AI Notes - Only for Past Tickets */}
              {activeTab === "past" && ticket.aiNotes && ticket.aiNotes.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-semibold text-blue-800">AI NOTES FROM REPAIR</span>
                  </div>
                  <div className="space-y-1">
                    {ticket.aiNotes.map((note: string, idx: number) => (
                      <p key={idx} className="text-xs text-blue-900 leading-relaxed">
                        • {note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{ticket.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {activeTab === "active"
                      ? new Date(ticket.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : ticket.completedDate
                        ? new Date(ticket.completedDate).toLocaleDateString()
                        : new Date(ticket.timestamp).toLocaleDateString()
                    }
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}