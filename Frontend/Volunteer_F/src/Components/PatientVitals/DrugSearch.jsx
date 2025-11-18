import { useState } from "react";
import Button from "../Button"
import Input from "../Input";
import { ChevronDownIcon, ChevronUpIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function DrugSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drugData, setDrugData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDrugs, setExpandedDrugs] = useState(new Set());

  // Only allow alphabet input
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setSearchTerm(value);
    }
  };

  const toggleExpand = (drugId) => {
    const newExpanded = new Set(expandedDrugs);
    if (newExpanded.has(drugId)) {
      newExpanded.delete(drugId);
    } else {
      newExpanded.add(drugId);
    }
    setExpandedDrugs(newExpanded);
  };

const handleSearch = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  const trimmedTerm = searchTerm.trim();
  if (!trimmedTerm) return;

  console.log("🔍 Starting search for:", trimmedTerm); // ✅ Debug: Confirm function runs
  console.log("Token present:", !!localStorage.getItem("access_token")); // ✅ Check auth

  setLoading(true);
  setError(null);
  setDrugData([]);

  try {
    const token = localStorage.getItem("access_token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      "ngrok-skip-browser-warning": "true", // ✅ Must be here
    };
    console.log("Headers being sent:", headers); // ✅ Debug: Confirm header in console

    const response = await fetch(
      `https://9478c91b2994.ngrok-free.app/api/drugs/search?name=${encodeURIComponent(trimmedTerm)}`,
      { method: "GET", headers }
    );

    console.log("Response status:", response.status); // ✅ Debug
    console.log("Response content-type:", response.headers.get("content-type")); // ✅ Should log "application/json"

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Raw error response:", errorText);
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const htmlText = await response.text();
      console.error("Received HTML instead of JSON:", htmlText.substring(0, 200));
      throw new Error("Invalid response: Expected JSON but got HTML. Check ngrok header.");
    }

    const data = await response.json();
    console.log("✅ Parsed data:", data); // ✅ Should log drug array
    setDrugData(data);
  } catch (error) {
    console.error("Search error:", error);
    setError(`Search failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
  const KeyInfo = ({ label, value, icon: Icon, className = "" }) => (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <Icon className="w-4 h-4 text-gray-500" />
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="text-gray-600">{value || "N/A"}</span>
    </div>
  );

  const CriticalInfo = ({ label, value, icon: Icon, severity }) => (
    <div className={`flex items-center space-x-2 text-sm p-2 rounded-lg ${severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' : severity === 'danger' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
      <Icon className={`w-4 h-4 ${severity === 'warning' ? 'text-yellow-600' : severity === 'danger' ? 'text-red-600' : 'text-green-600'}`} />
      <span className="font-semibold text-gray-800">{label}:</span>
      <span className={`font-medium ${severity === 'warning' ? 'text-yellow-800' : severity === 'danger' ? 'text-red-800' : 'text-green-800'}`}>{value}</span>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200">
      <h2 className="text-3xl font-bold text-center text-blue-900 mb-6 flex items-center justify-center space-x-2">
        <span className="text-4xl">💊</span>
        <span>Drug Search</span>
      </h2>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
        <Input
          autoFocus
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();   // 🛑 Stop form submit
              handleSearch();       // ✔ Run your search function manually
            }
          }}
          placeholder="Enter Drug Name (e.g., Aspirin)"
          className="rounded-lg border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200 text-lg py-3"
        />

        <Button
          type="button"
          onClick={handleSearch}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          disabled={loading}
        >

          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Searching...</span>
            </span>
          ) : (
            <>
              <span className="text-xl">🔍</span>
              <span>Search</span>
            </>
          )}
        </Button>
      </form>

      {loading && (
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <p className="text-blue-700 font-semibold flex items-center justify-center space-x-2">
            <span className="text-xl">🔄</span>
            <span>Searching...</span>
          </p>
        </div>
      )}

      {error && (
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-700 font-semibold flex items-center justify-center space-x-2">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {drugData.length === 0 && !loading && searchTerm.trim() && (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500 font-medium flex items-center justify-center space-x-2">
            <span className="text-2xl">❌</span>
            <span>No results found.</span>
          </p>
        </div>
      )}

      {drugData.length > 0 && !loading && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-blue-900 flex items-center space-x-2">
            <span>Results ({drugData.length})</span>
          </h3>
          {drugData.map((drug) => {
            const isExpanded = expandedDrugs.has(drug.id);
            const pregnancySeverity = drug.pregnancy_category === 'X' ? 'danger' : drug.pregnancy_category === 'D' ? 'warning' : 'info';
            const alcoholSeverity = drug.alcohol.includes('Major') ? 'danger' : drug.alcohol.includes('Moderate') ? 'warning' : 'info';
            return (
              <div key={drug.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Header: Essential Info */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h4 className="text-xl font-bold text-blue-800 mb-2">{drug.drug_name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <KeyInfo label="Condition" value={drug.medical_condition} icon={({ className }) => <span className={className}>🩺</span>} />
                    <KeyInfo label="Generic" value={drug.generic_name} icon={({ className }) => <span className={className}>💊</span>} />
                  </div>
                  {/* Critical Alerts */}
                  <div className="mt-3 space-y-2">
                    <CriticalInfo
                      label="Pregnancy"
                      value={drug.pregnancy_category}
                      icon={({ className }) => <span className={className}>👶</span>}
                      severity={pregnancySeverity}
                    />
                    <CriticalInfo
                      label="Alcohol"
                      value={drug.alcohol}
                      icon={({ className }) => <span className={className}>🍸</span>}
                      severity={alcoholSeverity}
                    />
                  </div>
                </div>

                {/* Side Effects - Always Visible, Prominent */}
                <div className="p-4 bg-red-50 border-t border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-red-800 flex items-center space-x-2">
                      <span className="text-xl">⚠️</span>
                      <span>Side Effects</span>
                    </span>
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed">{drug.side_effects}</p>
                </div>

                {/* Expandable Details */}
                <button
                  type="button"
                  onClick={() => toggleExpand(drug.id)}
                  className="w-full flex items-center justify-center p-3 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  <span className="mr-2">{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                  {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <KeyInfo label="Classes" value={drug.drug_classes} icon={({ className }) => <span className={className}>🧑‍⚕️</span>} />
                      <KeyInfo label="Brands" value={drug.brand_names} icon={({ className }) => <span className={className}>🏷</span>} />
                      <KeyInfo label="Activity" value={drug.activity} icon={({ className }) => <span className={className}>⚡</span>} />
                      <KeyInfo label="Rx/OTC" value={drug.rx_otc} icon={({ className }) => <span className={className}>💊</span>} />
                      <KeyInfo label="CSA" value={drug.csa} icon={({ className }) => <span className={className}>💉</span>} />
                      <KeyInfo label="Related" value={drug.related_drugs} icon={({ className }) => <span className={className}>🔗</span>} />
                      <KeyInfo label="Rating" value={drug.rating} icon={({ className }) => <span className={className}>⭐</span>} className="md:col-span-2" />
                      <KeyInfo label="Reviews" value={drug.no_of_reviews} icon={({ className }) => <span className={className}>📝</span>} className="md:col-span-2" />
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-500 mb-2">Condition Details:</p>
                      <p className="text-sm text-gray-700 italic">{drug.medical_condition_description}</p>
                    </div>
                    <div className="flex justify-end pt-2">
                      <a
                        href={drug.drug_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        <span>More Info</span>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}