from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import joblib
import numpy as np
import os
from django.conf import settings


# Load model, scaler, encoder
model_path = os.path.join(settings.BASE_DIR, 'prediction', 'ml_model', 'voting_model.pkl')
scaler_path = os.path.join(settings.BASE_DIR, 'prediction', 'ml_model', 'scaler.pkl')
encoder_path = os.path.join(settings.BASE_DIR, 'prediction', 'ml_model', 'risklevel_encoder.pkl')

model = joblib.load(model_path)
scaler = joblib.load(scaler_path)
encoder = joblib.load(encoder_path)


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([JSONParser])
def predict_risk(request):
    data = request.data
    print(f"Received data: {data}")  # Debug

    # Required fields
    required_fields = ["Age", "SystolicBP", "DiastolicBP", "BS", "BodyTemp", "HeartRate"]
    missing_fields = [f for f in required_fields if f not in data]

    if missing_fields:
        return Response({"error": f"Missing fields: {', '.join(missing_fields)}"}, status=400)

    try:
        # Convert input to numpy array
        features = np.array([[
            float(data["Age"]),
            float(data["SystolicBP"]),
            float(data["DiastolicBP"]),
            float(data["BS"]),
            float(data["BodyTemp"]),
            float(data["HeartRate"]),
        ]])

        # Scale features
        scaled = scaler.transform(features)

        # Predict
        pred = model.predict(scaled)

        # FIX: reshape before decoding
        pred = pred.reshape(-1, 1)

        # Decode label
        label = encoder.inverse_transform(pred)

        return Response({"prediction": label[0][0]})

    except Exception as e:
        print("Prediction error:", e)
        return Response({"error": f"Prediction error: {str(e)}"}, status=500)
