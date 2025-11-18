import { useState } from "react";

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

  const rules = {
    Age: { min: 1, max: 100, message: "Age must be between 1 & 100" },
    SystolicBP: { min: 90, max: 180, message: "Systolic BP must be 90–180" },
    DiastolicBP: { min: 60, max: 120, message: "Diastolic BP must be 60–120" },
    BS: { min: 1, max: 50, message: "Blood Sugar must be 1–50" },
    BodyTemp: { min: 95, max: 105, message: "Body Temp must be 95°F–105°F" },
    HeartRate: { min: 50, max: 150, message: "Heart Rate must be 50–150" },
  };

  const validateField = (name, value) => {
    const rule = rules[name];
    if (!rule) return null;

    if (!value) return "This field is required";
    const num = parseFloat(value);

    if (num < rule.min || num > rule.max) return rule.message;

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    setErrors({
      ...errors,
      [name]: validateField(name, value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPredictionResult(null);

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await fetch("https://9478c91b2994.ngrok-free.app/api/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setPredictionResult(data.prediction);
    } catch (err) {
      setPredictionResult("Something went wrong!");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center min-h-screen p-6 gap-6 bg-gray-100">

      {/* LEFT: FORM */}
      <div className="bg-white p-8 rounded-xl shadow-xl w-full lg:w-1/2">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          🤰 High-Risk Pregnancy Prediction
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.keys(formData).map((field) => (
            <div key={field} className="flex flex-col gap-1">
          
              <input
                type="number"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                min={rules[field].min}
                max={rules[field].max}
                className={`w-full p-3 border rounded-lg focus:outline-none shadow-sm transition 
                ${errors[field] ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"}`}
                placeholder={`Enter ${field}`}
              />

              {errors[field] && (
                <p className="text-sm text-red-600">{errors[field]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
          >
            Predict
          </button>
        </form>
      </div>

      {/* RIGHT: ALWAYS VISIBLE PREDICTION PANEL */}
      <div className="bg-white p-8 rounded-xl shadow-xl w-full lg:w-1/3 h-fit sticky top-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Prediction Result</h3>

        {!predictionResult ? (
          <p className="text-gray-500">Fill form and submit to see result...</p>
        ) : (
          <div className="p-5 bg-green-100 text-green-900 border border-green-300 rounded-lg shadow">
            <p className="text-xl font-bold">{predictionResult}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default HighRiskPregnancyPrediction;
