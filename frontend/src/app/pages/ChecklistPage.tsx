import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Ticket, BackendTicket } from "../types";
import { fetchTicket, fetchChecklist, updateChecklistItem, updateTicketStatus } from "../api";
import { mapBackendTicket } from "../mapper";
import { ArrowLeft, Sparkles, Check, RefreshCw } from "lucide-react";
import { ErrorState } from "../ErrorHandling/ErrorState";
import { SwipeToEnd } from "../components/SwipeToEnd";

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
          id: idx,
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
      setError("We couldn't generate your repair checklist.");
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Generating your repair checklist...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 pt-12 text-center flex flex-col items-center justify-center">
        <ErrorState title="Checklist Error" message={error || "Ticket not found"} onRetry={loadData} />
      </div>
    );
  }

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Roboto'] relative pb-28">

      {/* Yellow Header matches Figma height & color */}
      <div className="w-full bg-[#FFF28B] pt-14 pb-12 px-5 shadow-sm relative z-0">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate(-1)} className="active:scale-95 transition-transform">
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <button className="text-[16px] font-medium text-black">
            Share
          </button>
        </div>
        <h1 className="text-[20px] font-semibold text-black tracking-[0.15px]">
          Repair Checklist
        </h1>
      </div>

      <div className="relative z-10 -mt-6">
        {/* Progress Tracker Card */}
        <div className="bg-white rounded-[8px] shadow-[0px_0px_20px_rgba(0,0,0,0.10)] p-5 mb-6 mx-4">
          <p className="text-[10px] font-bold text-[#49454F] tracking-wide mb-2 uppercase font-['SF_Pro']">
            Your process
          </p>
          <div className="flex items-end justify-between mb-3">
            <span className="text-[22px] font-bold text-[#0088FF] font-['SF_Pro']">
              {completedCount}/{totalCount}
            </span>
            <span className="text-[12px] text-[#8D8D8D] font-medium">
              {Math.round(progress)} %
            </span>
          </div>
          <div className="w-full bg-[#D9D9D9] h-[9px] rounded-full overflow-hidden">
            <div
              className="bg-[#0088FF] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Checklist Steps */}
        <div className="space-y-4 px-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-[#F8FAFC] rounded-[20px] shadow-[0px_0px_20px_rgba(0,0,0,0.10)] p-5 flex items-start gap-4"
            >
              {/* Checkbox (Custom styled to match Figma) */}
              <button
                onClick={() => toggleStepCompletion(index)}
                className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-[3px] border-[2px] transition-all"
                style={{
                  borderColor: step.completed ? "#0088FF" : "#49454F",
                  backgroundColor: step.completed ? "#0088FF" : "transparent"
                }}
              >
                {step.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-[14px] font-medium leading-tight mb-1 ${step.completed ? "text-gray-500 line-through" : "text-black"}`}>
                  {step.title}
                </h3>
                <p className={`text-[13px] leading-relaxed ${step.completed ? "text-gray-400" : "text-black"}`}>
                  {step.description}
                </p>
              </div>

              {/* AI Sparkle Action Button */}
              {!step.completed && (
                <button
                  onClick={() => handleAskAI(index)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 active:scale-90 transition-transform"
                >
                  <Sparkles className="w-[20px] h-[20px] text-[#1271BD]" fill="#1271BD" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Action (Swipe to End) */}
      {progress === 100 && (
        <div className="fixed bottom-6 w-full px-6 z-50 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
          <SwipeToEnd onComplete={handleCompleteRepair} />
        </div>
      )}

    </div>
  );
}