/** MVP action taxonomy — Action Taxonomy v1 (15 types) */
export interface ActionTypeDefinition {
  actionCode: string;
  actionName: string;
  domain: string;
  templateId: string;
}

export const MVP_ACTION_TYPES: ActionTypeDefinition[] = [
  { actionCode: "A.2.1", actionName: "Surface Repair", domain: "A", templateId: "CT-A.2.1@v1" },
  { actionCode: "A.4.1", actionName: "Routine Maintenance", domain: "A", templateId: "CT-A.4.1@v1" },
  { actionCode: "A.4.2", actionName: "Cleaning & Sanitization", domain: "A", templateId: "CT-A.4.2@v1" },
  { actionCode: "B.1.2", actionName: "Plumbing Service", domain: "B", templateId: "CT-B.1.2@v1" },
  { actionCode: "B.2.1", actionName: "Electrical Installation", domain: "B", templateId: "CT-B.2.1@v1" },
  { actionCode: "B.3.3", actionName: "Technical Troubleshooting", domain: "B", templateId: "CT-B.3.3@v1" },
  { actionCode: "C.1.1", actionName: "Strategy Consulting", domain: "C", templateId: "CT-C.1.1@v1" },
  { actionCode: "C.1.2", actionName: "Operations Advisory", domain: "C", templateId: "CT-C.1.2@v1" },
  { actionCode: "D.1.1", actionName: "Personal Care Assistance", domain: "D", templateId: "CT-D.1.1@v1" },
  { actionCode: "D.3.1", actionName: "Household Management Aid", domain: "D", templateId: "CT-D.3.1@v1" },
  { actionCode: "E.1.1", actionName: "Graphic Design", domain: "E", templateId: "CT-E.1.1@v1" },
  { actionCode: "E.3.1", actionName: "Custom Software Development", domain: "E", templateId: "CT-E.3.1@v1" },
  { actionCode: "F.1.2", actionName: "Event Coordination", domain: "F", templateId: "CT-F.1.2@v1" },
  { actionCode: "G.1.1", actionName: "One-to-One Tutoring", domain: "G", templateId: "CT-G.1.1@v1" },
  { actionCode: "H.1.1", actionName: "Property Condition Assessment", domain: "H", templateId: "CT-H.1.1@v1" },
];

const byCode = new Map(MVP_ACTION_TYPES.map((t) => [t.actionCode, t]));

export function getActionType(code: string): ActionTypeDefinition | undefined {
  return byCode.get(code);
}

export function listActionTypes(): ActionTypeDefinition[] {
  return [...MVP_ACTION_TYPES];
}

export type ActionStatus =
  | "draft"
  | "tekrr_in_progress"
  | "ready_for_contract"
  | "contract_pending"
  | "contract_active"
  | "completed"
  | "cancelled";

export type TekrrDimension = "T" | "E" | "K" | "R" | "S";

export type TekrrProfile = Partial<Record<TekrrDimension, Record<string, unknown>>>;

export interface Action {
  id: string;
  actionCode: string;
  actionName: string;
  domain: string;
  status: ActionStatus;
  customerId: string;
  providerId: string | null;
  invitedProviderEmail: string | null;
  companyId: string | null;
  title: string;
  description: string | null;
  tekrrProfile: TekrrProfile;
  tekrrCompleteness: number;
  tekrrFrameworkVersion: string;
  templateId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
