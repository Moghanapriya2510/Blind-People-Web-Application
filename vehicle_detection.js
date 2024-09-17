function fetchDetectedVehicles() {
    fetch('/detect_vehicle')
        .then(response => response.json())
        .then(data => {
            if (data.vehicles.length > 0) {
                console.log("Detected vehicles: " + data.vehicles.join(', '));
                // Handle vehicle detection response
            }
        })
        .catch(error => console.error('Error:', error));
}

// Fetch vehicles every 5 seconds
setInterval(fetchDetectedVehicles, 5000);
