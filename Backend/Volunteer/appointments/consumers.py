import json
from channels.generic.websocket import AsyncWebsocketConsumer


class VideoCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"video_{self.room_name}"
        self.user = self.scope["user"]

        # Reject if not authenticated
        if self.user.is_anonymous:
            print("❌ Anonymous user tried to connect")
            await self.close(code=4001)
            return

        print(f"✅ Authenticated WebSocket user: {self.user} ({getattr(self.user, 'role', 'unknown')})")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        print(f"📡 WebSocket connected to {self.room_group_name}")

        # Notify others that a new participant is ready
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "signal_message",
                "message": {"type": "ready", "role": getattr(self.user, "role", "unknown")},
                "sender_channel": self.channel_name,
            }
        )

        # 🔹 Extra: if this user is a patient, notify doctors
        if getattr(self.user, "role", None) == "patient":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "signal_message",
                    "message": {
                        "type": "patient-joined",
                        "patient_id": self.user.id,
                        "patient_name": self.user.full_name,
                    },
                    "sender_channel": self.channel_name,
                }
            )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"🔌 Disconnected {self.room_group_name}, code={close_code}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")
        print(f"📩 Received {msg_type} from {self.channel_name}")

        # Only doctor can send offer
        if msg_type == "offer":
            if getattr(self.user, "role", None) != "doctor":
                print("❌ Patient is not allowed to send offer")
                return
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "signal_message",
                    "message": {"type": "offer", "offer": data.get("offer")},
                    "sender_channel": self.channel_name,
                }
            )

        # Only patient can send answer
        elif msg_type == "answer":
            if getattr(self.user, "role", None) != "patient":
                print("❌ Doctor is not allowed to send answer")
                return
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "signal_message",
                    "message": {"type": "answer", "answer": data.get("answer")},
                    "sender_channel": self.channel_name,
                }
            )

        # Both can exchange ICE candidates
        elif msg_type in ["ice", "candidate"]:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "signal_message",
                    "message": {"type": "ice", "candidate": data.get("candidate")},
                    "sender_channel": self.channel_name,
                }
            )

    async def signal_message(self, event):
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps(event["message"]))
