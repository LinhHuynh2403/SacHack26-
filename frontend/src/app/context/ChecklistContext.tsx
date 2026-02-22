import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { fetchChecklist, updateChecklistItem } from "../api";

export interface ChecklistStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  notes: string;
}

interface ChecklistContextValue {
  /** Get cached checklist for a ticket (undefined if not loaded yet) */
  getChecklist: (ticketId: string) => ChecklistStep[] | undefined;
  /** Load checklist from API. Uses cache unless forceRefresh is true. */
  loadChecklist: (ticketId: string, forceRefresh?: boolean) => Promise<ChecklistStep[]>;
  /** Toggle a step's completion (optimistic update + API call) */
  toggleStep: (ticketId: string, index: number) => Promise<void>;
  /** Mark a specific step as complete (called from chat when AI detects completion) */
  markStepComplete: (ticketId: string, index: number) => void;
  /** Whether a checklist is currently being loaded */
  isLoading: (ticketId: string) => boolean;
}

const ChecklistContext = createContext<ChecklistContextValue | null>(null);

export function ChecklistProvider({ children }: { children: ReactNode }) {
  // Map of ticketId -> checklist steps
  const [checklists, setChecklists] = useState<Record<string, ChecklistStep[]>>({});
  // Track which tickets are currently loading
  const [loadingTickets, setLoadingTickets] = useState<Set<string>>(new Set());

  const getChecklist = useCallback(
    (ticketId: string): ChecklistStep[] | undefined => checklists[ticketId],
    [checklists]
  );

  const isLoading = useCallback(
    (ticketId: string): boolean => loadingTickets.has(ticketId),
    [loadingTickets]
  );

  const loadChecklist = useCallback(
    async (ticketId: string, forceRefresh = false): Promise<ChecklistStep[]> => {
      // Return cached data if available and not forcing refresh
      if (!forceRefresh && checklists[ticketId]) {
        return checklists[ticketId];
      }

      setLoadingTickets((prev) => new Set(prev).add(ticketId));

      try {
        const checklistData = await fetchChecklist(ticketId);
        let steps: ChecklistStep[] = [];

        if (checklistData && checklistData.checklist) {
          steps = checklistData.checklist.map((s: any, idx: number) => ({
            id: idx,
            title: s.task,
            description: s.notes || "",
            completed: s.completed,
            notes: s.notes,
          }));
        }

        // Merge with existing cached state to preserve any local completions
        // that may not have synced yet (e.g., from chat auto-detection)
        setChecklists((prev) => {
          const existing = prev[ticketId];
          if (existing && !forceRefresh) {
            // Merge: keep completed=true from either source
            const merged = steps.map((step, idx) => {
              const cachedStep = existing[idx];
              if (cachedStep && cachedStep.completed && !step.completed) {
                // Local state says completed but server doesn't yet - keep completed
                return { ...step, completed: true };
              }
              return step;
            });
            return { ...prev, [ticketId]: merged };
          }
          return { ...prev, [ticketId]: steps };
        });

        return steps;
      } finally {
        setLoadingTickets((prev) => {
          const next = new Set(prev);
          next.delete(ticketId);
          return next;
        });
      }
    },
    [checklists]
  );

  const toggleStep = useCallback(
    async (ticketId: string, index: number): Promise<void> => {
      const current = checklists[ticketId];
      if (!current || !current[index]) return;

      const newCompleted = !current[index].completed;

      // Optimistic update
      setChecklists((prev) => ({
        ...prev,
        [ticketId]: prev[ticketId].map((s, i) =>
          i === index ? { ...s, completed: newCompleted } : s
        ),
      }));

      try {
        await updateChecklistItem(ticketId, index, newCompleted);
      } catch (error) {
        console.error("Failed to update step", error);
        // Revert on error
        setChecklists((prev) => ({
          ...prev,
          [ticketId]: prev[ticketId].map((s, i) =>
            i === index ? { ...s, completed: !newCompleted } : s
          ),
        }));
      }
    },
    [checklists]
  );

  const markStepComplete = useCallback(
    (ticketId: string, index: number): void => {
      setChecklists((prev) => {
        const current = prev[ticketId];
        if (!current || !current[index]) return prev;
        // Only update if not already completed
        if (current[index].completed) return prev;

        return {
          ...prev,
          [ticketId]: current.map((s, i) =>
            i === index ? { ...s, completed: true } : s
          ),
        };
      });
    },
    []
  );

  return (
    <ChecklistContext.Provider
      value={{ getChecklist, loadChecklist, toggleStep, markStepComplete, isLoading }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist(): ChecklistContextValue {
  const ctx = useContext(ChecklistContext);
  if (!ctx) {
    throw new Error("useChecklist must be used within a ChecklistProvider");
  }
  return ctx;
}
