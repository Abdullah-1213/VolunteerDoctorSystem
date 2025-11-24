import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("");

  const fetchVisits = useCallback(async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/patient-records/`);
      const filtered = res.data.filter((v) => v.patient_id === id);
      setVisits(filtered);
    } catch (err) {
      console.error("❌ Fetch visits error:", err);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    const isValidCNIC = /^\d{5}-\d{7}-\d{1}$/.test(cnic);

    if (!isValidCNIC) {
      setError("Invalid CNIC format. Please use 12345-1234567-1");
      return;
    }

    setLoading(true);
    setError(null);
    setAction("");

    try {
      const res = await axios.post(`${API_BASE}/check-cnic/`, { cnic });

      if (res.data.exists) {
        setPatientData(res.data.patient);
        fetchVisits(res.data.patient.id);
      } else {
        setPatientData(null);
        setVisits([]);
        setError("Patient not found. Please register new patient.");
      }
    } catch {
      setError("Something went wrong while checking CNIC.");
    } finally {
      setLoading(false);
    }
  }, [cnic, fetchVisits]);

  const handleRegister = useCallback(
    async (data) => {
      try {
        const res = await axios.post(`${API_BASE}/register-patient/`, data);
        setPatientData(res.data);
        fetchVisits(res.data.id);
        setAction("add");
      } catch {
        alert("Registration failed!");
      }
    },
    [fetchVisits]
  );

  const handleAddVitals = useCallback(
    async (data) => {
      if (!patientData) return alert("No patient selected.");

      try {
        const payload = { ...data, patient_id: patientData.id };
        const res = await axios.post(`${API_BASE}/patient-records/`, payload);
        setVisits((prev) => [res.data, ...prev]);
        setAction("view");
      } catch {
        alert("Failed to add record.");
      }
    },
    [patientData]
  );

  const handleDeleteVisit = useCallback(
    async (id) => {
      await axios.delete(`${API_BASE}/patient-records/${id}/`);
      fetchVisits(patientData.id);
    },
    [patientData, fetchVisits]
  );

  const handleUpdateVisit = useCallback(
    async (id, data) => {
      await axios.put(`${API_BASE}/patient-records/${id}/`, data);
      fetchVisits(patientData.id);
    },
    [patientData, fetchVisits]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
            Add Patient Record
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Search by CNIC or register a new patient</p>
        </div>

        {/* CNIC SEARCH */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <CnicForm
            cnic={cnic}
            setCnic={setCnic}
            handleSearch={handleSearch}
            patientData={patientData}
            error={error}
          />
        </div>
      {/* REGISTRATION FORM */}
      {error && error.includes("register") && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl shadow p-6">
          <PatientRegistrationForm onRegister={handleRegister} prefillCnic={cnic} />
        </div>
      )}

      {loading && <p className="text-blue-500 font-medium">Loading...</p>}

      {/* PATIENT DASHBOARD */}
      {patientData && (
        <>
          {/* Patient Card */}
          <div className="bg-white shadow-lg rounded-2xl p-5 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {patientData.name}
            </h2>
            <p className="text-gray-600 mt-1">CNIC: {patientData.cnic}</p>
          </div>

          {/* Navigation Buttons */}
          {!action && (
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => setAction("add")}
                className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
              >
                ➕ Add New Vitals
              </button>

              <button
                onClick={() => setAction("view")}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
              >
                📋 View Records
              </button>
            </div>
          )}

          {action && (
            <button
              onClick={() => setAction("")}
              className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 transition"
            >
              ← Back
            </button>
          )}

          {/* Add Vitals */}
          {action === "add" && (
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 mt-4">
              <VitalsForm onAddVitals={handleAddVitals} currentPatient={patientData} />
            </div>
          )}

          {/* View Records */}
          {action === "view" && (
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 mt-4">
              <VisitRecords
                visits={visits}
                currentPatient={patientData}
                refreshVisits={() => fetchVisits(patientData.id)}
                onDelete={handleDeleteVisit}
                onUpdate={handleUpdateVisit}
              />
            </div>
          )}
        </>
      )}
    </div>
    </div>
  );
}

PatientVitals.propTypes = {
  token: PropTypes.string,
};
