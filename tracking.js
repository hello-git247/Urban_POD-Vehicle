// assets/tracking.js

// Initialize the map
const map = L.map('map').setView([17.7253, 78.2572], 13); // Initial coordinates for BVRIT College

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Define geofences
var geofences = [
    L.circle([17.7253, 78.2572], { radius: 500, color: 'red' }).addTo(map), // Geofence around BVRIT College
    L.circle([17.4948, 78.3578], { radius: 500, color: 'red' }).addTo(map), // Geofence around Miyapur
    L.circle([17.5402, 78.4583], { radius: 500, color: 'red' }).addTo(map), // Geofence around Gandimaisamma
    L.circle([17.6248, 78.0820], { radius: 500, color: 'red' }).addTo(map), // Geofence around Sangareddy
    L.circle([17.6311, 78.4828], { radius: 500, color: 'red' }).addTo(map)  // Geofence around Medchal
];

// Define the number 8-shaped railway line
var railwayLine = [
    [17.7253, 78.2572],
    [17.73, 78.25],
    [17.735, 78.2572],
    [17.73, 78.2644],
    [17.7253, 78.2572],
    [17.72, 78.25],
    [17.715, 78.2572],
    [17.72, 78.2644],
    [17.7253, 78.2572]
];

// Add the railway line to the map
var railwayPolyline = L.polyline(railwayLine, {color: 'blue'}).addTo(map);

// Define the destination points
var destinations = [
    {name: 'Miyapur', coords: [17.4948, 78.3578]},
    {name: 'Gandimaisamma', coords: [17.5402, 78.4583]},
    {name: 'Sangareddy', coords: [17.6248, 78.0820]},
    {name: 'Medchal', coords: [17.6311, 78.4828]}
];

// Add destination points to the map
destinations.forEach(function(destination) {
    L.marker(destination.coords).addTo(map)
        .bindPopup(destination.name)
        .openPopup();
});

// Existing code for marker and tracking
const marker = L.marker([17.7253, 78.2572]).addTo(map); // Initial marker position for BVRIT College
let trackingInterval;
let isTrackingStarted = false; // Flag to control tracking

// Coordinates for the locations
const locations = {
    bvrit: [17.7253, 78.2572],
    miyapur: [17.4948, 78.3578],
    gandimaisamma: [17.5402, 78.4583],
    medchal: [17.6311, 78.4828],
    sangareddy: [17.6248, 78.0820]
};

// Function to generate the route based on the selected destination
function generateRoute(start, destination) {
    const route = [start, destination];
    const remainingLocations = Object.values(locations).filter(loc => loc !== start && loc !== destination);
    while (remainingLocations.length) {
        route.push(remainingLocations.shift());
    }
    route.push(start); // Close the loop
    return route;
}

// Get the selected destination from the first window
const selectedDestination = localStorage.getItem('selectedDestination') || 'miyapur';
const route = generateRoute(locations.bvrit, locations[selectedDestination]);

// Add the route to the map
const routePolyline = L.polyline(route, {color: 'green'}).addTo(map);

let index = 0; // Define the index variable in the correct scope
let lastUpdateTime = Date.now();
let lastLatLng = L.latLng(locations.bvrit);

// Function to check if the marker is within any geofence
function isWithinGeofence(latlng) {
    return geofences.some(geofence => geofence.getBounds().contains(latlng));
}

// Function to update marker position based on the generated route
function updateMarker() {
    if (!isTrackingStarted) return; // Wait until tracking is started

    const [lat, lng] = route[index]; // Correct order: [latitude, longitude]
    const latlng = L.latLng(lat, lng);
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 13);
    index = (index + 1) % route.length; // Cycle through coordinates

    // Calculate speed
    const currentTime = Date.now();
    const timeDiff = (currentTime - lastUpdateTime) / 1000; // Time difference in seconds
    const distance = map.distance(lastLatLng, latlng) / 1000; // Distance in kilometers
    const speed = (distance / timeDiff) * 3600; // Speed in km/h
    document.getElementById('trackingSpeed').innerText = speed.toFixed(2);

    lastUpdateTime = currentTime;
    lastLatLng = latlng;

    // Update track location
    document.getElementById('trackLocation').innerText = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

    // Generate a random track health percentage between 90% and 100%
    const trackHealth = (Math.random() * 10 + 90).toFixed(2);
    document.getElementById('trackHealth').innerText = `${trackHealth}%`;

    // Update the progress bar width
    document.getElementById('healthProgress').style.width = `${trackHealth}%`;

    // Check if the marker is within any geofence
    if (isWithinGeofence(latlng)) {
        console.log('Marker is within a geofence');
    } else {
        console.log('Marker is outside of geofences');
    }

    // Update energy consumption based on speed
    updateEnergyConsumption(speed);
}

// Function to simulate sending a command to the POD
function sendCommandToPOD(command) {
    console.log(`Sending command to POD: ${command}`);
    // Simulate a delay for the POD to respond
    setTimeout(() => {
        if (command === 'START') {
            console.log('POD started');
            isTrackingStarted = true; // Start tracking
            trackingInterval = setInterval(updateMarker, 5000);
        } else if (command === 'STOP') {
            console.log('POD stopped');
            isTrackingStarted = false; // Stop tracking
            clearInterval(trackingInterval);
        }
    }, 1000); // Simulate 1 second delay
}

// Function to start the POD
function startPOD() {
    sendCommandToPOD('START');
}

// Function to stop the POD
function stopPOD() {
    sendCommandToPOD('STOP');
}

// Event listener for booking button
document.getElementById('bookingButton').addEventListener('click', () => {
    startPOD();
});

// Event listener for emergency stop button
document.getElementById('emergencyStopButton').addEventListener('click', () => {
    stopPOD();
    map.removeLayer(marker);
    document.getElementById('trackingSpeed').innerText = '0';
    setTimeout(() => {
        window.close();
    }, 2000); // Close the app after 2 seconds
});

// Function to update track health and location
async function updateTrackHealth() {
    try {
        const response = await fetch('http://localhost:5000/track_health');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const trackHealthInfo = await response.json();
        document.getElementById('trackHealth').innerText = `${trackHealthInfo.health}%`;
        document.getElementById('trackLocation').innerText = trackHealthInfo.location;
    } catch (error) {
        console.error('Failed to fetch track health:', error);
    }
}

// Set up WebSocket connection
const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        try {
            const compressedData = new Uint8Array(reader.result);
            const decompressedData = pako.inflate(compressedData, { to: 'string' });
            const data = JSON.parse(decompressedData);
            console.log(data);
            // Handle the data as needed
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsArrayBuffer(event.data);
};

// Function to fetch and display energy consumption data
async function updateEnergyConsumption(speed) {
    try {
        // Generate random energy consumption values for demonstration
        const energyData = {
            consumption: Math.random() * 100, // Random consumption value
            unit: 'kWh'
        };
        document.getElementById('energyConsumption').innerText = `${energyData.consumption.toFixed(2)} ${energyData.unit}`;
    } catch (error) {
        console.error('Failed to fetch energy consumption:', error);
    }
}

// Function to update marker position based on the generated route
function updateLocation() {
    routeIndex = (routeIndex + 1) % routePoints.length;
    const newLocation = routePoints[routeIndex];
    const speed = calculateSpeed(newLocation);  // Implement this function to calculate speed
    marker.setLatLng(newLocation);
    map.setView(newLocation);
    fetch(`http://localhost:5000/update_location?lat=${newLocation.lat}&lng=${newLocation.lng}`);
    updateEnergyConsumption(speed);  // Update energy consumption based on speed
}

// Function to calculate speed based on new location
function calculateSpeed(newLocation) {
    // Placeholder implementation to calculate speed based on new location
    // You can use the distance between the previous and new location and the time interval
    return Math.random() * 10;  // Random speed for demonstration
}