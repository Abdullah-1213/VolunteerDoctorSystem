import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import CnicForm from "./CnicForm";
import PatientRegistrationForm from "./PatientRegistrationForm";
import VitalsForm from "./VitalsForm";
import VisitRecords from "./VisitRecords";

const API_BASE = "https://9478c91b2994.ngrok-free.app/api";

// ✅ Always attach token in axios headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const PatientVitals = () => {
  const [cnic, setCnic] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(""); // "add" | "view" | ""
 
  // 🔍 Check CNIC
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAction("");

    try {
      console.log("🔑 Sending token:", localStorage.getItem("token"));
      const res = await axios.post(`${API_BASE}/check-cnic/`, { cnic });
      console.log("✅ Response:", res.data);

      if (res.data.exists) {
        setPatientData(res.data.patient);
        fetchVisits(res.data.patient.id);
      } else {
        setError("Patient not found. Please register new patient.");
        setPatientData(null);
        setVisits([]);
      }
    } catch (err) {
      console.error("❌ CNIC check failed:", err.response || err);
      if (err.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError("Something went wrong while checking CNIC.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 📝 Register new patient
  const handleRegister = async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/register-patient/`, data);
      alert("✅ Patient registered successfully!");
      setPatientData(res.data);
      setError(null);
      setAction("add"); // Optionally go directly to Add Record for new patient
      fetchVisits(res.data.id);
    } catch (err) {
      console.error("❌ Registration failed:", err.response || err);
      alert("Registration failed. Try again.");
    }
  };

  // ➕ Add vitals / visit record
  const handleAddVitals = async (data) => {
    if (!patientData) return alert("No patient selected.");

    try {
      const payload = { ...data, patient_id: patientData.id };
      const res = await axios.post(`${API_BASE}/patient-records/`, payload);
      setVisits((prev) => [res.data, ...prev]);
      alert("✅ Vitals added successfully!");
      setAction("view")
    } catch (err) {
      console.error("❌ Add vitals failed:", err.response || err);
      alert("Failed to add vitals.");
    }
  };

  // 🔁 Fetch all visits
  async function fetchVisits(patientId) {
    try {
      const res = await axios.get(`${API_BASE}/patient-records/`);
      const patientVisits = res.data.filter((v) => v.patient_id === patientId);
      setVisits(patientVisits);
    } catch (err) {
      console.error("❌ Error fetching visits:", err.response || err);
    }
  }

  // 🗑 Delete visit
  const handleDeleteVisit = async (id) => {
    try {
      await axios.delete(`${API_BASE}/patient-records/${id}/`);
      fetchVisits(patientData.id);
    } catch (err) {
      console.error("❌ Delete failed:", err.response || err);
    }
  };

  // ✏️ Update visit
  const handleUpdateVisit = async (id, data) => {
    try {
      await axios.put(`${API_BASE}/patient-records/${id}/`, data);
      fetchVisits(patientData.id);
    } catch (err) {
      console.error("❌ Update failed:", err.response || err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6 p-4">
      {/* 🔍 Search CNIC */}
      <CnicForm
        cnic={cnic}
        setCnic={setCnic}
        handleSearch={handleSearch}
        patientData={patientData}
        error={error}
      />

      {/* 🧾 If not found, register */}
      {error && error.includes("register") && (
        <PatientRegistrationForm 
          onRegister={handleRegister} 
          prefillCnic={cnic} // Pass the searched CNIC here
        />
      )}

      {/* 🔄 Loader */}
      {loading && <p className="text-blue-500">Loading...</p>}

      {/* ✅ If patient found */}
      {patientData && (
        <>
          <h2 className="text-2xl font-semibold text-gray-800">
            Patient: {patientData.name} ({patientData.cnic})
          </h2>
          {/* 🔙 Back button */}
          {action && (
            <button
              onClick={() => setAction("")}
              className="mt-2 px-3 py-1 bg-blue-300 rounded"
            >
              Back
            </button>
          )}
          {/* ➡️ Show action buttons if no action selected */}
          {!action && (
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setAction("add")}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Add Record
              </button>

              <button
                onClick={() => setAction("view")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                View Records
              </button>
            </div>
          )}

          {/* 🔹 Add Record Form */}
          {action === "add" && (
            <VitalsForm
              onAddVitals={handleAddVitals}
              currentPatient={patientData}
            />
          )}

          {/* 🔹 View Records */}
          {action === "view" && (
            <VisitRecords
              visits={visits}
              currentPatient={patientData}
              refreshVisits={() => fetchVisits(patientData.id)}
              onDelete={handleDeleteVisit}
              onUpdate={handleUpdateVisit}
            />
          )}

          
      
        </>
      )}
    </div>
  );
};

PatientVitals.propTypes = {
  token: PropTypes.string,
};

export default PatientVitals;
