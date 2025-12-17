import { useState } from "react";
import Button from "../Components/Button";
import Input from "../Components/Input";
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ArrowTopRightOnSquareIcon, 
  BeakerIcon, 
  ShieldExclamationIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function DrugSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drugData, setDrugData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDrugs, setExpandedDrugs] = useState(new Set());

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
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;

    setLoading(true);
    setError(null);
    setDrugData([]);

    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        "ngrok-skip-browser-warning": "true",
      };

      const response = await fetch(
        `http://127.0.0.1:8000/api/drugs/search?name=${encodeURIComponent(trimmedTerm)}`,
        { method: "GET", headers }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format");
      }

      const data = await response.json();
      setDrugData(data);
    } catch (error) {
      console.error("Search error:", error);
      let friendlyMessage = "We encountered an issue retrieving the drug data.";
      
      if (error.message.includes("Failed to fetch")) {
        friendlyMessage = "Connection failed. Please check your internet connection.";
      } else if (error.message.includes("404")) {
        friendlyMessage = "No drugs found matching that name.";
      }

      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Sub-Components for cleaner UI ---

  const Badge = ({ children, color = "gray" }) => {
    const colors = {
      gray: "bg-gray-100 text-gray-700 border-gray-200",
      red: "bg-red-50 text-red-700 border-red-200",
      yellow: "bg-amber-50 text-amber-700 border-amber-200",
      green: "bg-emerald-50 text-emerald-700 border-emerald-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]} inline-flex items-center gap-1`}>
        {children}
      </span>
    );
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-slate-500 min-w-[120px]">{label}</span>
      <span className="text-sm text-slate-800 font-medium text-right sm:text-left mt-1 sm:mt-0">{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 px-4 mb-20">
      
      {/* Header Section */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          Clinical Drug Search
        </h1>
        <p className="text-slate-500 text-lg">
          Access comprehensive pharmaceutical data, safety warnings, and interactions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-6 w-6 text-slate-400" />
        </div>
        <form onSubmit={handleSearch} className="relative group">
          <Input
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search generic or brand names (e.g. Panadol, Aspirin)..."
            className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-lg transition-all duration-300 placeholder:text-slate-400"
          />
          <div className="absolute right-2 top-2 bottom-2">
            <Button
              type="submit"
              disabled={loading || !searchTerm}
              className={`h-full px-6 rounded-xl font-semibold transition-all duration-200 ${
                loading || !searchTerm 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3">
          <ShieldExclamationIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-bold">Search Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* No Results */}
      {drugData.length === 0 && !loading && searchTerm && !error && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <BeakerIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No results found for "{searchTerm}"</p>
          <p className="text-slate-400 text-sm">Check the spelling or try the generic name.</p>
        </div>
      )}

      {/* Results Grid */}
      <div className="space-y-6">
        {drugData.map((drug) => {
          const isExpanded = expandedDrugs.has(drug.id);
          const pregRisk = drug.pregnancy_category === 'X' ? 'red' : drug.pregnancy_category === 'D' ? 'yellow' : 'blue';
          const alcRisk = drug.alcohol.toLowerCase().includes('major') ? 'red' : drug.alcohol.toLowerCase().includes('moderate') ? 'yellow' : 'green';

          return (
            <div 
              key={drug.id} 
              className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 overflow-hidden group"
            >
              {/* Card Header / Summary */}
              <div className="p-6 cursor-pointer" onClick={() => toggleExpand(drug.id)}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Title & Generic */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {drug.drug_name}
                      </h3>
                      {drug.rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                          <StarIconSolid className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-amber-700">{drug.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Generic</span>
                      {drug.generic_name}
                    </p>
                  </div>

                  {/* Quick Safety Chips */}
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <Badge color={pregRisk}>Pregnancy: Cat {drug.pregnancy_category}</Badge>
                    <Badge color={alcRisk}>Alcohol: {drug.alcohol}</Badge>
                    <Badge color="gray">{drug.rx_otc}</Badge>
                  </div>
                </div>

                {/* Medical Condition Snippet */}
                <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Used for: </span>
                    {drug.medical_condition}
                  </p>
                </div>
              </div>

              {/* Expandable Details Area */}
              <div 
                className={`transition-all duration-300 ease-in-out bg-slate-50 border-t border-slate-200 ${
                  isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Key Attributes */}
                  <div className="lg:col-span-1 space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Specifications</h4>
                    <div className="space-y-1">
                      <InfoRow label="Drug Class" value={drug.drug_classes} />
                      <InfoRow label="Brand Names" value={drug.brand_names} />
                      <InfoRow label="Activity" value={drug.activity} />
                      <InfoRow label="CSA Schedule" value={drug.csa} />
                      <InfoRow label="Reviews" value={`${drug.no_of_reviews} Patient Reviews`} />
                    </div>
                  </div>

                  {/* Middle Column: Detailed Safety */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Side Effects Box */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                      <h4 className="flex items-center gap-2 text-red-800 font-bold mb-3">
                        <ShieldExclamationIcon className="w-5 h-5" />
                        Side Effects & Warnings
                      </h4>
                      <p className="text-sm text-red-900/80 leading-relaxed">
                        {drug.side_effects}
                      </p>
                    </div>

                    {/* Condition Details */}
                    <div>
                      <h4 className="text-slate-800 font-bold mb-2">Condition Details</h4>
                      <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                        {drug.medical_condition_description || "No specific condition details available."}
                      </p>
                    </div>

                    {/* External Link */}
                    <div className="flex justify-end pt-2">
                      <a
                        href={drug.drug_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline"
                      >
                        View Full Clinical Monograph
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expansion Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(drug.id);
                }}
                className="w-full py-3 bg-white border-t border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                {isExpanded ? (
                  <>Show Less <ChevronUpIcon className="w-4 h-4" /></>
                ) : (
                  <>Show Full Details <ChevronDownIcon className="w-4 h-4" /></>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}