import { useState, useEffect } from "react";

// Local storage key
const API_KEY_STORAGE_KEY = "sql_assistant_api_key";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  apiKey: string;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  onSubmit,
  apiKey,
}: ApiKeyModalProps) {
  const [inputApiKey, setInputApiKey] = useState<string>(apiKey);
  const [rememberKey, setRememberKey] = useState<boolean>(true);

  // On component mount, try to load the API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey && !apiKey) {
      // If we have a saved key but no current key, use the saved one
      onSubmit(savedApiKey);
    } else if (apiKey) {
      // If we have a current key, update the input
      setInputApiKey(apiKey);
    }
  }, [apiKey, onSubmit]);

  // Update local state when apiKey prop changes
  useEffect(() => {
    setInputApiKey(apiKey);
  }, [apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputApiKey.trim()) {
      // Save the API key to localStorage if checkbox is checked
      if (rememberKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, inputApiKey.trim());
      } else {
        // Remove from localStorage if the checkbox is unchecked
        localStorage.removeItem(API_KEY_STORAGE_KEY);
      }

      onSubmit(inputApiKey.trim());
    }
  };

  const handleClearAndClose = () => {
    // Clear from localStorage and state
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Enter API Key</h2>
        <p className="text-gray-600 mb-4">
          Please enter your API key to use the SQL Query Assistant. Your API key
          is required to authenticate with the backend service.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors duration-150 ease-in-out"
              placeholder="Enter your API key"
              autoFocus
            />
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="rememberKey"
              checked={rememberKey}
              onChange={(e) => setRememberKey(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-gray-300 rounded transition-colors duration-150 ease-in-out"
            />
            <label
              htmlFor="rememberKey"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember API key on this device
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            {apiKey && (
              <button
                type="button"
                onClick={handleClearAndClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-150 ease-in-out"
              >
                Clear & Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!inputApiKey.trim()}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-150 ease-in-out ${
                !inputApiKey.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400"
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
