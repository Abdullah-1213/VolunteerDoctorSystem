import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";

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

  const role = localStorage.getItem("role") || "patient"; // doctor / patient

  // 🔑 Refresh Token
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("https://d0eeddd93c30.ngrok-free.app/api/token/refresh/", {
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
        `wss://d0eeddd93c30.ngrok-free.app/ws/video/${roomId}/?token=${token}`
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
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
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
  useEffect(() => {
    if (!roomId) return;
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
  }, [roomId, initializeResources]);

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="col-span-2 relative bg-black rounded-xl overflow-hidden shadow-lg">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-[500px] object-cover" />
          <div className="absolute bottom-4 right-4 w-32 h-24 bg-black/70 rounded-lg overflow-hidden border border-gray-700">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-md text-sm">
            Room: {roomId}
          </div>
          <div className="absolute top-4 right-4 text-white bg-black/50 px-3 py-1 rounded-md text-sm">
            Role: {role}
          </div>
        </div>

        {/* Controls & Status */}
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-gray-100 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Status</p>
            <p className="font-semibold">{connectionStatus}</p>
            {mediaError && <p className="text-red-500 text-sm mt-2">{mediaError}</p>}
          </div>

          <div className="p-4 bg-gray-100 rounded-lg shadow flex flex-col gap-3">
            <button
              onClick={toggleVideo}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg ${
                videoEnabled ? "bg-indigo-600 text-white" : "bg-white border"
              }`}
            >
              {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
              {videoEnabled ? "Video On" : "Video Off"}
            </button>

            <button
              onClick={toggleAudio}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg ${
                audioEnabled ? "bg-indigo-600 text-white" : "bg-white border"
              }`}
            >
              {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
              {audioEnabled ? "Unmuted" : "Muted"}
            </button>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg text-xs text-gray-500">
            This is a demo UI. In production, use TURN servers and secure token handling.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
