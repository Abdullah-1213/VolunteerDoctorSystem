import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { 
  Baby, 
  Brain, 
  Scan, 
  Activity, 
  Lock,
  ArrowRight,
  Stethoscope,
  ChevronRight
} from "lucide-react";

const DecisionSupport = () => {
  const navigate = useNavigate();

  const options = [
    {
      name: "Pregnancy Risk",
      description: "Maternal health prediction & risk analysis based on vitals.",
      path: "/high-risk-pregnancy",
      isActive: true,
      icon: Baby,
      color: "bg-rose-500",
      lightColor: "bg-rose-50 text-rose-600"
    },
    {
      name: "Stroke Prediction",
      description: "Early detection of stroke probability using patient history.",
      path: "/stroke-risk",
      isActive: false,
      icon: Activity,
      color: "bg-indigo-500",
      lightColor: "bg-indigo-50 text-indigo-600"
    },
    {
      name: "Brain Tumor",
      description: "MRI analysis for tumor classification and localization.",
      path: "/brain-tumor",
      isActive: false,
      icon: Brain,
      color: "bg-violet-500",
      lightColor: "bg-violet-50 text-violet-600"
    },
    {
      name: "Breast Cancer",
      description: "Mammogram screening assistant and anomaly detection.",
      path: "/breast-tumor",
      isActive: false,
      icon: Scan,
      color: "bg-pink-500",
      lightColor: "bg-pink-50 text-pink-600"
    },
    {
      name: "Covid-19 Lab",
      description: "Symptom and X-ray based viral analysis.",
      path: "/covid-prediction",
      isActive: false,
      icon: Scan,
      color: "bg-teal-500",
      lightColor: "bg-teal-50 text-teal-600"
    },
  ];

  const handleClick = (item) => {
    if (item.isActive) {
      navigate(item.path);
    } else {
      toast("This module is currently under development.", {
        icon: '🚧',
        style: {
          borderRadius: '8px',
          background: '#334155',
          color: '#fff',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 font-sans">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Decision Support
                </h1>
                <p className="text-slate-500 font-medium">
                AI-powered diagnostic tools & risk assessment
                </p>
            </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleClick(item)}
            className={`
              relative group rounded-2xl p-6 border transition-all duration-300 cursor-pointer overflow-hidden
              ${item.isActive 
                ? "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200" 
                : "bg-slate-100 border-slate-200 opacity-80"
              }
            `}
          >
            {/* "Coming Soon" Overlay for inactive items */}
            {!item.isActive && (
              <div className="absolute top-4 right-4 bg-slate-200 p-1.5 rounded-full z-10">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
            )}

            {/* Icon Box */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${item.isActive ? item.lightColor : "bg-slate-200 text-slate-400"}`}>
              <item.icon className="w-7 h-7" />
            </div>

            {/* Text Content */}
            <div className="mb-4">
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${item.isActive ? "text-slate-800" : "text-slate-500"}`}>
                {item.name}
                {item.isActive && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed min-h-[40px]">
                {item.description}
                </p>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {item.isActive ? (
                <>
                    <span className="text-sm font-bold text-blue-600 group-hover:underline">Access Tool</span>
                    <div className="bg-blue-50 p-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-200/50 px-2 py-1 rounded">
                  Coming Soon
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DecisionSupport;