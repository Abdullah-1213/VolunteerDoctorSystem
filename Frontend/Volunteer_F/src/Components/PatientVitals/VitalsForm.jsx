import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  FileText,
  Stethoscope,
  ClipboardList,
  TestTube,
  AlertCircle,
  Pill,
  X,
} from "lucide-react";
import { useState } from "react";
import DrugSearch from "./DrugSearch";
import AIChatModal from "./AIChatModal";

const VitalsForm = ({ onAddVitals, currentPatient }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onBlur",

  });

  const [showDrugPopup, setShowDrugPopup] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleVitals = (data) => {
    const payload = {
      ...data,
      patient_id: currentPatient.id,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") payload[key] = null;
    });

    onAddVitals(payload);
    reset();
  };

  const InputField = ({
    icon: Icon,
    label,
    name,
    type = "text",
    placeholder,
    step,
    rules,
  }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon className="w-4 h-4 text-blue-500" /> {label}
      </label>

      <input
        {...register(name, rules)}
        type={type}
        step={step}
        placeholder={placeholder}
        className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {errors[name] && (
        <p className="text-red-500 text-xs">{errors[name].message}</p>
      )}
    </div>
  );

  const TextAreaField = ({
    icon: Icon,
    label,
    name,
    placeholder,
    rows = 3,
    rules,
  }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon className="w-4 h-4 text-blue-500" /> {label}
      </label>

      <textarea
        {...register(name, rules)}
        placeholder={placeholder}
        rows={rows}
        className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {errors[name] && (
        <p className="text-red-500 text-xs">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(handleVitals)}
      className="bg-white shadow-lg rounded-xl overflow-hidden mt-6 relative"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Patient Visit Record
        </h2>
        <p className="text-blue-100 text-sm">
          Patient:{" "}
          <span className="font-semibold">
            {currentPatient?.name || "Unknown"}
          </span>
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* ---------------- VITAL SIGNS ---------------- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" /> Vital Signs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              icon={Activity}
              label="Blood Pressure"
              name="bp"
              placeholder="120/80"
              rules={{
                required: "Blood pressure is required",
                pattern: {
                  value: /^\d{2,3}\/\d{2,3}$/,
                  message: "Format must be like 120/80",
                },
              }}
            />

            <InputField
              icon={Heart}
              label="Heart Rate"
              name="hr"
              type="number"
              placeholder="72"
              rules={{
                required: "Heart rate is required",
                min: { value: 30, message: "Minimum HR is 30" },
                max: { value: 200, message: "Maximum HR is 200" },
              }}
            />

            <InputField
              icon={Thermometer}
              label="Temperature (°C)"
              name="temp"
              type="number"
              step="0.1"
              placeholder="37.0"
              rules={{
                required: "Temperature is required",
                min: { value: 30, message: "Temperature too low" },
                max: { value: 45, message: "Temperature too high" },
              }}
            />

            <InputField
              icon={Wind}
              label="SpO₂ (%)"
              name="spo2"
              type="number"
              placeholder="98"
              rules={{
                required: "SpO₂ is required",
                min: { value: 50, message: "SpO₂ must be above 50%" },
                max: { value: 100, message: "Invalid SpO₂ value" },
              }}
            />
          </div>
        </div>

        {/* ---------------- CLINICAL ---------------- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-green-500" />
            Clinical Assessment
          </h3>

          <TextAreaField
            icon={FileText}
            label="Chief Complaint"
            name="introduction"
            rows={2}
            rules={{ required: "Chief complaint is required" }}
          />

          <TextAreaField
            icon={ClipboardList}
            label="History of Present Illness"
            name="history"
            rows={3}
            rules={{ required: "History is required" }}
          />

          <TextAreaField
            icon={Stethoscope}
            label="Physical Examination"
            name="examination"
            rules={{ required: "Examination is required" }}
          />
        </div>

        {/* ---------------- DIAGNOSTICS ---------------- */}
        <div className="space-y-4 relative">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-500" /> Diagnostics & Treatment
          </h3>


          <div className="relative">
          <TextAreaField
            icon={TestTube}
            label="Investigations"
            name="investigation"
            rules={{ required: "investigation is required" }}
          />

            {/* AI Assistant Icon Button */}
            <button
              type="button"
              onClick={() => setShowAI(true)}
              className="absolute right-3 bottom-4 h-9 w-9 flex items-center justify-center
                        rounded-full bg-white border border-green-300 shadow-sm
                        hover:bg-green-100 hover:shadow-lg transition-all duration-200
                        active:scale-95"
              title="AI Assistant"
            >
              <span className="text-xl">🤖</span>
            </button>
          </div>

          <div className="relative">
            <TextAreaField
              icon={AlertCircle}
              label="Diagnosis"
              name="diagnosis"
              rows={2}
              rules={{ required: "Diagnosis is required" }}
            />

            {/* AI Assistant Icon Button */}
            <button
              type="button"
              onClick={() => setShowAI(true)}
              className="absolute right-3 bottom-4 h-9 w-9 flex items-center justify-center
                        rounded-full bg-white border border-green-300 shadow-sm
                        hover:bg-green-100 hover:shadow-lg transition-all duration-200
                        active:scale-95"
              title="AI Assistant"
            >
              <span className="text-xl">🤖</span>
            </button>
          </div>


          {/* Treatment */}

        <div className="space-y-1 relative">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Pill className="w-1 h-1 text-purple-500" /> Treatment Plan
          </label>

          <div className="relative">
            <textarea
              {...register("treatment", {
                required: "Treatment is required",
              })}
              rows={3}
              placeholder="Add treatment details..."
              className="border border-gray-300 p-3 rounded-lg w-full pr-24 
                        focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* Better Drug Search Icon */}
            <button
              type="button"
              onClick={() => setShowDrugPopup(true)}
              className="absolute right-16 bottom-3 h-9 w-9 flex items-center justify-center
                        rounded-full bg-white border border-purple-300 shadow-sm
                        hover:bg-purple-100 hover:shadow transition-all"
              title="Search Drugs"
            >
              <span className="text-lg">💊</span>
            </button>

            {/* Better AI Chat Icon */}
            <button
              type="button"
              onClick={() => setShowAI(true)}
              className="absolute right-3 bottom-3 h-9 w-9 flex items-center justify-center
                        rounded-full bg-white border border-green-300 shadow-sm
                        hover:bg-green-100 hover:shadow transition-all"
              title="AI Assistant"
            >
              <span className="text-xl">🤖</span>
            </button>
          </div>

          {errors.treatment && (
            <p className="text-red-500 text-sm mt-1">
              {errors.treatment.message}
            </p>
          )}
        </div>


        </div>

        {/* SAVE BUTTON */}
        <div className="pt-4 border-t">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg w-full font-semibold shadow-md hover:shadow-lg"
            type="submit"
          >
            <ClipboardList className="w-5 h-5 inline-block mr-2" />
            Save Visit Record
          </button>
        </div>
      </div>

      {/* POPUP */}
      {showDrugPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-[9999]">

          <div className="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-2xl p-6 relative animate-[fadeIn_0.2s_ease-out]">

            {/* Header with Clear X */}
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-500" />
                Select Medicine
              </h2>

              <button
                type="button"
                onClick={() => setShowDrugPopup(false)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drug Search Component */}
            <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scroll">
              <DrugSearch />
            </div>
          </div>
        </div>
      )}
      {showAI && <AIChatModal open={showAI} onClose={() => setShowAI(false)} />}

    </form>
  );
};

VitalsForm.propTypes = {
  onAddVitals: PropTypes.func.isRequired,
  currentPatient: PropTypes.object.isRequired,
};

export default VitalsForm;
