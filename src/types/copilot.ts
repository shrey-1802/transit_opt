export type CopilotQueryIntent =
  | 'highest_roi_vehicle'
  | 'expiring_licenses'
  | 'vehicles_in_maintenance'
  | 'fleet_efficiency_summary'
  | 'overdue_service_vehicles'
  | 'top_performing_drivers';

export interface CopilotQueryRequest {
  intent: CopilotQueryIntent;
  parameter?: string;
}

export interface CopilotQueryResult {
  intent: CopilotQueryIntent;
  title: string;
  summary: string;
  generatedAt: string;
  data: any[];
  suggestedAction?: {
    label: string;
    path: string;
  };
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  resultData?: CopilotQueryResult;
}
