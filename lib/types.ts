export interface PublicQuestion {
  id: string;
  content: string;
  answer: string | null;
  answeredAt: string | null;
  followUps?: PublicQuestion[];
  likeCount?: number;
  likedByViewer?: boolean;
}

export type QuestionStatus = "pending" | "answered" | "rejected";

export interface AdminQuestion {
  id: string;
  content: string;
  answer: string | null;
  status: QuestionStatus;
  createdAt: string;
  answeredAt: string | null;
  parentId: string | null;
  parentContent?: string | null;
}
