import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

const PatientRegistrationForm = ({ onRegister, prefillCnic = "" }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange", // Show errors only when user leaves the field
  });

  // Prefill CNIC if provided
  useEffect(() => {
    if (prefillCnic) {
      setValue("cnic", prefillCnic);
    }
  }, [prefillCnic, setValue]);

  const handleRegister = (data) => {
    console.log("📦 Register payload:", data);
    onRegister(data);
    reset();
    if (prefillCnic) {
      setValue("cnic", prefillCnic); // Keep CNIC filled after reset
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleRegister)}
      className="bg-white p-6 shadow rounded-lg space-y-3"
    >
      <h2 className="text-xl font-semibold text-gray-700 mb-3">
        Register New Patient
      </h2>

      {/* Full Name */}
      <input
        {...register("name", {
          required: "Full name is required",
          pattern: {
            value: /^[A-Za-z\s]+$/,
            message: "Name can only contain letters and spaces",
          },
        })}
        placeholder="Full Name"
        className="border p-2 rounded w-full"
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

      {/* Age */}
      <input
        {...register("age", {
          required: "Age is required",
          min: { value: 0, message: "Age cannot be negative" },
          max: { value: 120, message: "Age seems too high" },
        })}
        placeholder="Age"
        type="number"
        className="border p-2 rounded w-full"
      />
      {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}

      {/* Gender */}
      <select
        {...register("gender", { required: "Gender is required" })}
        className="border p-2 rounded w-full"
      >
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
      </select>
      {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}

      {/* CNIC */}
      <input
        {...register("cnic", {
          required: "CNIC is required",
          pattern: {
            value: /^\d{5}-\d{7}-\d{1}$/,
            message: "CNIC must be in format 12345-1234567-1",
          },
        })}
        placeholder="CNIC (e.g., 12345-1234567-1)"
        className="border p-2 rounded w-full"
      />
      {errors.cnic && <p className="text-red-500 text-sm">{errors.cnic.message}</p>}

      {/* Contact Number */}
      <input
        {...register("contact", {
          required: "Contact number is required",
          pattern: {
            value: /^03\d{9}$/,
            message: "Enter a valid Pakistan contact number (03XXXXXXXXX)",
          },
        })}
        placeholder="Contact Number (e.g., 03001234567)"
        className="border p-2 rounded w-full"
      />
      {errors.contact && <p className="text-red-500 text-sm">{errors.contact.message}</p>}

      {/* Address */}
      <input
        {...register("address", { required: "Address is required" })}
        placeholder="Address"
        className="border p-2 rounded w-full"
      />
      {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}

      <button
        className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600"
        type="submit"
      >
        Register
      </button>
    </form>
  );
};

PatientRegistrationForm.propTypes = {
  onRegister: PropTypes.func.isRequired,
  prefillCnic: PropTypes.string, // Optional CNIC to prefill
};

export default PatientRegistrationForm;
