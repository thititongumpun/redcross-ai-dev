import { useEffect, useState, useRef, useCallback } from "react";

// Define the API response item interface
interface ApiTrainingItem {
  id?: string;
  question?: string | null;
  content?: string;
  training_data_type?:
    | "ddl"
    | "sql"
    | "documentation"
    | "example"
    | "question"
    | string;
}

// TrainingDataItem type with updated training data types
interface TrainingDataItem {
  id: string;
  question: string | null;
  content: string;
  training_data_type: "ddl" | "sql" | "documentation" | "example" | "question";
}

// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000";
const TRAIN_API_ENDPOINT = `${API_BASE_URL}/api/v1/train`;

// TrainingPage component
const TrainingPage = () => {
  // State variables
  const [trainingData, setTrainingData] = useState<TrainingDataItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TrainingDataItem | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("example");
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Refs for form inputs
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const sqlQueryRef = useRef<HTMLTextAreaElement>(null);
  const ddlRef = useRef<HTMLTextAreaElement>(null);
  const sqlRef = useRef<HTMLTextAreaElement>(null);
  const documentationRef = useRef<HTMLTextAreaElement>(null);

  // Get the API key from localStorage
  const getApiKey = () => {
    return localStorage.getItem("sql_assistant_api_key") || "";
  };

  // Fetch training data from API (using useCallback to avoid dependency issues)
  const fetchTrainingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(TRAIN_API_ENDPOINT, {
        headers: {
          "x-api-key": getApiKey(),
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching training data: ${response.statusText}`);
      }

      const data: ApiTrainingItem[] = await response.json();

      // Make sure the data is in the expected format
      const formattedData: TrainingDataItem[] = data.map((item) => ({
        id: item.id || `item-${Math.random().toString(36).slice(2, 9)}`,
        question: item.question || null,
        content: item.content || "",
        training_data_type:
          (item.training_data_type as
            | "ddl"
            | "sql"
            | "documentation"
            | "example"
            | "question") || "documentation",
      }));

      setTrainingData(formattedData);
    } catch (error) {
      console.error("Error fetching training data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching training data"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch training data on component mount
  useEffect(() => {
    fetchTrainingData();
  }, [fetchTrainingData]);

  // Reset success messages after a delay
  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);

  // Reset add success messages after a delay
  useEffect(() => {
    if (addSuccess) {
      const timer = setTimeout(() => {
        setAddSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [addSuccess]);

  // Filter training data based on type
  const filteredData = trainingData.filter((item) => {
    if (filterType === "all") return true;
    // Match both "example" and "question" types for the "Examples" filter
    if (
      filterType === "example" &&
      (item.training_data_type === "example" ||
        item.training_data_type === "question")
    )
      return true;
    return item.training_data_type === filterType;
  });

  // Delete training data item
  const handleDeleteItem = async (id: string) => {
    if (!id || isDeleting) return;

    setIsDeleting(true);
    setError(null);
    setDeleteSuccess(null);

    try {
      const response = await fetch(TRAIN_API_ENDPOINT, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": getApiKey(),
        },
        body: JSON.stringify({
          id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting item: ${response.statusText}`);
      }

      // Remove item from local state
      setTrainingData(trainingData.filter((item) => item.id !== id));

      // If the deleted item was selected, clear the selection
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }

      setDeleteSuccess(`Successfully deleted item with ID: ${id}`);
    } catch (error) {
      console.error("Error deleting item:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the item"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Add a new training example (question-SQL pair)
  const handleAddTrainingExample = async () => {
    if (!questionRef.current || !sqlQueryRef.current) return;

    const question = questionRef.current.value;
    const sqlQuery = sqlQueryRef.current.value;

    if (!question.trim() || !sqlQuery.trim()) {
      setError("Both question and SQL query are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAddSuccess(null);

    try {
      const response = await fetch(TRAIN_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": getApiKey(),
        },
        body: JSON.stringify({
          question,
          sql: sqlQuery,
          training_data_type: "question", // Setting to "question" to match backend
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error adding training example: ${response.statusText}`
        );
      }

      // Refresh training data to get the new item with the correct ID
      await fetchTrainingData();

      // Reset form
      questionRef.current.value = "";
      sqlQueryRef.current.value = "";

      setAddSuccess("Successfully added question-SQL example");
    } catch (error) {
      console.error("Error adding training example:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while adding the example"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add DDL training data
  const handleAddDDL = async () => {
    if (!ddlRef.current) return;

    const ddl = ddlRef.current.value;

    if (!ddl.trim()) {
      setError("DDL statement is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAddSuccess(null);

    try {
      const response = await fetch(TRAIN_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": getApiKey(),
        },
        body: JSON.stringify({
          ddl,
          training_data_type: "ddl",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error adding DDL: ${response.statusText}`);
      }

      // Refresh training data to get the new item with the correct ID
      await fetchTrainingData();

      // Reset form
      ddlRef.current.value = "";

      setAddSuccess("Successfully added DDL statement");
    } catch (error) {
      console.error("Error adding DDL:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while adding the DDL"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add SQL training data
  const handleAddSQL = async () => {
    if (!sqlRef.current) return;

    const sql = sqlRef.current.value;

    if (!sql.trim()) {
      setError("SQL query is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAddSuccess(null);

    try {
      const response = await fetch(TRAIN_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": getApiKey(),
        },
        body: JSON.stringify({
          sql,
          training_data_type: "sql",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error adding SQL: ${response.statusText}`);
      }

      // Refresh training data to get the new item with the correct ID
      await fetchTrainingData();

      // Reset form
      sqlRef.current.value = "";

      setAddSuccess("Successfully added SQL query");
    } catch (error) {
      console.error("Error adding SQL:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while adding the SQL"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add documentation training data
  const handleAddDocumentation = async () => {
    if (!documentationRef.current) return;

    const documentation = documentationRef.current.value;

    if (!documentation.trim()) {
      setError("Documentation is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAddSuccess(null);

    try {
      const response = await fetch(TRAIN_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": getApiKey(),
        },
        body: JSON.stringify({
          document: documentation,
          training_data_type: "documentation",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error adding documentation: ${response.statusText}`);
      }

      // Refresh training data to get the new item with the correct ID
      await fetchTrainingData();

      // Reset form
      documentationRef.current.value = "";

      setAddSuccess("Successfully added documentation");
    } catch (error) {
      console.error("Error adding documentation:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while adding the documentation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle item selection
  const handleItemSelect = (item: TrainingDataItem) => {
    setSelectedItem(item);
  };

  // Get display name for training data type
  const getTypeDisplayName = (type: string): string => {
    switch (type) {
      case "ddl":
        return "DDL/Schema";
      case "sql":
        return "SQL Query";
      case "documentation":
        return "Documentation";
      case "example":
      case "question":
        return "Example";
      default:
        return type;
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "example":
        return (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <textarea
                  ref={questionRef}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter a natural language question..."
                  disabled={isSubmitting}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SQL Query
                </label>
                <textarea
                  ref={sqlQueryRef}
                  className="w-full p-2 border border-gray-300 rounded-md font-mono"
                  rows={3}
                  placeholder="Enter the corresponding SQL query..."
                  disabled={isSubmitting}
                ></textarea>
              </div>
            </div>
            <button
              className={`mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handleAddTrainingExample}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Example"}
            </button>
          </div>
        );
      case "ddl":
        return (
          <div className="bg-gray-50 p-4 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DDL Statement
              </label>
              <textarea
                ref={ddlRef}
                className="w-full p-2 border border-gray-300 rounded-md font-mono"
                rows={6}
                placeholder="Enter a DDL statement (e.g., CREATE TABLE my_table ...)..."
                disabled={isSubmitting}
              ></textarea>
            </div>
            <button
              className={`mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handleAddDDL}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add DDL"}
            </button>
          </div>
        );
      case "sql":
        return (
          <div className="bg-gray-50 p-4 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SQL Query
              </label>
              <textarea
                ref={sqlRef}
                className="w-full p-2 border border-gray-300 rounded-md font-mono"
                rows={6}
                placeholder="Enter a SQL query (e.g., SELECT * FROM employees WHERE ...)..."
                disabled={isSubmitting}
              ></textarea>
            </div>
            <button
              className={`mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handleAddSQL}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add SQL"}
            </button>
          </div>
        );
      case "documentation":
        return (
          <div className="bg-gray-50 p-4 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documentation
              </label>
              <textarea
                ref={documentationRef}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={6}
                placeholder="Enter documentation about your database, business rules, or domain knowledge..."
                disabled={isSubmitting}
              ></textarea>
            </div>
            <button
              className={`mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handleAddDocumentation}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Documentation"}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Training Dashboard</h2>
        <p className="mb-6">
          Use this page to manage the training data for your SQL Assistant. You
          can train the model using different types of data to improve its
          performance.
        </p>

        {/* Add Training Data Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Add Training Data</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {deleteSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 border border-green-200 rounded-md">
              {deleteSuccess}
            </div>
          )}

          {addSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 border border-green-200 rounded-md">
              {addSuccess}
            </div>
          )}

          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex -mb-px">
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "example"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("example")}
              >
                Question-SQL Example
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "ddl"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("ddl")}
              >
                DDL Statement
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "sql"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("sql")}
              >
                SQL Query
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "documentation"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("documentation")}
              >
                Documentation
              </button>
            </nav>
          </div>

          {/* Tab content */}
          {renderTabContent()}
        </div>

        {/* Training Data Browser Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Training Data</h3>
            <div className="flex space-x-2">
              <select
                className="border border-gray-300 rounded-md p-1 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="ddl">DDL/Schema</option>
                <option value="sql">SQL Queries</option>
                <option value="documentation">Documentation</option>
                <option value="example">Examples</option>
              </select>
              <button
                onClick={fetchTrainingData}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left panel - List of training data items */}
            <div className="border border-gray-200 rounded-md overflow-hidden md:col-span-1">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium">
                Data Items ({filteredData.length})
              </div>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {filteredData.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No data found for the selected filter.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {filteredData.map((item) => (
                        <li
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedItem?.id === item.id ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="font-medium truncate">
                            {item.question ||
                              item.content.split("\n")[0].substring(0, 40)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getTypeDisplayName(item.training_data_type)} •{" "}
                            {item.id.substring(0, 8)}
                            ...
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Right panel - Details of selected item */}
            <div className="border border-gray-200 rounded-md overflow-hidden md:col-span-2">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium flex justify-between items-center">
                <div>Content Preview</div>
                {selectedItem && (
                  <button
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className={`text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded-md ${
                      isDeleting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Item"}
                  </button>
                )}
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {selectedItem ? (
                  <div>
                    {selectedItem.question && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question:
                        </label>
                        <div className="p-2 bg-gray-50 rounded-md">
                          {selectedItem.question}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content:
                      </label>
                      <pre className="p-2 bg-gray-50 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                        {selectedItem.content}
                      </pre>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Type:{" "}
                      {getTypeDisplayName(selectedItem.training_data_type)} •
                      ID: {selectedItem.id}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    Select an item to view its content
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPage;
