import { useEffect, useRef } from "react";
import { Message, renderCell } from "../types/types";

interface MessageProps {
  message: Message;
  onFollowupClick: (question: string) => void;
}

export default function ChatMessage({
  message,
  onFollowupClick,
}: MessageProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  // Render HTML table if provided
  useEffect(() => {
    if (message.data?.result?.html_table && tableRef.current) {
      tableRef.current.innerHTML = message.data.result.html_table;
    }
  }, [message]);

  return (
    <div
      className={`flex items-start ${
        message.type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`rounded-lg p-4 max-w-3xl ${
          message.type === "user"
            ? "bg-blue-600 text-white"
            : "bg-white shadow-sm"
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
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto text-gray-800">
              {message.data.sql}
            </pre>
          </div>
        )}

        {/* Table results if available */}
        {message.data?.result && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Results:</h4>
            {message.data.result.html_table ? (
              <div
                ref={tableRef}
                className="overflow-x-auto bg-gray-50 p-2 rounded border border-gray-200 text-gray-800 text-sm"
              />
            ) : message.data.result.columns && message.data.result.data ? (
              <div className="overflow-x-auto bg-gray-50 p-2 rounded border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr>
                      {message.data.result.columns.map((column, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {message.data.result.data.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }
                      >
                        {Array.isArray(row) &&
                          row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-3 py-2 whitespace-nowrap text-gray-500"
                            >
                              {renderCell(cell)}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm transition"
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
}
