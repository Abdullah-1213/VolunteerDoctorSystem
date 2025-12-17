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
  Filler
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Thermometer, 
  Heart, 
  Droplet, 
  Search, 
  User, 
  Calendar, 
  FileText, 
  AlertCircle,
  Stethoscope
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PatientVitalsGraph = () => {
  const navigate = useNavigate();

  const [cnic, setCnic] = useState('');
  const [patient, setPatient] = useState(null);
  const [vitalsData, setVitalsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVital, setSelectedVital] = useState('all');

  // Format CNIC: 12345-1234567-1
  const formatCnicInput = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  };

  const handleCnicChange = (event) => {
    const formatted = formatCnicInput(event.target.value);
    setCnic(formatted);
    // Clear data on new search to avoid confusion
    if (patient) {
        setPatient(null);
        setVitalsData([]);
    }
    setError(null);
  };

  const fetchPatientAndVitals = async () => {
    const isValidCnic = (value) => /^\d{5}-\d{7}-\d{1}$/.test(value);
    
    if (!cnic) return;
    if (!isValidCnic(cnic)) {
      setError('Please enter a complete CNIC (e.g. 12345-1234567-1)');
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('access_token');
    
    // Auth Check
    if (!token) { 
        // In a real app, maybe redirect or show modal
        console.warn("No token found"); 
    }

    try {
      // 1. Check CNIC
      const cnicResponse = await fetch('http://127.0.0.1:8000/api/check-cnic/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ cnic }),
      });

      if (!cnicResponse.ok) throw new Error('Unable to verify CNIC.');

      const cnicData = await cnicResponse.json();
      if (!cnicData.exists) {
        throw new Error('No patient record found for this CNIC.');
      }

      setPatient(cnicData.patient);

      // 2. Fetch Records
      const visitsResponse = await fetch('http://127.0.0.1:8000/api/patient-records/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const visitsData = await visitsResponse.json();
      // Filter strictly by ID
      const filteredVisits = visitsData
        .filter((v) => v.patient_id === cnicData.patient.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ensure chronological order

      setVitalsData(filteredVisits);
    } catch (err) {
      setError(err.message);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const parseBP = (bp) => {
    if (!bp) return { systolic: null, diastolic: null };
    const [sys, dia] = bp.split('/').map(Number);
    return { systolic: sys || null, diastolic: dia || null };
  };

  // --- Chart Configuration ---
  const chartData = useMemo(() => {
    const labels = vitalsData.map((v) => 
      v.date ? new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'
    );

    const datasets = [
      {
        label: 'Systolic BP',
        data: vitalsData.map((v) => parseBP(v.bp).systolic),
        borderColor: '#ef4444', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        id: 'systolic',
        hidden: selectedVital !== 'all' && selectedVital !== 'systolic',
      },
      {
        label: 'Diastolic BP',
        data: vitalsData.map((v) => parseBP(v.bp).diastolic),
        borderColor: '#f87171', // Light Red
        borderDash: [5, 5],
        tension: 0.4,
        id: 'diastolic',
        hidden: selectedVital !== 'all' && selectedVital !== 'diastolic',
      },
      {
        label: 'Heart Rate',
        data: vitalsData.map((v) => v.hr ?? null),
        borderColor: '#10b981', // Emerald
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        id: 'hr',
        hidden: selectedVital !== 'all' && selectedVital !== 'hr',
      },
      {
        label: 'SpO2 (%)',
        data: vitalsData.map((v) => v.spo2 ?? null),
        borderColor: '#3b82f6', // Blue
        tension: 0.4,
        id: 'spo2',
        hidden: selectedVital !== 'all' && selectedVital !== 'spo2',
      },
      {
        label: 'Temp (°C)',
        data: vitalsData.map((v) => v.temp ?? null),
        borderColor: '#f59e0b', // Amber
        tension: 0.4,
        id: 'temp',
        hidden: selectedVital !== 'all' && selectedVital !== 'temp',
      },
    ];

    return { labels, datasets };
  }, [vitalsData, selectedVital]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { border: { display: false }, grid: { color: '#f1f5f9' } },
    },
  };

  // --- Stats Calculation ---
  const latestVital = vitalsData.length > 0 ? vitalsData[vitalsData.length - 1] : null;
  const vitalStats = latestVital ? {
    hr: latestVital.hr || '-',
    bp: latestVital.bp || '-',
    spo2: latestVital.spo2 || '-',
    temp: latestVital.temp || '-',
  } : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* 2. Search & Identity Section */}
        <section className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Search Card */}
            <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Search Patient</label>
                <div className="relative">
                    <input
                        type="text"
                        value={cnic}
                        onChange={handleCnicChange}
                        placeholder="00000-0000000-0"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none font-mono text-slate-700"
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
                
                <button 
                    onClick={fetchPatientAndVitals}
                    disabled={loading || cnic.length < 13}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>Fetch Records</>
                    )}
                </button>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-100"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Patient Identity Card (Conditional) */}
            <div className="w-full md:w-2/3">
                {patient ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl shadow-lg text-white p-6 relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm text-2xl font-bold">
                                {patient.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{patient.name}</h2>
                                <p className="text-teal-100 flex items-center gap-2 text-sm opacity-90">
                                    <User className="w-4 h-4" /> Age: {patient.age || 'N/A'} • {patient.gender || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                           <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                                <p className="text-xs text-teal-100 uppercase tracking-wider mb-1">Last Visit</p>
                                <p className="font-semibold text-sm">
                                    {vitalsData.length > 0 ? new Date(vitalsData[vitalsData.length-1].date).toLocaleDateString() : 'N/A'}
                                </p>
                           </div>
                           <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                                <p className="text-xs text-teal-100 uppercase tracking-wider mb-1">Total Visits</p>
                                <p className="font-semibold text-sm">{vitalsData.length}</p>
                           </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-8 min-h-[200px]">
                        <Activity className="w-12 h-12 mb-3 opacity-20" />
                        <p>Enter a CNIC to view patient history</p>
                    </div>
                )}
            </div>
        </section>

        {patient && vitalsData.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
            >
                {/* 3. Latest Vitals Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                        icon={Activity} 
                        label="Blood Pressure" 
                        value={vitalStats?.bp} 
                        unit="mmHg"
                        color="text-rose-600"
                        bg="bg-rose-50"
                    />
                    <StatCard 
                        icon={Heart} 
                        label="Heart Rate" 
                        value={vitalStats?.hr} 
                        unit="bpm"
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                    <StatCard 
                        icon={Thermometer} 
                        label="Temperature" 
                        value={vitalStats?.temp} 
                        unit="°C"
                        color="text-amber-600"
                        bg="bg-amber-50"
                    />
                    <StatCard 
                        icon={Droplet} 
                        label="SpO2 Level" 
                        value={vitalStats?.spo2} 
                        unit="%"
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                </section>

                {/* 4. Chart Section */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Health Trends</h3>
                            <p className="text-sm text-slate-500">Visualizing vitals over time</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {['all', 'systolic', 'hr', 'temp'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setSelectedVital(filter)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                                        selectedVital === filter 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {filter === 'systolic' ? 'BP' : filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </section>

                {/* 5. History Table */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <h3 className="text-lg font-bold text-slate-800">Visit History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">BP</th>
                                    <th className="px-6 py-4">Heart Rate</th>
                                    <th className="px-6 py-4">Diagnosis</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {vitalsData.map((visit, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {new Date(visit.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-medium text-xs border border-rose-100">
                                                {visit.bp}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{visit.hr} bpm</td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{visit.diagnosis || 'Routine Checkup'}</td>
                                        <td className="px-6 py-4">
                                            <button className="text-teal-600 hover:text-teal-800 font-medium hover:underline">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </motion.div>
        )}
      </main>
    </div>
  );
};

// Subcomponent for Cleaner Code
const StatCard = ({ icon: Icon, label, value, unit, color, bg }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-full ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm text-slate-500 font-medium">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800">{value}</span>
                <span className="text-xs text-slate-400 font-medium">{unit}</span>
            </div>
        </div>
    </div>
);

export default PatientVitalsGraph;