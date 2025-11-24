import React, { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FIXED_CHART_HEIGHT = 350;

const PatientVitalsGraph = () => {
  const navigate = useNavigate();

  const [cnic, setCnic] = useState('');
  const [patient, setPatient] = useState(null);
  const [vitalsData, setVitalsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVital, setSelectedVital] = useState('all');

  // Format CNIC input
  const formatCnicInput = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  };

  const handleCnicChange = (event) => {
    const formatted = formatCnicInput(event.target.value);
    setCnic(formatted);
    setPatient(null);
    setVitalsData([]);
    setError(null);
  };

  // Fetch Data
  useEffect(() => {
    const isValidCnic = (value) => /^\d{5}-\d{7}-\d{1}$/.test(value);
    if (!cnic) return;

    if (!isValidCnic(cnic)) {
      setError('❌ CNIC format incorrect. Use: 12345-1234567-1');
      return;
    }

    const fetchPatientAndVitals = async () => {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const cnicResponse = await fetch('http://localhost:8000/api/check-cnic/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cnic }),
        });

        if (!cnicResponse.ok) throw new Error('🔒 CNIC check failed.');

        const cnicData = await cnicResponse.json();
        if (!cnicData.exists) {
          setError('⚠️ No patient found with this CNIC.');
          setLoading(false);
          return;
        }

        setPatient(cnicData.patient);

        const visitsResponse = await fetch('http://localhost:8000/api/patient-records/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });

        const visitsData = await visitsResponse.json();
        const filteredVisits = visitsData.filter((v) => v.patient_id === cnicData.patient.id);
        setVitalsData(filteredVisits);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAndVitals();
  }, [cnic, navigate]);

  const parseBP = (bp) => {
    if (!bp) return { systolic: null, diastolic: null };
    const [sys, dia] = bp.split('/').map(Number);
    return { systolic: sys || null, diastolic: dia || null };
  };

  const allDatasets = useMemo(
    () => [
      { label: 'Heart Rate (bpm)', data: vitalsData.map((v) => v.hr ?? null), borderColor: '#22c55e', tension: 0.3, id: 'hr' },
      { label: 'Systolic BP', data: vitalsData.map((v) => parseBP(v.bp).systolic), borderColor: '#ef4444', tension: 0.3, id: 'systolic' },
      { label: 'Diastolic BP', data: vitalsData.map((v) => parseBP(v.bp).diastolic), borderColor: '#8b5cf6', tension: 0.3, id: 'diastolic' },
      { label: 'Temperature (°C)', data: vitalsData.map((v) => v.temp ?? null), borderColor: '#3b82f6', tension: 0.3, id: 'temp' },
      { label: 'Oxygen (%)', data: vitalsData.map((v) => v.spo2 ?? null), borderColor: '#f59e0b', tension: 0.3, id: 'spo2' },
    ],
    [vitalsData]
  );

  const chartData = useMemo(
    () => ({
      labels: vitalsData.map((v) =>
        v.date ? new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'
      ),
      datasets: selectedVital === 'all' ? allDatasets : allDatasets.filter((d) => d.id === selectedVital),
    }),
    [vitalsData, allDatasets, selectedVital]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // prevent jumpy animation on mobile
      scales: { x: { ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } },
      plugins: { legend: { position: 'bottom' } },
    }),
    []
  );

  const vitalStats = vitalsData.length
    ? {
        avgHR: Math.round(vitalsData.reduce((s, v) => s + (v.hr || 0), 0) / vitalsData.length),
        avgSpO2: Math.round(vitalsData.reduce((s, v) => s + (v.spo2 || 0), 0) / vitalsData.length),
        totalVisits: vitalsData.length,
      }
    : null;

  return (
    <div className="min-h-screen w-full bg-blue-50 py-5 sm:px-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border-t-4 border-blue-500 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🩺</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Patient Vitals Monitor</h1>
            <p className="text-sm text-gray-500">Real-time health tracking</p>
          </div>
        </div>

        {/* CNIC Input */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Patient CNIC</label>
          <input
            type="text"
            value={cnic}
            onChange={handleCnicChange}
            placeholder="12345-1234567-1"
            className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none ${
              error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          <div className="mt-3 h-10 flex items-center">
            {error && <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded text-red-700 text-sm">{error}</div>}
          </div>
        </div>

        {loading && <div className="text-center py-10 text-gray-500">Loading...</div>}

        {/* Patient Info & Chart */}
        {patient && vitalsData.length > 0 && (
          <>
            <div className="bg-blue-500 text-white shadow-lg rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <p className="text-xs opacity-80">Name</p>
                <p className="font-bold">{patient.name}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <p className="text-xs opacity-80">Total Visits</p>
                <p className="font-bold">{vitalStats.totalVisits}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <p className="text-xs opacity-80">Avg HR</p>
                <p className="font-bold">{vitalStats.avgHR} bpm</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <p className="text-xs opacity-80">Avg SpO2</p>
                <p className="font-bold">{vitalStats.avgSpO2}%</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white shadow-lg rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <h2 className="text-xl font-bold text-gray-800">Vitals Trend</h2>
                <select
                  value={selectedVital}
                  onChange={(e) => setSelectedVital(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm w-full sm:w-48 max-w-full truncate"
                >
                  <option value="all">All Vitals</option>
                  <option value="hr">Heart Rate</option>
                  <option value="systolic">Systolic BP</option>
                  <option value="diastolic">Diastolic BP</option>
                  <option value="temp">Temperature</option>
                  <option value="spo2">Oxygen Level</option>
                </select>
              </div>
              <div className="w-full relative" style={{ height: FIXED_CHART_HEIGHT, minHeight: FIXED_CHART_HEIGHT, maxHeight: FIXED_CHART_HEIGHT }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Visit History */}
            <div className="bg-white shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Visit History</h2>
              {/* Mobile */}
              <div className="block lg:hidden space-y-3">
                {vitalsData.map((v, idx) => (
                  <div key={idx} className="border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between mb-2 text-sm">
                      <span>{new Date(v.date).toLocaleDateString()}</span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Visit #{idx + 1}</span>
                    </div>
                    <p>BP: {v.bp}</p>
                    <p>HR: {v.hr}</p>
                    <p>Temp: {v.temp}°C</p>
                    <p>SpO2: {v.spo2}%</p>
                  </div>
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      {['Date', 'BP', 'HR', 'Temp', 'SpO2', 'Diagnosis', 'Treatment'].map((c) => (
                        <th key={c} className="p-3 text-left text-sm font-bold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vitalsData.map((v, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3">{new Date(v.date).toLocaleDateString()}</td>
                        <td className="p-3">{v.bp}</td>
                        <td className="p-3">{v.hr}</td>
                        <td className="p-3">{v.temp}</td>
                        <td className="p-3">{v.spo2}</td>
                        <td className="p-3">{v.diagnosis || '—'}</td>
                        <td className="p-3">{v.treatment || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!loading && !patient && !error && cnic === '' && (
          <div className="bg-white shadow-lg rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Enter Patient CNIC</h3>
            <p className="text-gray-600">Start by entering a patient’s CNIC.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientVitalsGraph;
