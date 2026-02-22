import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { tickets, manualSteps } from "../data/mockData";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  HelpCircle,
} from "lucide-react";

export function ChecklistPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [steps, setSteps] = useState(manualSteps["1"] || []);

  const ticket = tickets.find((t) => t.id === ticketId) || {
    id: ticketId as string,
    stationId: "DP-INC Station",
    component: "System Component",
    priority: "critical" as any,
    status: "assigned" as any,
    predictedFailure: "Predicted Failure",
    assignedTo: "Tech #4521",
    timestamp: new Date().toISOString(),
    location: "Site Location"
  };

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  const toggleStepCompletion = (stepId: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
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
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-4 ${step.completed ? "bg-green-50" : "bg-white"}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStepCompletion(step.id)}
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
                      Step {step.id}: {step.title}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${step.completed ? "text-green-700" : "text-gray-600"
                        }`}
                    >
                      {step.description}
                    </p>

                    {!step.completed && (
                      <button
                        onClick={() => handleAskAI(step.id)}
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
        </div>
      </div>
    </div>
  );
}
