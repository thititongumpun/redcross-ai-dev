import { useEffect, useRef, useState } from "react";
import ChatMessage from "./components/chat-message";
import ChatInput from "./components/chat-input";
import ApiKeyModal from "./components/api-key-modal";
import TrainingPage from "./components/train-component";
import { Message, ApiResponse } from "./types/types";

const EXAMPLE_QUESTIONS = [
  "เรามีพนักงานทั้งหมดกี่คน?",
  "แสดงรายได้รวมตามพนักงาน",
  "เงินเดือนเฉลี่ยเท่าไหร่?",
  "แสดง 10 อันดับพนักงานที่มีรายได้รวมสูงสุด",
];

const API_ENDPOINT =
  import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000";

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "Hello! I'm your SQL Assistant. Ask me a question about your data, and I'll generate an SQL query to answer it.",
    },
  ]);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholder, setPlaceholder] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<"chat" | "train">("chat");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRandomPlaceholder();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setRandomPlaceholder = () => {
    const randomIndex = Math.floor(Math.random() * EXAMPLE_QUESTIONS.length);
    setPlaceholder(EXAMPLE_QUESTIONS[randomIndex]);
  };

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const generateMessageId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessageId = generateMessageId();
    setMessages((prev) => [...prev, { id: userMessageId, type: "user", text }]);

    // Add typing indicator
    setIsLoading(true);

    try {
      // Make API request
      const response = await fetch(`${API_ENDPOINT}/api/v1/ai/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ question: text }),
      });

      // Handle errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "An error occurred");
      }

      // Process successful response
      const data: ApiResponse = await response.json();

      // Create bot response message
      const botMessageId = generateMessageId();
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          type: "bot",
          text: data.summary,
          data: {
            sql: data.sql,
            result: data.result,
            followup_questions: data.followup_questions?.filter((q) => q) || [], // Filter out empty questions
          },
        },
      ]);
    } catch (error) {
      // Handle error
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          type: "bot",
          text: `Error: ${errorMessage}. Please try again or check your API key.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            SQL Query Assistant
          </h1>
          <div className="flex items-center space-x-4">
            {/* Navigation */}
            <nav className="flex space-x-2 mr-4">
              <button
                onClick={() => setCurrentPage("chat")}
                className={`px-3 py-1 rounded-md transition ${
                  currentPage === "chat"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setCurrentPage("train")}
                className={`px-3 py-1 rounded-md transition ${
                  currentPage === "train"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Train
              </button>
            </nav>

            <button
              onClick={() => setShowApiKeyModal(true)}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md transition"
            >
              Change API Key
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentPage === "chat" ? (
        <>
          {/* Chat messages container */}
          <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onFollowupClick={handleFollowupClick}
                />
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-white rounded-lg p-4 shadow-sm max-w-3xl">
                    <div className="flex space-x-2">
                      <div className="bg-gray-300 rounded-full h-2 w-2 animate-bounce"></div>
                      <div className="bg-gray-300 rounded-full h-2 w-2 animate-bounce delay-100"></div>
                      <div className="bg-gray-300 rounded-full h-2 w-2 animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input container */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                onSendMessage={handleSendMessage}
                placeholder={placeholder}
                disabled={isLoading || showApiKeyModal}
              />
            </div>
          </div>
        </>
      ) : (
        <TrainingPage />
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => apiKey && setShowApiKeyModal(false)}
        onSubmit={handleApiKeySubmit}
        apiKey={apiKey}
      />
    </div>
  );
}

export default App;
