import cv2
import numpy as np
import pyttsx3
from ultralytics import YOLO
import base64

# Initialize YOLOv8 model (ensure the path is correct)
model = YOLO('static/yolov8s.pt')

# Initialize text-to-speech engine
engine = pyttsx3.init()

def process_frame(image_data):
    try:
        # Convert base64 image data to OpenCV image
        image_data = image_data.split(',')[1]  # Strip out base64 header
        img_bytes = np.frombuffer(base64.b64decode(image_data), np.uint8)
        img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

        # Perform object detection
        results = model(img)

        detected_objects = []
        for result in results:
            for obj in result.boxes.data:
                label = int(obj[5])
                confidence = float(obj[4])
                bbox = [float(coord) for coord in obj[:4]]
                detected_objects.append({
                    "label": label,
                    "confidence": confidence,
                    "bbox": bbox
                })

        # Convert detected objects to speech
        if detected_objects:
            detected_labels = [f"Object with label {obj['label']} and confidence {obj['confidence']:.2f}" for obj in detected_objects]
            speech_text = "Detected objects: " + ", ".join(detected_labels)
            engine.say(speech_text)
            engine.runAndWait()

        return detected_objects
    except Exception as e:
        return {"error": str(e)}
