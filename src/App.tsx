import { useEffect, useRef, useState, useCallback } from "react";
import ChatMessage from "./components/chat-message";
import ChatInput from "./components/chat-input";
import ApiKeyModal from "./components/api-key-modal";
import TrainingPage from "./components/train-component";
import Header from "./components/Header"; // Import the new Header component
import Toast from "./components/Toast"; // Import Toast component
import { Message, ApiResponse } from "./types/types";
import { EXAMPLE_QUESTIONS } from "./constants"; // API_ENDPOINT is no longer needed here
import { generateMessageId } from "./utils"; // Import generateMessageId
import { fetchAiResponse } from "./services/api"; // Import the new API service function

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
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

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

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessageId = generateMessageId();
    setMessages((prev) => [...prev, { id: userMessageId, type: "user", text }]);

    // Add typing indicator
    setIsLoading(true);

    try {
      // Use the new API service function
      const data: ApiResponse = await fetchAiResponse(text, apiKey);

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

      // Instead of adding to chat, show a toast notification
      setToastMessage(`Error: ${errorMessage}. Please try again or check your API key.`);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, setMessages, setIsLoading, setToastMessage, setShowToast]); // Added state setters just to be explicit, though React guarantees they are stable. apiKey is the key changing dep.

  const handleFollowupClick = useCallback((question: string) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onChangeApiKey={() => setShowApiKeyModal(true)}
      />

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

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default App;
