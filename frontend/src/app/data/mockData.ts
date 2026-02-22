export interface Ticket {
  id: string;
  stationId: string;
  component: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "assigned" | "in-progress" | "resolved";
  predictedFailure: string;
  assignedTo: string;
  timestamp: string;
  location: string;
  aiNotes?: string[]; // AI notes from previous repairs
  completedDate?: string;
  completedSteps?: CompletedStep[]; // Steps completed during repair
}

export interface CompletedStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  aiNote?: string; // AI note specific to this step
}

export interface TelemetryData {
  timestamp: string;
  temperature: number;
  pressure: number;
  voltage: number;
  current: number;
}

export const tickets: Ticket[] = [
  {
    id: "1",
    stationId: "STX-88",
    component: "Coolant Pump",
    priority: "critical",
    status: "assigned",
    predictedFailure: "Coolant Pump failure predicted - abnormal pressure readings",
    assignedTo: "Tech #4521",
    timestamp: "2026-02-21T08:30:00Z",
    location: "Downtown Shell Station - Bay 3",
  },
  {
    id: "2",
    stationId: "STX-92",
    component: "Power Supply Unit",
    priority: "high",
    status: "assigned",
    predictedFailure: "PSU voltage fluctuation detected",
    assignedTo: "Tech #4521",
    timestamp: "2026-02-21T09:15:00Z",
    location: "Highway Shell Station - Bay 1",
  },
  {
    id: "3",
    stationId: "STX-45",
    component: "Charging Cable",
    priority: "medium",
    status: "assigned",
    predictedFailure: "Cable connector wear detected",
    assignedTo: "Tech #4521",
    timestamp: "2026-02-21T10:00:00Z",
    location: "Westside Shell Station - Bay 2",
  },
  {
    id: "4",
    stationId: "STX-67",
    component: "Display Panel",
    priority: "low",
    status: "assigned",
    predictedFailure: "Screen backlight dimming",
    assignedTo: "Tech #4521",
    timestamp: "2026-02-21T11:30:00Z",
    location: "Eastside Shell Station - Bay 4",
  },
];

export const telemetryData: Record<string, TelemetryData[]> = {
  "1": [
    { timestamp: "08:00", temperature: 45, pressure: 2.8, voltage: 400, current: 125 },
    { timestamp: "08:05", temperature: 46, pressure: 2.7, voltage: 399, current: 126 },
    { timestamp: "08:10", temperature: 48, pressure: 2.5, voltage: 398, current: 127 },
    { timestamp: "08:15", temperature: 51, pressure: 2.2, voltage: 397, current: 128 },
    { timestamp: "08:20", temperature: 54, pressure: 1.9, voltage: 396, current: 130 },
    { timestamp: "08:25", temperature: 57, pressure: 1.5, voltage: 395, current: 132 },
    { timestamp: "08:30", temperature: 61, pressure: 1.2, voltage: 394, current: 135 },
  ],
  "2": [
    { timestamp: "08:00", temperature: 42, pressure: 3.0, voltage: 405, current: 120 },
    { timestamp: "08:05", temperature: 43, pressure: 3.0, voltage: 392, current: 121 },
    { timestamp: "08:10", temperature: 43, pressure: 3.0, voltage: 410, current: 119 },
    { timestamp: "08:15", temperature: 44, pressure: 3.0, voltage: 388, current: 122 },
    { timestamp: "08:20", temperature: 44, pressure: 3.0, voltage: 415, current: 118 },
  ],
};

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
  image?: string; // Base64 image data
}

export interface ManualStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export const manualSteps: Record<string, ManualStep[]> = {
  "1": [
    {
      id: 1,
      title: "Safety Preparation",
      description: "Put on safety gloves and goggles before proceeding",
      completed: false,
    },
    {
      id: 2,
      title: "Locate Panel C",
      description: "Find Panel C on the right side of the charging unit (blue label)",
      completed: false,
    },
    {
      id: 3,
      title: "Open Panel Access",
      description: "Remove the 4 Phillips screws to access internal components",
      completed: false,
    },
    {
      id: 4,
      title: "Locate Pressure Valve",
      description: "Find the pressure valve behind Panel C",
      completed: false,
    },
    {
      id: 5,
      title: "Check Pressure Reading",
      description: "Read the pressure gauge on the valve (normal: 2.5-3.5 bar)",
      completed: false,
    },
    {
      id: 6,
      title: "Inspect Connections",
      description: "Check all coolant connections for leaks or damage",
      completed: false,
    },
    {
      id: 7,
      title: "Replace Components",
      description: "Replace faulty valve or O-rings if needed (Part #CR-445)",
      completed: false,
    },
    {
      id: 8,
      title: "Test & Verify",
      description: "Restart system and verify pressure returns to normal range",
      completed: false,
    },
  ],
  "2": [
    {
      id: 1,
      title: "Power Down Unit",
      description: "Safely power down the charging station",
      completed: false,
    },
    {
      id: 2,
      title: "Access Main Board",
      description: "Open PSU compartment and locate the main circuit board",
      completed: false,
    },
    {
      id: 3,
      title: "Inspect Capacitors",
      description: "Check capacitors C1-C4 for bulging or leaking",
      completed: false,
    },
    {
      id: 4,
      title: "Replace Components",
      description: "Replace damaged capacitors with Part #PSU-CAP-800V",
      completed: false,
    },
    {
      id: 5,
      title: "Test Voltage",
      description: "Power on and verify voltage stability (400V ±5V)",
      completed: false,
    },
  ],
};

// Past tickets with AI notes from previous repairs
export const pastTickets: Ticket[] = [
  {
    id: "101",
    stationId: "STX-34",
    component: "Coolant Pump",
    priority: "critical",
    status: "resolved",
    predictedFailure: "Coolant Pump failure - pressure drop detected",
    assignedTo: "Tech #4521",
    timestamp: "2026-02-19T14:20:00Z",
    completedDate: "2026-02-19T16:45:00Z",
    location: "Downtown Shell Station - Bay 2",
    aiNotes: [
      "Step 4: Valve was severely corroded. Had to use emergency bypass. Consider upgrading to corrosion-resistant valve (Part #CR-550) for coastal locations.",
      "Step 7: O-ring replacement required extra cleaning of valve seat. Use brass brush before installing new O-ring to ensure proper seal.",
    ],
    completedSteps: [
      {
        id: 1,
        title: "Safety Preparation",
        description: "Put on safety gloves and goggles before proceeding",
        completed: true,
      },
      {
        id: 2,
        title: "Locate Panel C",
        description: "Find Panel C on the right side of the charging unit (blue label)",
        completed: true,
      },
      {
        id: 3,
        title: "Open Panel Access",
        description: "Remove the 4 Phillips screws to access internal components",
        completed: true,
      },
      {
        id: 4,
        title: "Locate Pressure Valve",
        description: "Find the pressure valve behind Panel C",
        completed: true,
        aiNote: "Valve was severely corroded. Had to use emergency bypass. Consider upgrading to corrosion-resistant valve (Part #CR-550) for coastal locations.",
      },
      {
        id: 5,
        title: "Check Pressure Reading",
        description: "Read the pressure gauge on the valve (normal: 2.5-3.5 bar)",
        completed: true,
      },
      {
        id: 6,
        title: "Inspect Connections",
        description: "Check all coolant connections for leaks or damage",
        completed: true,
      },
      {
        id: 7,
        title: "Replace Components",
        description: "Replace faulty valve or O-rings if needed (Part #CR-445)",
        completed: true,
        aiNote: "O-ring replacement required extra cleaning of valve seat. Use brass brush before installing new O-ring to ensure proper seal.",
      },
      {
        id: 8,
        title: "Test & Verify",
        description: "Restart system and verify pressure returns to normal range",
        completed: true,
      },
    ],
  },
  {
    id: "102",
    stationId: "STX-91",
    component: "Power Supply Unit",
    priority: "high",
    status: "resolved",
    predictedFailure: "PSU overheating detected",
    assignedTo: "Tech #4521",
    timestamp: "2026-02-18T09:30:00Z",
    completedDate: "2026-02-18T11:15:00Z",
    location: "Highway Shell Station - Bay 3",
    aiNotes: [
      "Step 3: Capacitor C2 was bulging but not leaking. Replaced all 4 capacitors as preventive measure.",
      "Step 5: After replacement, voltage stabilized but runs 2V higher than normal. Monitor for next 48 hours.",
    ],
    completedSteps: [
      {
        id: 1,
        title: "Power Down Unit",
        description: "Safely power down the charging station",
        completed: true,
      },
      {
        id: 2,
        title: "Access Main Board",
        description: "Open PSU compartment and locate the main circuit board",
        completed: true,
      },
      {
        id: 3,
        title: "Inspect Capacitors",
        description: "Check capacitors C1-C4 for bulging or leaking",
        completed: true,
        aiNote: "Capacitor C2 was bulging but not leaking. Replaced all 4 capacitors as preventive measure.",
      },
      {
        id: 4,
        title: "Replace Components",
        description: "Replace damaged capacitors with Part #PSU-CAP-800V",
        completed: true,
      },
      {
        id: 5,
        title: "Test Voltage",
        description: "Power on and verify voltage stability (400V ±5V)",
        completed: true,
        aiNote: "After replacement, voltage stabilized but runs 2V higher than normal. Monitor for next 48 hours.",
      },
    ],
  },
  {
    id: "103",
    stationId: "STX-23",
    component: "Charging Cable",
    priority: "medium",
    status: "resolved",
    predictedFailure: "Cable connector degradation",
    assignedTo: "Tech #4521",
    timestamp: "2026-02-17T13:00:00Z",
    completedDate: "2026-02-17T13:45:00Z",
    location: "Westside Shell Station - Bay 1",
    aiNotes: [
      "Connector pins showed signs of arcing. Cleaned with contact cleaner and applied dielectric grease to prevent future corrosion.",
    ],
    completedSteps: [
      {
        id: 1,
        title: "Visual Inspection",
        description: "Inspect cable and connector for visible damage",
        completed: true,
        aiNote: "Connector pins showed signs of arcing. Cleaned with contact cleaner and applied dielectric grease to prevent future corrosion.",
      },
      {
        id: 2,
        title: "Clean Connector",
        description: "Clean connector pins with contact cleaner",
        completed: true,
      },
      {
        id: 3,
        title: "Apply Protection",
        description: "Apply dielectric grease to connector",
        completed: true,
      },
      {
        id: 4,
        title: "Test Connection",
        description: "Verify proper electrical connection",
        completed: true,
      },
    ],
  },
  {
    id: "104",
    stationId: "STX-56",
    component: "Display Panel",
    priority: "low",
    status: "resolved",
    predictedFailure: "Touchscreen calibration drift",
    assignedTo: "Tech #4521",
    timestamp: "2026-02-16T10:15:00Z",
    completedDate: "2026-02-16T10:30:00Z",
    location: "Eastside Shell Station - Bay 2",
    completedSteps: [
      {
        id: 1,
        title: "Run Calibration Tool",
        description: "Access service menu and run calibration utility",
        completed: true,
      },
      {
        id: 2,
        title: "Test Touch Points",
        description: "Verify all touch points respond correctly",
        completed: true,
      },
    ],
  },
];

// Telemetry data for past tickets (data from repair day)
export const pastTelemetryData: Record<string, TelemetryData[]> = {
  "101": [
    { timestamp: "14:00", temperature: 48, pressure: 2.6, voltage: 399, current: 126 },
    { timestamp: "14:15", temperature: 52, pressure: 2.1, voltage: 398, current: 128 },
    { timestamp: "14:30", temperature: 58, pressure: 1.7, voltage: 397, current: 131 },
    { timestamp: "14:45", temperature: 62, pressure: 1.3, voltage: 396, current: 134 },
    { timestamp: "15:00", temperature: 47, pressure: 2.9, voltage: 400, current: 125 },
    { timestamp: "15:15", temperature: 44, pressure: 3.1, voltage: 400, current: 124 },
    { timestamp: "15:30", temperature: 42, pressure: 3.0, voltage: 400, current: 125 },
  ],
  "102": [
    { timestamp: "09:00", temperature: 43, pressure: 3.0, voltage: 408, current: 119 },
    { timestamp: "09:15", temperature: 44, pressure: 3.0, voltage: 390, current: 122 },
    { timestamp: "09:30", temperature: 44, pressure: 3.0, voltage: 418, current: 117 },
    { timestamp: "09:45", temperature: 45, pressure: 3.0, voltage: 385, current: 123 },
    { timestamp: "10:00", temperature: 42, pressure: 3.0, voltage: 401, current: 120 },
    { timestamp: "10:15", temperature: 42, pressure: 3.0, voltage: 402, current: 120 },
    { timestamp: "10:30", temperature: 42, pressure: 3.0, voltage: 402, current: 120 },
  ],
  "103": [
    { timestamp: "12:45", temperature: 40, pressure: 3.2, voltage: 398, current: 122 },
    { timestamp: "13:00", temperature: 41, pressure: 3.2, voltage: 399, current: 121 },
    { timestamp: "13:15", temperature: 40, pressure: 3.2, voltage: 400, current: 120 },
    { timestamp: "13:30", temperature: 40, pressure: 3.2, voltage: 400, current: 120 },
  ],
  "104": [
    { timestamp: "10:00", temperature: 38, pressure: 3.1, voltage: 400, current: 118 },
    { timestamp: "10:10", temperature: 38, pressure: 3.1, voltage: 400, current: 118 },
    { timestamp: "10:20", temperature: 38, pressure: 3.1, voltage: 400, current: 118 },
  ],
};

export const aiKnowledgeBase: Record<string, { question: string; answer: string }[]> = {
  "1": [
    {
      question: "valve is stuck",
      answer: "If the pressure valve is stuck, apply WD-40 lubricant and wait 2 minutes. Then use a 12mm wrench to gently turn counterclockwise. DO NOT force it - if still stuck, use the emergency bypass valve located 6 inches below.",
    },
    {
      question: "panel c location",
      answer: "Panel C is located on the right side of the charging unit, marked with a blue label. Remove the 4 Phillips screws to access the internal components.",
    },
    {
      question: "coolant leak",
      answer: "If you detect coolant leak: 1) Immediately shut down the station using the red emergency button. 2) Wear protective gloves. 3) Check connection points at valves A, B, and C. 4) Replace damaged O-rings with part #CR-445.",
    },
    {
      question: "temperature",
      answer: "Normal operating temperature for the coolant pump is 35-50°C. Above 55°C indicates a problem. The current reading of 61°C suggests the pump is overheating due to pressure issues.",
    },
  ],
  "2": [
    {
      question: "voltage fluctuation",
      answer: "Voltage fluctuations in PSU indicate capacitor degradation. Check capacitors C1-C4 on the main board. Look for bulging or leaking. Replace with part #PSU-CAP-800V if damaged.",
    },
  ],
};