import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    CalendarDays, 
    Clock, 
    Video, 
    User, 
    AlertCircle, 
    CheckCircle2, 
    History,
    FileText
} from 'lucide-react';

const MyAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'history'

    // --- Helpers ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
            case 'approved': 
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': 
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'cancelled': 
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default: 
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return { day: '--', month: '--', time: '--', full: '' };
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };
    };

    // --- Fetch Logic ---
    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get('appointments/patient/');
            // Sort: Newest created or nearest date usually better. 
            // Let's sort by slot start time.
            const sorted = res.data.sort((a, b) => new Date(a.slot.start_time) - new Date(b.slot.start_time));
            setAppointments(sorted);
            setError(null);
        } catch (err) {
            console.error("Error fetching appointments:", err);
            setError("Could not load your appointments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // --- Filtering Logic ---
    const filteredAppointments = appointments.filter(app => {
        const appDate = new Date(app.slot?.start_time);
        const now = new Date();
        const isPast = appDate < now || ['completed', 'cancelled', 'rejected'].includes(app.status);
        
        return activeTab === "upcoming" ? !isPast : isPast;
    });

    // --- Render ---
    return (
        <div className="w-full">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarDays className="text-emerald-600" />
                        My Appointments
                    </h2>
                    <p className="text-sm text-slate-500">Manage your visits and video consultations</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === "upcoming" 
                            ? "bg-white text-emerald-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === "history" 
                            ? "bg-white text-emerald-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-6 border border-red-100">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse flex gap-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-100 rounded w-1/3" />
                                <div className="h-4 bg-slate-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredAppointments.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                        {activeTab === "upcoming" ? <CalendarDays size={32} /> : <History size={32} />}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-600">No {activeTab} appointments</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1 mb-6">
                        {activeTab === "upcoming" 
                            ? "You don't have any scheduled visits at the moment." 
                            : "Your past appointment history will appear here."}
                    </p>
                    {activeTab === "upcoming" && (
                        <button 
                            onClick={() => navigate('/dashboard-pt/search')}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                        >
                            Find a Doctor
                        </button>
                    )}
                </div>
            )}

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 gap-4">
                {!loading && filteredAppointments.map(app => {
                    const doctorName = app.slot?.doctor?.name || 'Unknown Doctor';
                    const dateInfo = formatDate(app.slot?.start_time);
                    const status = app.status?.toLowerCase();
                    const isConfirmed = status === 'confirmed' || status === 'approved';

                    return (
                        <div 
                            key={app.id} 
                            className="group bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:items-center"
                        >
                            {/* Date Ticket (Left Side) */}
                            <div className="flex sm:flex-col items-center justify-center sm:justify-start gap-2 sm:gap-0 bg-slate-50 rounded-lg p-3 sm:w-20 shrink-0 border border-slate-100 text-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{dateInfo.month}</span>
                                <span className="text-xl sm:text-2xl font-bold text-slate-700">{dateInfo.day}</span>
                                <span className="text-xs text-slate-400 sm:hidden"> - {dateInfo.time}</span>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="text-lg font-bold text-slate-800 truncate pr-2">{doctorName}</h4>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(status)} capitalize`}>
                                        {status}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                    <div className="hidden sm:flex items-center gap-1.5">
                                        <Clock size={16} className="text-emerald-500" />
                                        {dateInfo.time}
                                    </div>
                                    <div className="flex items-center gap-1.5 truncate">
                                        <FileText size={16} className="text-slate-400" />
                                        <span className="truncate">{app.reason || 'General Consultation'}</span>
                                    </div>
                                </div>

                                {status === 'pending' && (
                                    <p className="text-xs text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded">
                                        Waiting for doctor's confirmation
                                    </p>
                                )}
                            </div>

                            {/* Actions (Right Side) */}
                            <div className="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0">
                                {isConfirmed ? (
                                    <button
                                        onClick={() => navigate(`/video-call/${app.id}`)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        <Video size={18} />
                                        Join Call
                                    </button>
                                ) : (
                                    <div className="hidden sm:block w-32" /> // Spacer for alignment
                                )}
                                
                                <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyAppointments;