import React, { useEffect, useRef } from "react"; // Import React
import { Message, renderCell } from "../types/types";

interface MessageProps {
  message: Message;
  onFollowupClick: (question: string) => void;
}

// Define the component
const ChatMessage: React.FC<MessageProps> = ({
  message,
  onFollowupClick,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  // Render HTML table if provided (and structured data is not available)
  useEffect(() => {
    const result = message.data?.result;
    if (
      result &&
      !(result.columns && result.data) && // Only if structured data is NOT present
      result.html_table &&
      tableRef.current
    ) {
      tableRef.current.innerHTML = result.html_table;
    } else if (tableRef.current) {
      // Clear previous innerHTML if conditions are not met
      tableRef.current.innerHTML = "";
    }
  }, [
    message.data?.result?.columns,
    message.data?.result?.data,
    message.data?.result?.html_table,
  ]);

  return (
    <div
      className={`flex items-start ${
        message.type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`p-4 max-w-3xl ${
          message.type === "user"
            ? "bg-blue-600 text-white rounded-xl shadow-md"
            : "bg-white shadow-sm rounded-xl border border-gray-200"
        }`}
      >
        {/* Message text */}
        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* SQL query if available */}
        {message.data?.sql && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              SQL Query:
            </h4>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-md text-xs overflow-x-auto language-sql">
              <code>{message.data.sql}</code>
            </pre>
          </div>
        )}

        {/* Table results if available */}
        {message.data?.result && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Results:</h4>
            {message.data.result.columns && message.data.result.data ? (
              // **Priority 1: Structured Data Table**
              <div className="overflow-x-auto bg-white p-2 rounded-md border border-gray-300 shadow-sm">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-slate-100">
                    <tr>
                      {message.data.result.columns.map((column, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b-2 border-slate-200"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {message.data.result.data.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }
                      >
                        {Array.isArray(row) &&
                          row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-3 whitespace-nowrap text-slate-600 border-b border-slate-100"
                            >
                              {renderCell(cell)}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : message.data.result.html_table ? (
              // **Priority 2: HTML Table (Fallback)**
              <div
                ref={tableRef}
                className="overflow-x-auto bg-gray-50 p-3 rounded-md border border-gray-300 text-gray-800 text-sm shadow-sm"
                /* useEffect will populate this if this path is taken */
              />
            ) : null}
          </div>
        )}

        {/* Follow-up questions if available */}
        {message.data?.followup_questions &&
          message.data.followup_questions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Follow-up questions:
              </h4>
              <div className="flex flex-wrap gap-2">
                {message.data.followup_questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => onFollowupClick(question)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded-full text-sm transition shadow-sm hover:shadow-md"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

// Export the memoized component
export default React.memo(ChatMessage);
