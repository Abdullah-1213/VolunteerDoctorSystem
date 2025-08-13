import { useEffect, useRef } from "react";

const VideoCall = ({ appointmentId }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = new WebSocket(`ws://localhost:8000/ws/call/${appointmentId}/`);

        peerRef.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localVideoRef.current.srcObject = stream;
                stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));
            });

        peerRef.current.ontrack = event => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        peerRef.current.onicecandidate = event => {
            if (event.candidate) {
                socketRef.current.send(JSON.stringify({ type: "ice", candidate: event.candidate }));
            }
        };

        socketRef.current.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "offer") {
                await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerRef.current.createAnswer();
                await peerRef.current.setLocalDescription(answer);
                socketRef.current.send(JSON.stringify({ type: "answer", answer }));
            } 
            else if (data.type === "answer") {
                await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            } 
            else if (data.type === "ice") {
                await peerRef.current.addIceCandidate(data.candidate);
            } 
            else if (data.type === "ready") {
                // This means second user joined — create offer
                const offer = await peerRef.current.createOffer();
                await peerRef.current.setLocalDescription(offer);
                socketRef.current.send(JSON.stringify({ type: "offer", offer }));
            }
        };

        return () => {
            socketRef.current.close();
        };
    }, [appointmentId]);

    return (
        <div className="flex gap-4">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 border" />
            <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 border" />
        </div>
    );
};

export default VideoCall;
