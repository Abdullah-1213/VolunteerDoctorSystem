import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Activity, 
  History, 
  Search, 
  User, 
  X, 
  ChevronLeft,
  Stethoscope
} from "lucide-react";

// Keep your existing sub-components
import CnicForm from "./CnicForm";
import PatientRegistrationForm from "./PatientRegistrationForm";
import VitalsForm from "./VitalsForm";
import VisitRecords from "./VisitRecords";

const API_BASE = "http://localhost:8000/api";

// Axios token attach
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function PatientVitals() {
  const [cnic, setCnic] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add"); // "add" | "history"
  const [showRegister, setShowRegister] = useState(false);

  // -- API LOGIC --

  const fetchVisits = useCallback(async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/patient-records/`);
      const filtered = res.data.filter((v) => v.patient_id === id);
      setVisits(filtered);
    } catch (err) {
      console.error("Fetch visits error:", err);
      toast.error("Could not load visit history");
    }
  }, []);

  const handleSearch = useCallback(async () => {
    const isValidCNIC = /^\d{5}-\d{7}-\d{1}$/.test(cnic);
    if (!isValidCNIC) {
      toast.error("Invalid CNIC format. Use 12345-1234567-1");
      return;
    }

    setLoading(true);
    setShowRegister(false);

    try {
      const res = await axios.post(`${API_BASE}/check-cnic/`, { cnic });

      if (res.data.exists) {
        setPatientData(res.data.patient);
        fetchVisits(res.data.patient.id);
        setActiveTab("add");
        toast.success("Patient found");
      } else {
        setPatientData(null);
        setVisits([]);
        setShowRegister(true);
        toast.custom((t) => (
          <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Patient not found. Please register.</span>
          </div>
        ));
      }
    } catch {
      toast.error("Network error while checking CNIC");
    } finally {
      setLoading(false);
    }
  }, [cnic, fetchVisits]);

  const handleRegister = useCallback(async (data) => {
    const toastId = toast.loading("Registering patient...");
    try {
      const res = await axios.post(`${API_BASE}/register-patient/`, data);
      setPatientData(res.data);
      fetchVisits(res.data.id);
      setShowRegister(false);
      setActiveTab("add");
      toast.success("Registration Successful! 🎉", { id: toastId });
    } catch {
      toast.error("Registration failed!", { id: toastId });
    }
  }, [fetchVisits]);

  const handleAddVitals = useCallback(async (data) => {
    if (!patientData) return toast.error("No patient selected");
    const toastId = toast.loading("Saving vitals...");

    try {
      const payload = { ...data, patient_id: patientData.id };
      const res = await axios.post(`${API_BASE}/patient-records/`, payload);
      setVisits((prev) => [res.data, ...prev]);
      setActiveTab("history"); // Auto-switch to history to show the new record
      toast.success("Vitals Recorded Successfully", { id: toastId });
    } catch {
      toast.error("Failed to add record", { id: toastId });
    }
  }, [patientData]);

  const handleDeleteVisit = useCallback(async (id) => {
    if(!confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${API_BASE}/patient-records/${id}/`);
      fetchVisits(patientData.id);
      toast.success("Record deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  }, [patientData, fetchVisits]);

  const handleUpdateVisit = useCallback(async (id, data) => {
    try {
      await axios.put(`${API_BASE}/patient-records/${id}/`, data);
      fetchVisits(patientData.id);
      toast.success("Record updated");
    } catch (e) {
      toast.error("Failed to update");
    }
  }, [patientData, fetchVisits]);

  const clearSession = () => {
    setPatientData(null);
    setCnic("");
    setShowRegister(false);
    setVisits([]);
  };

  // -- RENDER --

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <Toaster position="top-right" />
      
      {/* HEADER */}

          {patientData && (
            <button onClick={clearSession} className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors">
              <X className="w-4 h-4" /> End Session
            </button>
          )}
        

      <main className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* PHASE 1: SEARCH (Always visible if no patient, or accessible via CNIC edit) */}
        {!patientData && !showRegister && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center space-y-6 mt-12"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-800">Patient Intake</h2>
              <p className="text-slate-500">Enter CNIC to pull records or register a new patient.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <CnicForm
                cnic={cnic}
                setCnic={setCnic}
                handleSearch={handleSearch}
                loading={loading} // Pass loading state if supported
              />
              {/* Optional: Add a custom styled button here if CnicForm's button isn't flexible */}
            </div>
          </motion.div>
        )}

        {/* PHASE 2: REGISTRATION (If not found) */}
        {showRegister && !patientData && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
            <button onClick={() => setShowRegister(false)} className="mb-4 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to Search
            </button>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-900">New Patient Registration</h3>
              </div>
              <div className="p-6">
                <PatientRegistrationForm onRegister={handleRegister} prefillCnic={cnic} />
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: PATIENT DASHBOARD (If patient found) */}
        {patientData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {patientData.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{patientData.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {patientData.cnic}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                 <div className="bg-slate-50 px-4 py-2 rounded-lg text-center border border-slate-100 flex-1 md:flex-none">
                    <span className="block text-xs text-slate-400 uppercase font-bold">Visits</span>
                    <span className="text-xl font-bold text-slate-700">{visits.length}</span>
                 </div>
              </div>
            </div>

            {/* Main Workspace with Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("add")}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
                    activeTab === "add" ? "text-blue-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Activity className="w-4 h-4" /> Record Vitals
                  {activeTab === "add" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
                    activeTab === "history" ? "text-blue-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <History className="w-4 h-4" /> History & Logs
                  {activeTab === "history" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 bg-slate-50/50 flex-1">
                <AnimatePresence mode="wait">
                  {activeTab === "add" ? (
                    <motion.div 
                      key="add"
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 10 }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">New Vitals Entry</h3>
                        <VitalsForm
                          onAddVitals={handleAddVitals}
                          currentPatient={patientData}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="history"
                      initial={{ opacity: 0, x: 10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -10 }}
                    >
                       <VisitRecords
                        visits={visits}
                        currentPatient={patientData}
                        refreshVisits={() => fetchVisits(patientData.id)}
                        onDelete={handleDeleteVisit}
                        onUpdate={handleUpdateVisit}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        )}
      </main>
    </div>
  );
}

PatientVitals.propTypes = {
  token: PropTypes.string,
};