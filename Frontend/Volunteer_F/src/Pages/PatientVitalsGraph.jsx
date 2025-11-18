import React, { useEffect, useState, useMemo, useRef } from 'react';
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

// ---------- STABLE FIX CONSTANT ----------
const FIXED_CHART_HEIGHT = 350; // 350px as you requested

const PatientVitalsGraph = () => {
  const navigate = useNavigate();

  const [cnic, setCnic] = useState('');
  const [patient, setPatient] = useState(null);
  const [vitalsData, setVitalsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVital, setSelectedVital] = useState('all');

  const chartContainerRef = useRef(null);

  // Format CNIC while typing
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

  useEffect(() => {
    const isValidCnic = (value) => /^\d{5}-\d{7}-\d{1}$/.test(value);
    if (!cnic) return;
    if (!isValidCnic(cnic)) {
      setError('❌ CNIC format incorrect. Use this format: 12345-1234567-1');
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
        const cnicResponse = await fetch('https://9478c91b2994.ngrok-free.app/api/check-cnic/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cnic }),
        });

        if (!cnicResponse.ok) throw new Error('🔒 CNIC check failed. Session may have expired.');

        const cnicData = await cnicResponse.json();
        if (!cnicData.exists) {
          setError('⚠️ No patient found with this CNIC.');
          setLoading(false);
          return;
        }

        setPatient(cnicData.patient);

        // Fetch patient visits
        const visitsResponse = await fetch('https://9478c91b2994.ngrok-free.app/api/patient-records/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!visitsResponse.ok) throw new Error('🚨 Failed to fetch visit records');
        const visitsData = await visitsResponse.json();

        // Filter visits for this patient
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

  // ---------- MEMOIZED DATA & OPTIONS (reduce re-renders) ----------
  const allDatasets = useMemo(() => [
    { label: 'Heart Rate (bpm)', data: vitalsData.map((v) => (v.hr !== undefined ? v.hr : null)), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', tension: 0.3, id: 'hr' },
    { label: 'Systolic BP', data: vitalsData.map((v) => parseBP(v.bp).systolic), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.3, id: 'systolic' },
    { label: 'Diastolic BP', data: vitalsData.map((v) => parseBP(v.bp).diastolic), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', tension: 0.3, id: 'diastolic' },
    { label: 'Temperature (°C)', data: vitalsData.map((v) => (v.temp !== undefined ? v.temp : null)), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.3, id: 'temp' },
    { label: 'Oxygen (%)', data: vitalsData.map((v) => (v.spo2 !== undefined ? v.spo2 : null)), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', tension: 0.3, id: 'spo2' },
  ], [vitalsData]);

  const chartData = useMemo(() => ({
    labels: vitalsData.map((v) =>
      v.date ? new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'
    ),
    datasets: selectedVital === 'all' ? allDatasets : allDatasets.filter((d) => d.id === selectedVital),
  }), [vitalsData, allDatasets, selectedVital]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 250,
    animation: { duration: 400, easing: 'easeOutQuart' },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { size: 10 },
          maxTicksLimit: 10,
        }
      },
      y: { ticks: { font: { size: 10 } } },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }), []);

  const vitalStats = vitalsData.length > 0
    ? {
        avgHR: Math.round(vitalsData.reduce((sum, v) => sum + (v.hr || 0), 0) / vitalsData.length),
        avgTemp: (vitalsData.reduce((sum, v) => sum + (v.temp || 0), 0) / vitalsData.length).toFixed(1),
        avgSpO2: Math.round(vitalsData.reduce((sum, v) => sum + (v.spo2 || 0), 0) / vitalsData.length),
        totalVisits: vitalsData.length,
      }
    : null;

  // Skeletons: ensure they match fixed chart height
  const SkeletonCard = () => (
    <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg p-3 h-12"></div>
        ))}
      </div>
    </div>
  );

  const SkeletonChart = () => (
    <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      </div>
      {/* MATCH fixed chart height to prevent jump */}
      <div className="w-full rounded" style={{ height: FIXED_CHART_HEIGHT, backgroundColor: '#e5e7eb' }}></div>
    </div>
  );

  const SkeletonHistory = () => (
    <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((__, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden max-w-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="bg-white shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 border-t-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl">🩺</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Patient Vitals Monitor</h1>
              <p className="text-xs sm:text-sm text-gray-500">Real-time health tracking</p>
            </div>
          </div>
        </div>

        {/* CNIC Input */}
        <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Patient CNIC</label>
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={cnic}
              onChange={handleCnicChange}
              placeholder="12345-1234567-1"
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none transition-all text-sm sm:text-base 
                ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-yellow-200'}`}
            />
          </div>

          {/* Reserve fixed space for error -> prevents layout shift when error appears */}
          <div style={{ minHeight: 56 }}>
            {error && (
              <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs sm:text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Loading with Skeletons for Stable Layout */}
        {loading && (
          <div className="space-y-4 sm:space-y-6">
            <SkeletonCard />
            <SkeletonChart />
            <SkeletonHistory />
          </div>
        )}

        {/* Patient Info */}
        {patient && vitalsData.length > 0 && (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3">Patient Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <p className="text-xs opacity-90">Name</p>
                  <p className="font-bold text-sm sm:text-base truncate">{patient.name || 'N/A'}</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <p className="text-xs opacity-90">Total Visits</p>
                  <p className="font-bold text-sm sm:text-base">{vitalStats?.totalVisits ?? '-'}</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <p className="text-xs opacity-90">Avg HR</p>
                  <p className="font-bold text-sm sm:text-base">{vitalStats?.avgHR ?? '-'} bpm</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <p className="text-xs opacity-90">Avg SpO2</p>
                  <p className="font-bold text-sm sm:text-base">{vitalStats?.avgSpO2 ?? '-'}%</p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 w-full">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Vitals Trend</h2>
                <select
                  value={selectedVital}
                  onChange={(e) => setSelectedVital(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-yellow-500 w-full sm:w-auto"
                >
                  <option value="all">All Vitals</option>
                  <option value="hr">Heart Rate</option>
                  <option value="systolic">Systolic BP</option>
                  <option value="diastolic">Diastolic BP</option>
                  <option value="temp">Temperature</option>
                  <option value="spo2">Oxygen Level</option>
                </select>
              </div>

              {/* FIX: give chart a fixed height to prevent layout jump */}
              <div
                className="w-full relative overflow-x-hidden overflow-y-visible"
                style={{
                  height: FIXED_CHART_HEIGHT,
                  minHeight: FIXED_CHART_HEIGHT,
                  maxHeight: FIXED_CHART_HEIGHT,
                }}
                ref={chartContainerRef}
              >
                <Line
                  data={chartData}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Visit History (limit vertical growth) */}
            <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Visit History</h2>

              {/* Mobile cards */}
              <div className="block lg:hidden space-y-3 max-h-[50vh] overflow-y-auto">
                {vitalsData.map((v, idx) => (
                  <div key={v.id || idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold text-gray-500">{v.date ? new Date(v.date).toLocaleDateString() : 'N/A'}</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Visit #{idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500 text-xs">BP:</span> <span className="ml-1 font-semibold">{v.bp || 'N/A'}</span></div>
                      <div><span className="text-gray-500 text-xs">HR:</span> <span className="ml-1 font-semibold">{v.hr || 'N/A'}</span></div>
                      <div><span className="text-gray-500 text-xs">Temp:</span> <span className="ml-1 font-semibold">{v.temp || 'N/A'}°C</span></div>
                      <div><span className="text-gray-500 text-xs">SpO2:</span> <span className="ml-1 font-semibold">{v.spo2 || 'N/A'}%</span></div>
                    </div>
                    {(v.diagnosis || v.treatment) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 text-xs">
                        {v.diagnosis && <p className="mb-1"><span className="font-semibold text-gray-600">Diagnosis:</span> <span className="ml-1 text-gray-700">{v.diagnosis}</span></p>}
                        {v.treatment && <p><span className="font-semibold text-gray-600">Treatment:</span> <span className="ml-1 text-gray-700">{v.treatment}</span></p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse min-w-max">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      {['Date', 'BP', 'HR', 'Temp', 'SpO2', 'Diagnosis', 'Treatment'].map((col) => (
                        <th key={col} className="p-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vitalsData.map((v, idx) => (
                      <tr key={v.id || idx} className={`border-b hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{v.date ? new Date(v.date).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-3 text-sm font-semibold whitespace-nowrap">{v.bp || 'N/A'}</td>
                        <td className="p-3 text-sm font-semibold whitespace-nowrap">{v.hr || 'N/A'}</td>
                        <td className="p-3 text-sm font-semibold whitespace-nowrap">{v.temp || 'N/A'}</td>
                        <td className="p-3 text-sm font-semibold whitespace-nowrap">{v.spo2 || 'N/A'}</td>
                        <td className="p-3 text-sm text-gray-600 max-w-xs truncate">{v.diagnosis || '—'}</td>
                        <td className="p-3 text-sm text-gray-600 max-w-xs truncate">{v.treatment || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Placeholder */}
        {!loading && !patient && !error && cnic === '' && (
          <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Enter Patient CNIC</h3>
            <p className="text-gray-600 text-sm">Start by entering a patient's CNIC to view their vitals history</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientVitalsGraph;
