// src/types.ts

export type ToolKey =
  | "lead_intake"
  | "ai_consultant"
  | "checkout";

export interface Tool {
  key: ToolKey;
  title: string;
  description: string;
  priceMonthly: number;
}

export interface LeadPayload {
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  tool: ToolKey;
}
