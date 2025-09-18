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

  // 👇 Add role from localStorage (set this on login)
  const role = localStorage.getItem("role"); // "doctor" or "patient"

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("https://1c92a9c45456.ngrok-free.app/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ refresh: localStorage.getItem("refresh_token") }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.access) {
        localStorage.setItem("access_token", data.access);
        console.log("🔄 Token refreshed successfully");
        return data.access;
      }
      throw new Error("No access token in response");
    } catch (err) {
      console.error("❌ Token refresh failed:", err);
      setMediaError("Token refresh failed. Please log in again.");
      return null;
    }
  }, []);

  const connectWebSocket = useCallback(
    async (token) => {
      if (isConnectingRef.current || socketRef.current) return;
      if (!isMountedRef.current) return;

      isConnectingRef.current = true;
      console.log("🔌 Attempting WebSocket connection...");
      socketRef.current = new WebSocket(
        `wss://1c92a9c45456.ngrok-free.app/ws/video/${roomId}/?token=${token}`
      );

      socketRef.current.onopen = () => {
        if (socketRef.current && isMountedRef.current) {
          console.log("✅ WebSocket opened for room:", roomId);
          setConnectionStatus("Connected");
          socketRef.current.send(JSON.stringify({ type: "ready", role }));
        }
        isConnectingRef.current = false;
      };

      socketRef.current.onmessage = async (event) => {
        if (!isMountedRef.current) return;
        const data = JSON.parse(event.data);
        console.log("📩 Received:", data);

        if (data.type === "ready") {
          // ✅ Only doctor creates offer
          if (role === "doctor") {
            try {
              console.log("👨‍⚕️ Doctor initiating offer...");
              const offer = await peerRef.current.createOffer();
              await peerRef.current.setLocalDescription(offer);
              if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: "offer", offer }));
              }
            } catch (err) {
              console.error("❌ Error creating/sending offer:", err);
              setConnectionStatus("Failed to create offer");
            }
          }
        } else if (data.type === "offer") {
          // ✅ Only patient answers
          if (role === "patient") {
            try {
              console.log("👩‍⚕️ Patient received offer, creating answer...");
              await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await peerRef.current.createAnswer();
              await peerRef.current.setLocalDescription(answer);
              if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: "answer", answer }));
              }
            } catch (err) {
              console.error("❌ Error handling offer:", err);
              setConnectionStatus("Failed to process offer");
            }
          }
        } else if (data.type === "answer") {
          if (!peerRef.current.currentRemoteDescription) {
            try {
              await peerRef.current.setRemoteDescription(
                new RTCSessionDescription(data.answer)
              );
              console.log("✅ Doctor set remote description (answer)");
            } catch (err) {
              console.error("❌ Error setting remote description:", err);
              setConnectionStatus("Failed to set answer");
            }
          }
        } else if (data.type === "ice") {
          try {
            await peerRef.current.addIceCandidate(data.candidate);
            console.log("✅ Added ICE candidate:", data.candidate);
          } catch (err) {
            console.error("❌ Error adding ICE:", err);
            setConnectionStatus("Failed to add ICE candidate");
          }
        }
      };

      socketRef.current.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        isConnectingRef.current = false;
        socketRef.current = null;
        setConnectionStatus("WebSocket error");
        if (isMountedRef.current) setTimeout(() => connectWebSocket(token), 3000);
      };

      socketRef.current.onclose = (event) => {
        console.warn("⚠️ WebSocket closed:", event.code, event.reason);
        isConnectingRef.current = false;
        socketRef.current = null;
        setConnectionStatus("WebSocket closed");
        if (isMountedRef.current && !event.wasClean) {
          setTimeout(() => connectWebSocket(token), 3000);
        }
      };
    },
    [roomId, role]
  );

  const initializeResources = useCallback(
    async () => {
      if (isMediaInitialized.current) return;

      let token = localStorage.getItem("access_token") || "";
      if (!token) {
        token = await refreshToken();
        if (!token) {
          setMediaError("No valid token available. Please log in again.");
          return;
        }
      }
      console.log("🔑 Using token:", token);

      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerRef.current.ontrack = (event) => {
        if (remoteVideoRef.current && isMountedRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setConnectionStatus("Connected to peer");
        }
      };

      peerRef.current.onicecandidate = (event) => {
        if (
          event.candidate &&
          socketRef.current?.readyState === WebSocket.OPEN &&
          isMountedRef.current
        ) {
          socketRef.current.send(JSON.stringify({ type: "ice", candidate: event.candidate }));
        }
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isMountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        isMediaInitialized.current = true;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        if (peerRef.current && peerRef.current.signalingState !== "closed") {
          stream.getTracks().forEach((track) => peerRef.current.addTrack(track, stream));
          console.log("✅ Local stream initialized and tracks added");
        }
      } catch (err) {
        console.error("❌ Media error:", err);
        setMediaError("Unable to access camera/microphone.");
        return;
      }

      await connectWebSocket(token);
    },
    [connectWebSocket, refreshToken]
  );

  useEffect(() => {
    if (!roomId) return;
    isMountedRef.current = true;
    isStrictModeUnmount.current = false;

    initializeResources();

    return () => {
      isMountedRef.current = false;
      if (isStrictModeUnmount.current) {
        isStrictModeUnmount.current = false;
        return;
      }
      setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
          socketRef.current.close();
          socketRef.current = null;
        }
        isConnectingRef.current = false;
        if (peerRef.current && peerRef.current.signalingState !== "closed") {
          peerRef.current.close();
        }
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop());
          localStreamRef.current = null;
          isMediaInitialized.current = false;
        }
      }, 100);
    };
  }, [roomId, initializeResources]);

  useEffect(() => {
    isStrictModeUnmount.current = true;
    return () => {};
  }, []);

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
    <div className="flex flex-col items-center gap-4">
      {mediaError && <div className="text-red-500 mb-4">{mediaError}</div>}
      <div className="text-gray-500 mb-4">Status: {connectionStatus}</div>
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 border rounded" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 border rounded" />
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            videoEnabled ? "bg-red-500" : "bg-green-500"
          } text-white`}
          disabled={!localStreamRef.current?.getVideoTracks().length}
        >
          {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          {videoEnabled ? "Turn Off Video" : "Turn On Video"}
        </button>

        <button
          onClick={toggleAudio}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            audioEnabled ? "bg-red-500" : "bg-green-500"
          } text-white`}
          disabled={!localStreamRef.current?.getAudioTracks().length}
        >
          {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          {audioEnabled ? "Mute" : "Unmute"}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
