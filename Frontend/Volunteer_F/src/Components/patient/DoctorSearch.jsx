// src/components/DoctorSearch.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  User,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Syringe,
  Shield,
  Bone,
  Smile,
  Radio,
  Cross,
  Mic,
  User2,
  Activity,
  Loader2,
  Search,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // 👈 add this

const specializations = [
  { name: "General Physician", icon: Activity },
  { name: "Cardiologist", icon: Heart },
  { name: "Dermatologist", icon: Shield },
  { name: "Dentist", icon: Smile },
  { name: "Neurologist", icon: Brain },
  { name: "Orthopedic Surgeon", icon: Bone },
  { name: "Pediatrician", icon: Baby },
  { name: "Psychiatrist", icon: User2 },
  { name: "Gynecologist", icon: Heart },
  { name: "ENT", icon: Mic },
  { name: "Radiologist", icon: Radio },
  { name: "Anesthesiologist", icon: Syringe },
  { name: "Oncologist", icon: Cross },
];

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate(); // 👈 add this

  const fetchDoctors = (specialization = null) => {
    setLoading(true);
    setError(null);

    const url = specialization
      ? `doctors/?specialization=${encodeURIComponent(specialization)}`
      : `doctors/`;

    api
      .get(url)
      .then((res) => setDoctors(res.data))
      .catch((err) => {
        console.error("Error fetching doctors:", err.response?.data || err.message);
        setError("Failed to load doctors. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedSpec) {
      fetchDoctors(selectedSpec);
    }
  }, [selectedSpec]);

  const filteredSpecs = specializations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-2xl border border-green-200">
      <h2 className="text-3xl font-bold text-center mb-6 text-green-700">
        {selectedSpec ? `${selectedSpec} Specialists` : "Find a Doctor"}
      </h2>

      {/* 🔍 Search Bar */}
      {!selectedSpec && (
        <div className="mb-6 flex justify-center">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
      )}

      {/* 🔹 Specializations */}
      {!selectedSpec && (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filteredSpecs.map(({ name, icon: Icon }) => (
              <motion.button
                key={name}
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedSpec(name)}
                className="flex flex-col items-center justify-center p-5 rounded-xl border shadow-sm bg-green-50 hover:bg-green-100 transition-all text-green-700"
              >
                <Icon className="w-8 h-8 mb-2 text-green-600" />
                <span className="text-sm font-medium text-center">{name}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 🔹 Doctor List */}
      {selectedSpec && (
        <div className="mt-6">
          <button
            onClick={() => {
              setSelectedSpec(null);
              setDoctors([]);
            }}
            className="mb-4 flex items-center text-sm text-green-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Specializations
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            </div>
          )}

          <div className="space-y-4">
            {doctors.map((doc) => (
              <motion.div
                key={doc.id}
                whileHover={{ scale: 1.02 }}
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
                      {doc.specialization || selectedSpec}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/book-appointment/${doc.id}`)} // 👈 new navigation
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                >
                  Book Appointment
                </button>
              </motion.div>
            ))}
          </div>

          {!loading && doctors.length === 0 && !error && (
            <p className="text-gray-500 text-center mt-4">
              No doctors available for {selectedSpec}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
