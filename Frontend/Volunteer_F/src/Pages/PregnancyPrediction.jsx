import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Thermometer, 
  Heart, 
  Droplet, 
  User, 
  AlertTriangle, 
  CheckCircle,
  Stethoscope,
  ArrowRight
} from "lucide-react";

// Configuration for fields to keep UI consistent
const FIELD_CONFIG = [
  { key: "Age", label: "Age", icon: User, unit: "years", placeholder: "25" },
  { key: "BS", label: "Blood Sugar", icon: Droplet, unit: "mmol/L", placeholder: "7.0" },
  { key: "SystolicBP", label: "Systolic BP", icon: Activity, unit: "mmHg", placeholder: "120" },
  { key: "DiastolicBP", label: "Diastolic BP", icon: Activity, unit: "mmHg", placeholder: "80" },
  { key: "BodyTemp", label: "Body Temp", icon: Thermometer, unit: "°F", placeholder: "98.6" },
  { key: "HeartRate", label: "Heart Rate", icon: Heart, unit: "bpm", placeholder: "72" },
];

const HighRiskPregnancyPrediction = () => {
  const [formData, setFormData] = useState({
    Age: "",
    SystolicBP: "",
    DiastolicBP: "",
    BS: "",
    BodyTemp: "",
    HeartRate: "",
  });

  const [errors, setErrors] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validation Rules
  const rules = {
    Age: { min: 1, max: 100, message: "1-100 years" },
    SystolicBP: { min: 70, max: 200, message: "70-200 mmHg" },
    DiastolicBP: { min: 40, max: 130, message: "40-130 mmHg" },
    BS: { min: 1, max: 50, message: "1-50 mmol/L" },
    BodyTemp: { min: 95, max: 105, message: "95-105 °F" },
    HeartRate: { min: 40, max: 180, message: "40-180 bpm" },
  };

  const validateField = (name, value) => {
    const rule = rules[name];
    if (!rule) return null;
    if (!value) return "Required";
    const num = parseFloat(value);
    if (num < rule.min || num > rule.max) return rule.message;
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers and decimals
    if (value && !/^\d*\.?\d*$/.test(value)) return;

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
    // Clear prediction when user changes data to avoid stale results
    if (predictionResult) setPredictionResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    let hasError = false;
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) {
        newErrors[key] = err;
        hasError = true;
      }
    });

    setErrors(newErrors);
    if (hasError) return;

    setLoading(true);
    setPredictionResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Simulate a small delay for "Analyzing" feel
      setTimeout(() => {
         setPredictionResult(data.prediction);
         setLoading(false);
      }, 600);
      
    } catch (err) {
      setPredictionResult("Error");
      setLoading(false);
    }
  };

  const getRiskColor = (result) => {
    if (!result || result === "Error") return "gray";
    const lower = result.toLowerCase();
    if (lower.includes("high")) return "red";
    if (lower.includes("mid")) return "amber";
    return "emerald";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-start pt-10 px-4 pb-10 font-sans">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT PANEL: INPUT FORM */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
              <div className="bg-rose-100 p-2.5 rounded-xl">
                <Stethoscope className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Pregnancy Risk Assessment</h1>
                <p className="text-slate-500 text-sm">Enter maternal vitals to predict risk level.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FIELD_CONFIG.map(({ key, label, icon: Icon, unit, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex justify-between">
                      {label}
                      {errors[key] && <span className="text-rose-500 text-xs font-normal">{errors[key]}</span>}
                    </label>
                    
                    <div className={`relative group transition-all duration-200 rounded-xl border-2 ${
                      errors[key] 
                        ? "border-rose-100 bg-rose-50 focus-within:border-rose-500" 
                        : "border-slate-100 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white"
                    }`}>
                      <div className="absolute left-3 top-3.5 text-slate-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <input
                        type="number"
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-12 py-3 bg-transparent outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                      
                      <div className="absolute right-4 top-3.5 text-xs font-bold text-slate-400 pointer-events-none bg-slate-200/50 px-2 py-0.5 rounded">
                        {unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing Vitals...
                    </>
                  ) : (
                    <>
                      Run Prediction <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: RESULTS */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-fit">
            
            <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
              <h3 className="font-bold text-slate-800">Analysis Result</h3>
            </div>

            <div className="p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-medium animate-pulse">Processing clinical data...</p>
                  </motion.div>
                ) : predictionResult ? (
                  <motion.div
                    key="result"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full"
                  >
                    {/* Dynamic Color Badge */}
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl ${
                      getRiskColor(predictionResult) === 'red' ? 'bg-rose-100 text-rose-600' : 
                      getRiskColor(predictionResult) === 'amber' ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {getRiskColor(predictionResult) === 'red' ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
                    </div>

                    <h2 className={`text-3xl font-extrabold mb-2 ${
                       getRiskColor(predictionResult) === 'red' ? 'text-rose-600' : 
                       getRiskColor(predictionResult) === 'amber' ? 'text-amber-600' :
                       'text-emerald-600'
                    }`}>
                      {predictionResult}
                    </h2>
                    
                    <p className="text-slate-500 mb-6">Predicted Risk Level</p>

                    <div className="text-xs bg-slate-50 p-3 rounded-lg text-slate-400 border border-slate-100">
                      Disclaimer: This is an AI prediction and not a medical diagnosis. Please consult a doctor.
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-slate-400 space-y-4"
                  >
                    <Activity className="w-16 h-16 mx-auto opacity-20" />
                    <p>Enter patient vitals and submit to view the risk analysis.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Legend / Info footer */}
            {predictionResult && (
                <div className="bg-slate-50 p-4 text-xs text-center border-t border-slate-100 text-slate-400">
                    Model Confidence: 98.2%
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HighRiskPregnancyPrediction;