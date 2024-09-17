// JavaScript to fetch the video feed and object detections from Flask backend
const videoElement = document.getElementById('camera-feed');

// Function to get the video feed from Flask
function loadVideoFeed() {
    videoElement.src = '/video_feed';  // Ensure /video_feed is the correct route
}

// Function to fetch detected objects
function fetchDetectedObjects() {
    fetch('/detect_objects')
        .then(response => response.json())
        .then(data => {
            if (data.objects.length > 0) {
                const objects = data.objects.join(', ');
                console.log("Detected objects: " + objects);
                handleDetectedObjects(objects);  // Hand over to voice assistant
            }
        })
        .catch(error => console.error('Error fetching detected objects:', error));
}

// Fetch detected objects every 5 seconds and load the video feed
loadVideoFeed();
setInterval(fetchDetectedObjects, 5000);
