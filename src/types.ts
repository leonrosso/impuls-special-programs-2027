export interface ProgramRow {
  title: string;
  coach: string;
  deadlineRaw: string;
  deadlineDate: Date | null;
  zoomMeetings: string;
  decision: string;
  deadline2: string;
  equivalentHours: number;
  description: string;
}

export type Urgency = "past" | "urgent" | "soon" | "neutral";
