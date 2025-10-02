import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff, Upload, Download } from "lucide-react";

const VideoCall = () => {
  const { roomId } = useParams();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const isMountedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isStrictModeUnmount = useRef(false);
  const isMediaInitialized = useRef(false);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mediaError, setMediaError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");

  const role = localStorage.getItem("role") || "patient"; // doctor / patient

  // 🔑 Refresh Token
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("https://2efd97cb6034.ngrok-free.app/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ refresh: localStorage.getItem("refresh_token") }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.access) {
        localStorage.setItem("access_token", data.access);
        return data.access;
      }
      return null;
    } catch (err) {
      console.error("❌ Token refresh failed:", err);
      setMediaError("Token refresh failed. Please log in again.");
      return null;
    }
  }, []);

  // 🔌 WebSocket Connection
  const connectWebSocket = useCallback(
    async (token) => {
      if (isConnectingRef.current || socketRef.current) return;
      if (!isMountedRef.current) return;

      isConnectingRef.current = true;
      socketRef.current = new WebSocket(
        `wss://2efd97cb6034.ngrok-free.app/ws/video/${roomId}/?token=${token}`
      );

      socketRef.current.onopen = () => {
        if (socketRef.current && isMountedRef.current) {
          setConnectionStatus("Connected");
          socketRef.current.send(JSON.stringify({ type: "ready", role }));
        }
        isConnectingRef.current = false;
      };

      socketRef.current.onmessage = async (event) => {
        if (!isMountedRef.current) return;
        const data = JSON.parse(event.data);

        if (data.type === "ready" && role === "doctor") {
          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);
          socketRef.current?.send(JSON.stringify({ type: "offer", offer }));
        } else if (data.type === "offer" && role === "patient") {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          socketRef.current?.send(JSON.stringify({ type: "answer", answer }));
        } else if (data.type === "answer") {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === "ice") {
          await peerRef.current.addIceCandidate(data.candidate);
        }

        else if (data.type === "patient-joined" && role === "doctor") {
          console.log("✅ Patient joined:", data);
          localStorage.setItem("current_patient_id", data.patient_id);
          localStorage.setItem("current_patient_name", data.patient_name);
          console.log("📌 Saved patient in localStorage:", data.patient_id);
        }

      };

      socketRef.current.onclose = () => {
        setConnectionStatus("WebSocket closed");
        socketRef.current = null;
        isConnectingRef.current = false;
      };
    },
    [roomId, role]
  );

  // 🎥 Init Media + Peer
  const initializeResources = useCallback(
    async () => {
      if (isMediaInitialized.current) return;
      let token = localStorage.getItem("access_token") || (await refreshToken());
      if (!token) return;

      peerRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:relay1.expressturn.com:3480",
            username: "000000002074380178",   // 👈 from your dashboard
            credential: "xncHeT7f+wnsmVPfjYwo+8HCjwk=" // 👈 from your dashboard
          }
        ]
      });


      peerRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setConnectionStatus("Connected to peer");
        }
      };

      peerRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "ice", candidate: event.candidate }));
        }
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        isMediaInitialized.current = true;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => peerRef.current.addTrack(track, stream));
      } catch (err) {
        setMediaError("Unable to access camera/microphone.");
      }

      await connectWebSocket(token);
    },
    [connectWebSocket, refreshToken]
  );

  // Lifecycle
// VideoCall.jsx me, useEffect me add karein
useEffect(() => {
  if (!roomId) return;
  
  // ✅ Set patient ID when component mounts
  if (role === "patient") {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      localStorage.setItem("current_patient_id", userId);
      console.log("✅ Patient ID set:", userId);
    }
  }
  
  // ✅ Clear patient ID when doctor enters (optional)
  if (role === "doctor") {
    console.log("👨‍⚕️ Doctor joined room:", roomId);
  }

  isMountedRef.current = true;
  initializeResources();

  return () => {
    isMountedRef.current = false;
    if (socketRef.current) socketRef.current.close();
    if (peerRef.current) peerRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    isMediaInitialized.current = false;
  };
}, [roomId, initializeResources, role]); // ✅ Add 'role' dependency
  // UI Toggles
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setVideoEnabled(track.enabled);
      });
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
      });
    }
  };

    const handleEndCall = () => {
    // Clean up resources before ending
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (peerRef.current) {
      peerRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    // Navigate back
    window.location.href = '/dashboard-dr';
  };
const handleUploadPrescription = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      alert("❌ Microphone access denied.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.start();

    recognition.onstart = () => {
      alert("🎤 Listening... Please speak your prescription.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("📝 Prescription (speech-to-text):", transcript);

      // ✅ Show modal with editable text
      setPrescriptionText(transcript);
      setShowPrescriptionModal(true);
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech recognition error:", event.error);
      alert("Speech recognition error: " + event.error);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
    };
  };

  // ✅ Function to save prescription after edit
  const savePrescription = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const patientId = localStorage.getItem("current_patient_id");

      if (!patientId) {
        alert("❌ Patient ID not found. Please ensure patient has joined the room.");
        return;
      }

      const response = await fetch("https://2efd97cb6034.ngrok-free.app/api/prescriptions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          room_id: roomId,
          patient: parseInt(patientId),
          text: prescriptionText,
        }),
      });

      const responseData = await response.json();
      console.log("📥 Server response:", responseData);

      if (!response.ok) {
        throw new Error(JSON.stringify(responseData));
      }

      alert(`✅ Prescription saved:\n\n"${prescriptionText}"`);
      setShowPrescriptionModal(false); // Close modal
    } catch (err) {
      console.error("❌ Error saving prescription:", err);
      alert("Failed to save prescription. Check console for details.");
    }
  };


  const handleDownloadReports = () => {
    console.log('Downloading reports...');
    // TODO: Implement actual download logic
    alert('Downloading patient reports...');
  };

  const handleUploadReports = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        console.log('Uploading reports:', files.map(f => f.name));
        // TODO: Implement actual upload logic
        alert(`${files.length} report(s) selected for upload`);
      }
    };
    input.click();
  };

const handleDownloadPrescription = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `https://2efd97cb6034.ngrok-free.app/api/prescriptions/?room_id=${roomId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch prescription");

    const prescriptions = await response.json();
    if (prescriptions.length === 0) {
      alert("❌ No prescription found for this room.");
      return;
    }

    const latest = prescriptions[prescriptions.length - 1]; // last prescription

    // ✅ Complete formatted prescription
    const content = `
      Prescription ID: ${latest.id}
      Date: ${new Date(latest.created_at).toLocaleString()}

      Doctor: ${latest.doctor_name} (ID: ${latest.doctor})
      Patient: ${latest.patient_name} (ID: ${latest.patient})
      Room ID: ${latest.room_id}

      ------------------------------
      Prescription:
      ${latest.text}
      ------------------------------
          `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `prescription_${latest.id}.txt`; // unique filename
    a.click();

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("❌ Failed to download prescription.");
  }
};



 return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-md px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between border-b border-blue-200">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-blue-900 font-semibold text-sm sm:text-lg">Medical Consultation</div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-md border border-blue-200">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === "Connected to peer" ? "bg-green-500" : "bg-yellow-500"}`}></div>
            <span className="text-blue-700 text-sm">{connectionStatus}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-blue-600 text-xs sm:text-sm">Room: {roomId}</span>
          <span className="hidden sm:inline text-blue-400 text-sm">•</span>
          <span className="hidden sm:inline text-blue-700 text-sm capitalize">{role}</span>
        </div>
      </div>

      {/* Mobile Status Indicator */}
      <div className="sm:hidden bg-white px-3 py-2 border-b border-blue-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connectionStatus === "Connected to peer" ? "bg-green-500" : "bg-yellow-500"}`}></div>
          <span className="text-blue-700 text-xs">{connectionStatus}</span>
        </div>
        <span className="text-blue-700 text-xs capitalize">{role}</span>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        {/* Remote Video */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-contain"
        />
        
        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-24 h-32 sm:w-40 sm:h-32 md:w-64 md:h-48 bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-blue-400 hover:border-blue-500 transition-all">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-blue-600/80 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-white text-xs font-medium">
            You
          </div>
          {!videoEnabled && (
            <div className="absolute inset-0 bg-blue-900 flex items-center justify-center">
              <VideoOff className="text-blue-300" size={24} />
            </div>
          )}
        </div>

        {/* Error Message */}
        {mediaError && (
          <div className="absolute top-3 sm:top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm max-w-xs mx-3 text-center">
            {mediaError}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-white shadow-lg px-3 sm:px-6 py-3 sm:py-4 border-t border-blue-200">
        <div className="flex flex-col items-center gap-3">
          {/* Main Controls Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            {/* Audio Toggle with Label */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={toggleAudio}
                className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all shadow-md ${
                  audioEnabled 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                title={audioEnabled ? "Mute" : "Unmute"}
              >
                {audioEnabled ? <Mic size={20} className="sm:w-[22px] sm:h-[22px]" /> : <MicOff size={20} className="sm:w-[22px] sm:h-[22px]" />}
              </button>
              <span className="text-xs text-blue-700 font-medium">
                {audioEnabled ? "Mute" : "Unmute"}
              </span>
            </div>

            {/* Video Toggle with Label */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={toggleVideo}
                className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all shadow-md ${
                  videoEnabled 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                title={videoEnabled ? "Stop Video" : "Start Video"}
              >
                {videoEnabled ? <Video size={20} className="sm:w-[22px] sm:h-[22px]" /> : <VideoOff size={20} className="sm:w-[22px] sm:h-[22px]" />}
              </button>
              <span className="text-xs text-blue-700 font-medium">
                {videoEnabled ? "Stop Video" : "Start Video"}
              </span>
            </div>

            {/* End Call Button with Label */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleEndCall}
                className="flex items-center justify-center px-4 sm:px-6 h-12 sm:h-14 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all shadow-lg text-sm sm:text-base"
              >
                End Call
              </button>
              <span className="text-xs text-transparent font-medium select-none">End</span>
            </div>
          </div>

          {/* Role-Specific Actions Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2 border-t border-blue-100 w-full">
            {role === "doctor" ? (
              <>
                {/* Upload Prescription */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={handleUploadPrescription}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md text-xs sm:text-sm font-medium"
                    title="Upload Prescription"
                  >
                    <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Upload Prescription</span>
                    <span className="sm:hidden">Upload Rx</span>
                  </button>
                </div>

                {/* Download Reports */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={handleDownloadReports}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md text-xs sm:text-sm font-medium"
                    title="Download Reports"
                  >
                    <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Download Reports</span>
                    <span className="sm:hidden">Reports</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Upload Reports */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={handleUploadReports}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md text-xs sm:text-sm font-medium"
                    title="Upload Reports"
                  >
                    <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Upload Reports</span>
                    <span className="sm:hidden">Upload</span>
                  </button>
                </div>

                {/* Download Prescription */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={handleDownloadPrescription}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md text-xs sm:text-sm font-medium"
                    title="Download Prescription"
                  >
                    <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Download Prescription</span>
                    <span className="sm:hidden">Prescription</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold text-blue-700 mb-3">✍️ Edit Prescription</h2>
            <textarea
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              className="w-full h-32 p-2 border rounded-md text-sm"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={savePrescription}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  // return (
  //   <div className="max-w-6xl mx-auto p-6">
  //     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //       {/* Video Area */}
  //       <div className="col-span-2 relative bg-black rounded-xl overflow-hidden shadow-lg">
  //         <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-[500px] object-cover" />
  //         <div className="absolute bottom-4 right-4 w-32 h-24 bg-black/70 rounded-lg overflow-hidden border border-gray-700">
  //           <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
  //         </div>
  //         <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-md text-sm">
  //           Room: {roomId}
  //         </div>
  //         <div className="absolute top-4 right-4 text-white bg-black/50 px-3 py-1 rounded-md text-sm">
  //           Role: {role}
  //         </div>
  //       </div>

  //       {/* Controls & Status */}
  //       <div className="flex flex-col gap-4">
  //         <div className="p-4 bg-gray-100 rounded-lg shadow">
  //           <p className="text-gray-600 text-sm">Status</p>
  //           <p className="font-semibold">{connectionStatus}</p>
  //           {mediaError && <p className="text-red-500 text-sm mt-2">{mediaError}</p>}
  //         </div>

  //         <div className="p-4 bg-gray-100 rounded-lg shadow flex flex-col gap-3">
  //           <button
  //             onClick={toggleVideo}
  //             className={`flex items-center justify-center gap-2 py-2 rounded-lg ${
  //               videoEnabled ? "bg-indigo-600 text-white" : "bg-white border"
  //             }`}
  //           >
  //             {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
  //             {videoEnabled ? "Video On" : "Video Off"}
  //           </button>

  //           <button
  //             onClick={toggleAudio}
  //             className={`flex items-center justify-center gap-2 py-2 rounded-lg ${
  //               audioEnabled ? "bg-indigo-600 text-white" : "bg-white border"
  //             }`}
  //           >
  //             {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
  //             {audioEnabled ? "Unmuted" : "Muted"}
  //           </button>
  //         </div>

  //         <div className="p-4 bg-gray-100 rounded-lg text-xs text-gray-500">
  //           This is a demo UI. In production, use TURN servers and secure token handling.
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default VideoCall;