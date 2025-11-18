import { useNavigate } from "react-router-dom";
import HighRiskPregnancyPrediction from "./PregnancyPrediction";
import { toast } from "react-hot-toast";

const DecisionSupport = () => {
  const navigate = useNavigate();

  const options = [
    {
      name: "High-Risk Pregnancy Prediction",
      path: "/high-risk-pregnancy",
      isActive: true, // Only this is active
    },
    { name: "Stroke Risk Prediction", path: "/stroke-risk", isActive: false },
    { name: "Brain Tumor Detection", path: "/brain-tumor", isActive: false },
    { name: "Breast Tumor Detection", path: "/breast-tumor", isActive: false },
    { name: "Covid-19 Prediction", path: "/covid-prediction", isActive: false },
  ];

  const handleClick = (item) => {
    if (item.isActive) {
      navigate(item.path);
    } else {
      toast.error("🚧 This feature is under development. Please check back soon!", {
        duration: 2500,
        style: {
          fontSize: "16px",
        },
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🏥 Decision Support System
      </h1>

      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {options.map((item, index) => (
          <button
            key={index}
            onClick={() => handleClick(item)}
            className={`py-4 px-6 text-lg font-medium text-white rounded-xl shadow-md transition-all duration-300
              ${item.isActive 
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg hover:from-indigo-500 hover:to-blue-500 hover:-translate-y-1" 
                : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DecisionSupport;
