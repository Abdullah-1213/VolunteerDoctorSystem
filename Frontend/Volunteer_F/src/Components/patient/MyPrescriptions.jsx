import React, { useEffect, useState } from "react";
import { 
  FileText, 
  Calendar, 
  User, 
  Copy, 
  Check, 
  Pill,
  Download
} from "lucide-react";
import api from "../../services/api"; // Using the centralized api helper

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        // Using api instance handles the token and base URL automatically
        const response = await api.get("/prescriptions/"); 
        
        // Sort by newest first
        const sortedData = response.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setPrescriptions(sortedData);
      } catch (err) {
        console.error("❌ Error fetching prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
            <div className="h-20 bg-slate-100 rounded mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  // --- Empty State ---
  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
          <FileText size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-600">No Prescriptions Yet</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">
          Prescriptions issued by your doctor during video consultations will appear here.
        </p>
      </div>
    );
  }

  // --- Main List ---
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Pill className="text-emerald-600" size={24} />
        <h2 className="text-2xl font-bold text-slate-800">My Prescriptions</h2>
      </div>

      <div className="space-y-6">
        {prescriptions.map((p) => (
          <div
            key={p.id}
            className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300"
          >
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full border border-slate-200 text-emerald-600">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Doctor</p>
                  <p className="font-semibold text-slate-700">{p.doctor_name || "Specialist"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-sm bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                <Calendar size={14} className="text-slate-400" />
                {formatDate(p.created_at)}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              <div className="relative">
                 {/* Decorative quote mark */}
                <span className="absolute -top-2 -left-2 text-6xl text-slate-100 font-serif leading-none select-none">“</span>
                
                <div className="relative z-10 pl-4 border-l-2 border-emerald-100">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Rx Notes:</p>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-mono text-sm sm:text-base">
                    {p.text}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  onClick={() => handleCopy(p.text, p.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  {copiedId === p.id ? (
                    <>
                      <Check size={16} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copy Text
                    </>
                  )}
                </button>
                
                {/* Optional Download Placeholder - Functionality can be added later */}
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                   <Download size={16} /> Save PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPrescriptions;