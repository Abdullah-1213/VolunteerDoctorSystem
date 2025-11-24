// src/pages/VerifyOTP.jsx
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const user_id = searchParams.get("user_id");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/otp/verify/", { user_id, otp });
      setMessage(res.data.message);
    }catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      <p>User ID: {user_id}</p>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={handleVerify}>Verify</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VerifyOTP;
