import { useState, useEffect } from "react";
import { Link } from "react-router";
import { pastTickets, Ticket } from "../data/mockData";
import { fetchTickets } from "../api";
import { AlertCircle, ChevronRight, Clock, MapPin, Wrench, CheckCircle, FileText } from "lucide-react";

export function TicketList() {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await fetchTickets();
        // Map backend alerts to the expected frontend Ticket interface
        const mappedTickets: Ticket[] = data.map((alert: any) => ({
          id: alert.ticket_id,
          stationId: alert.station_info.charger_id,
          component: alert.prediction_details.failing_component,
          priority: alert.urgency as any,
          status: "assigned",
          predictedFailure: alert.prediction_details.telemetry_context,
          assignedTo: "Tech #4521",
          timestamp: alert.timestamp,
          location: alert.station_info.location,
        }));
        setActiveTickets(mappedTickets);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTickets();
  }, []);

  const priorityColors: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
  };

  const priorityTextColors: Record<string, string> = {
    critical: "text-red-600",
    high: "text-orange-600",
    medium: "text-yellow-600",
    low: "text-blue-600",
  };

  const currentTickets = activeTab === "active" ? activeTickets : pastTickets;

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
                Prioritized by Data Pigeon ML predictions
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
        {currentTickets.map((ticket: Ticket) => (
          <Link
            key={ticket.id}
            to={activeTab === "active" ? `/ticket/${ticket.id}` : `/past-ticket/${ticket.id}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden active:scale-98 transition-transform"
          >
            {/* Priority Indicator */}
            <div className={`h-1 ${activeTab === "active"
              ? priorityColors[ticket.priority]
              : "bg-green-500"
              }`}></div>

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-lg">
                      {ticket.stationId}
                    </span>
                    {activeTab === "active" ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${priorityTextColors[ticket.priority]} bg-opacity-10`}
                        style={{
                          backgroundColor: `${priorityColors[ticket.priority]}20`,
                        }}
                      >
                        {ticket.priority.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full text-green-700 bg-green-100">
                        RESOLVED
                      </span>
                    )}
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