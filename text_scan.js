// Initialize webcam access and text scanning functionality
const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const scannedTextElement = document.getElementById('scannedText');

// Load camera feed
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing the camera: ", err);
    });

// Capture and process image for text scanning
captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');

    // Send image to Flask for text recognition
    fetch('/scan_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
    })
    .then(response => response.json())
    .then(data => {
        scannedTextElement.innerHTML = data.text;
        speakText(data.text);  // Convert text to speech
    })
    .catch(err => {
        console.error("Error scanning text: ", err);
    });
});

// Text-to-Speech conversion using the browser's speech synthesis API
function speakText(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    window.speechSynthesis.speak(speech);
}
