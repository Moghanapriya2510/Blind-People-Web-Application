from flask import Flask, render_template, Response, jsonify
import cv2
from ultralytics import YOLO
import pyttsx3
import threading
import time
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
import pytesseract
from flask import request

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Load YOLOv8 model
model = YOLO('yolov8x.pt')

# Initialize text-to-speech engine
engine = pyttsx3.init()
lock = threading.Lock()  # Lock for thread-safe speech announcements

# Variables to track object announcements
announcement_interval = 5  # Time interval (in seconds) between announcements
detected_objects = []

def get_directions(objects):
    directions = []
    if objects:
        for obj in objects:
            if obj['x_center'] < 0.33:
                directions.append(f"{obj['name']} is on the left. Move right.")
            elif obj['x_center'] > 0.67:
                directions.append(f"{obj['name']} is on the right. Move left.")
            else:
                directions.append(f"{obj['name']} is in the middle. Step aside.")
    return directions

def announce_objects():
    global detected_objects
    while True:
        time.sleep(announcement_interval)  # Announce every 5 seconds
        with lock:
            if detected_objects:
                directions = get_directions(detected_objects)
                announcement = ", ".join(directions)
                print(f"Announcing: {announcement}")  # Debugging line
                try:
                    engine.say(announcement)
                    engine.runAndWait()
                except Exception as e:
                    print(f"Error during speech: {e}")  # Debugging line

# Start the thread for announcing objects
threading.Thread(target=announce_objects, daemon=True).start()

def generate_frames():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame.")
            break

        results = model(frame)
        annotated_frame = results[0].plot()

        global detected_objects
        detected_objects = [
            {
                'name': model.names[int(box.cls)],
                'x_center': box.xyxy[0][0] / frame.shape[1]  # Normalized x center
            }
            for box in results[0].boxes if int(box.cls) in [2, 3, 5, 7]  # Filter vehicle classes
        ]

        print(f"Detected objects: {detected_objects}")  # Debugging line

        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed_object_detection')
def video_feed_object_detection():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detect_vehicle')
def detect_vehicle():
    global detected_objects
    try:
        detected_vehicles = [obj['name'] for obj in detected_objects if obj['name'] in ['car', 'truck']]  # Update with actual vehicle names
        if detected_vehicles:
            # Deliver voice feedback for detected vehicles
            with lock:
                engine.say(f"Detected {', '.join(detected_vehicles)}")
                engine.runAndWait()
            return jsonify({'vehicles': detected_vehicles})
        else:
            return jsonify({'vehicles': []})
    except Exception as e:
        print(f"Error in /detect_vehicle: {e}")
        return jsonify({'vehicles': []}), 500
@app.route('/scan_text', methods=['POST'])
def scan_text():
    try:
        data = request.json
        image_data = data.get('image')

        # Decode base64 image
        image_data = image_data.split(",")[1]
        image = Image.open(BytesIO(base64.b64decode(image_data)))

        # Perform text recognition using PyTesseract
        scanned_text = pytesseract.image_to_string(image)

        # Return the scanned text as JSON
        return jsonify({'text': scanned_text})
    except Exception as e:
        print(f"Error in text scanning: {e}")
        return jsonify({'text': ''}), 500
@app.route('/detect_objects')
def detect_objects():
    global detected_objects
    try:
        # Returning the detected objects as JSON
        return jsonify({'objects': [obj['name'] for obj in detected_objects]})
    except Exception as e:
        print(f"Error in /detect_objects: {e}")
        return jsonify({'objects': []}), 500


@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/object_detection')
def object_detection():
    return render_template('object_detection.html')

@app.route('/vehicle_detection')
def vehicle_detection_page():
    return render_template('vehicle_detection.html')

@app.route('/text_scanning')
def text_scanning():
    return render_template('text_scanning.html')

if __name__ == '__main__':
    app.run(debug=True)
