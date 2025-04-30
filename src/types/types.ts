// Define shared types used across the application

export interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  data?: {
    sql?: string;
    result?: {
      html_table?: string;
      columns?: string[];
      data?: unknown[][];
    };
    followup_questions?: string[];
  };
}

export interface ApiResponse {
  question: string;
  followup_questions: string[];
  summary: string;
  sql: string;
  result: {
    records: unknown[];
    columns: string[];
    data: unknown[][];
    html_table: string;
    markdown_table: string;
  };
}

// Helper function to safely convert any value to a renderable string
export const renderCell = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === 'object') {
    // For objects (including arrays), convert to JSON string
    return JSON.stringify(value);
  }

  // For primitive values, convert to string
  return String(value);
};