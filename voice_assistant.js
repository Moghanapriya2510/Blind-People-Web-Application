// Function to initialize voice assistant and deliver the intro message
function initVoiceAssistantFunction() {
    const synth = window.speechSynthesis;
    if (synth) {
        const introText = "Welcome to Bright Way, empowering your journey with advanced technology for a clearer, brighter future.";
        const utterance = new SpeechSynthesisUtterance(introText);
        utterance.volume = 1; // Set volume to the maximum (range: 0.0 to 1.0)
        synth.speak(utterance);

        utterance.onend = function() {
            console.log('Voice assistant finished speaking.');
        };
        
        utterance.onerror = function(event) {
            console.error('Voice assistant error:', event.error);
        };
    } else {
        console.error('Speech synthesis not supported.');
    }
}

// Ensure the function is available for index.html
if (typeof window.initVoiceAssistantFunction === 'undefined') {
    window.initVoiceAssistantFunction = initVoiceAssistantFunction;
}
function initVoiceAssistantFunction() {
    console.log('Initializing voice assistant...');
    const synth = window.speechSynthesis;

    if (synth) {
        const introText = "You are on the home page. Please select a feature.";
        const utterance = new SpeechSynthesisUtterance(introText);
        utterance.volume = 1; // Set volume to the maximum

        utterance.onstart = function() {
            console.log('Voice assistant started speaking.');
            document.getElementById('status').textContent = 'Voice assistant is speaking...';
        };

        utterance.onend = function() {
            console.log('Voice assistant finished speaking.');
            document.getElementById('status').textContent = 'Voice assistant finished speaking.';
            // Start listening for voice commands
            startListening();
        };

        utterance.onerror = function(event) {
            console.error('Voice assistant error:', event.error);
            document.getElementById('status').textContent = 'Voice assistant error: ' + event.error;
        };

        synth.speak(utterance);
    } else {
        console.error('Speech synthesis not supported.');
        document.getElementById('status').textContent = 'Speech synthesis not supported.';
    }
}

function startListening() {
    console.log('Starting voice recognition...');
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    recognition.onstart = function() {
        console.log('Voice recognition started.');
    };

    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command:', command);
        
        if (command.includes('object detection')) {
            window.location.href = '/objectdetection';
        } else if (command.includes('vehicle detection')) {
            window.location.href = '/vehicledetection';
        } else if (command.includes('text scanning')) {
            window.location.href = '/textscanning';
        }
    };

    recognition.onerror = function(event) {
        console.error('Voice recognition error:', event.error);
    };

    recognition.start();
}
// Function to announce detected objects using SpeechSynthesis API
function announceObjects(objects) {
    if ('speechSynthesis' in window) {
        let announcement = objects.join(', ');

        let speech = new SpeechSynthesisUtterance(announcement);
        speech.lang = 'en-US';  // Set the language to English
        speech.pitch = 1;
        speech.rate = 1;
        window.speechSynthesis.speak(speech);
    } else {
        console.error("SpeechSynthesis not supported in this browser.");
    }
}

// Function to fetch detected objects from the server
// Function to use browser's SpeechSynthesis API for voice announcements
function announceObjects(objects) {
    const speechSynthesis = window.speechSynthesis;

    if (objects.length > 0) {
        const message = `Detected objects are: ${objects}`;
        const utterance = new SpeechSynthesisUtterance(message);
        
        // Set some properties for the voice assistant (optional)
        utterance.lang = 'en-US';  // Set language to English
        utterance.pitch = 1.0;     // Normal pitch
        utterance.rate = 1.0;      // Normal speed
        
        // Speak the detected objects
        speechSynthesis.speak(utterance);
    }
}

// Function to check if the browser's speech synthesis is active
function stopOngoingSpeech() {
    const speechSynthesis = window.speechSynthesis;
    
    // If the voice assistant is still speaking, stop it before announcing new objects
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
}

// Function to handle detected object announcements (call this from object_detection.js)
function handleDetectedObjects(objects) {
    stopOngoingSpeech();  // Ensure no overlapping announcements
    announceObjects(objects);  // Announce the newly detected objects
}

function announceObjects(objects) {
    // Use the Web Speech API for text-to-speech
    const msg = new SpeechSynthesisUtterance(`Detected objects: ${objects}`);
    window.speechSynthesis.speak(msg);
}

// Expose the function to the global scope for integration
window.announceObjects = announceObjects;
