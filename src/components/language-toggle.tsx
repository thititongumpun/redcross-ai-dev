interface LanguageToggleProps {
  language: "english" | "thai";
  onLanguageChange: (language: "english" | "thai") => void;
}

export default function LanguageToggle({
  language,
  onLanguageChange,
}: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        className={`px-3 py-1 text-sm font-medium rounded-md transition ${
          language === "english"
            ? "bg-green-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        onClick={() => onLanguageChange("english")}
      >
        English
      </button>
      <button
        className={`px-3 py-1 text-sm font-medium rounded-md transition ${
          language === "thai"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        onClick={() => onLanguageChange("thai")}
      >
        ภาษาไทย
      </button>
    </div>
  );
}
