import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Ticket, BackendTicket } from "../types";
import { fetchTicket, fetchChecklist, updateChecklistItem, updateTicketStatus } from "../api";
import { mapBackendTicket } from "../mapper";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { ErrorState } from "../ErrorHandling/ErrorState";

export function ChecklistPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
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
      if (checklistData && checklistData.checklist) {
        setSteps(checklistData.checklist.map((s: any, idx: number) => ({
          id: idx, // Use index for backend
          title: s.task,
          description: s.task,
          completed: s.completed,
          notes: s.notes
        })));
      } else {
        setSteps([]);
      }
    } catch (err: any) {
      console.error("Failed to load checklist", err);
      setError("We couldn't generate your repair checklist. This usually happens if the AI service is disconnected.");
      setSteps([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ticketId]);


  const handleCompleteRepair = async () => {
    if (!ticketId) return;
    try {
      await updateTicketStatus(ticketId, 'completed');
      navigate("/");
    } catch (error) {
      console.error("Failed to complete repair", error);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Generating your repair checklist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-12 text-center flex flex-col items-center justify-center">
        <ErrorState
          title="Checklist Error"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-12 text-center flex flex-col items-center justify-center text-gray-500">
        Ticket not found
      </div>
    );
  }


  const toggleStepCompletion = async (index: number) => {
    const step = steps[index];
    const newCompleted = !step.completed;

    // Optimistic update
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, completed: newCompleted } : s));

    try {
      if (ticketId) {
        await updateChecklistItem(ticketId, index, newCompleted);
      }
    } catch (error) {
      console.error("Failed to update step", error);
      // Revert on error
      setSteps(prev => prev.map((s, i) => i === index ? { ...s, completed: !newCompleted } : s));
    }
  };

  const handleAskAI = (stepId: number) => {
    navigate(`/chat/${ticketId}?step=${stepId}`);
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <Link to={`/ticket/${ticketId}`} className="flex items-center gap-2 text-blue-600 mb-3">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Details</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.stationId}</h1>
            <p className="text-gray-600 mt-1">{ticket.component} Repair</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3">
            <h3 className="font-semibold">Repair Checklist</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-blue-700 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`p-4 ${step.completed ? "bg-green-50" : "bg-white"}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStepCompletion(index)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-medium ${step.completed
                        ? "text-green-900 line-through"
                        : "text-gray-900"
                        }`}
                    >
                      Step {index + 1}: {step.title}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${step.completed ? "text-green-700" : "text-gray-600"
                        }`}
                    >
                      {step.description}
                    </p>

                    {!step.completed && (
                      <button
                        onClick={() => handleAskAI(index)}
                        className="mt-2 flex items-center gap-2 text-blue-600 text-sm font-medium active:scale-95 transition-transform"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Need help? Ask AI
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {progress === 100 && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleCompleteRepair}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                Complete the Repair
              </button>
              <p className="text-center text-gray-500 text-xs mt-3">
                All steps validated. Click to finalize ticket.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
