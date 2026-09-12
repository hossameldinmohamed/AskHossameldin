export interface PublicQuestion {
  id: string;
  content: string;
  answer: string | null;
  answeredAt: string | null;
}

export type QuestionStatus = "pending" | "answered" | "rejected";

export interface AdminQuestion {
  id: string;
  content: string;
  answer: string | null;
  status: QuestionStatus;
  createdAt: string;
  answeredAt: string | null;
}
