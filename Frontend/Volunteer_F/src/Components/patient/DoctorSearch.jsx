// src/components/DoctorSearch.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { User, Stethoscope } from "lucide-react";

const DoctorSearch = ({ onSelect }) => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Token before request:", token);
    setLoading(true);

    api.get('doctors/')
      .then(res => setDoctors(res.data))
      .catch(err => {
        console.error("Error fetching doctors:", err.response?.data || err.message);
        setError("Failed to load doctors. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl border border-green-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
        Select a Doctor
      </h2>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading && <p className="text-gray-500 text-center">Loading doctors...</p>}

      <div className="space-y-4">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className="p-4 border rounded-lg shadow hover:shadow-md cursor-pointer transition bg-green-50 hover:bg-green-100 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-200 p-3 rounded-full">
                <User className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {doc.full_name || doc.email}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-1 text-green-600" />
                  {doc.specialization || "General Practitioner"}
                </p>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
            >
              Select
            </button>
          </div>
        ))}
      </div>

      {!loading && doctors.length === 0 && !error && (
        <p className="text-gray-500 text-center mt-4">No doctors available.</p>
      )}
    </div>
  );
};

export default DoctorSearch;
