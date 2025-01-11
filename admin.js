let map;
let marker;
let routeIndex = 0;
let totalDistance = 0;
let totalTrips = 0;
const routePoints = [
    { lat: 17.4948, lng: 78.3578 }, // Miyapur
    { lat: 17.5402, lng: 78.4583 }, // Gandimaisamma
    { lat: 17.6311, lng: 78.4828 }, // Medchal
    { lat: 17.6248, lng: 78.0820 }  // Sangareddy
];
const geofences = [
    L.circle([17.4948, 78.3578], { radius: 500 }), // Miyapur
    L.circle([17.5402, 78.4583], { radius: 500 }), // Gandimaisamma
    L.circle([17.6311, 78.4828], { radius: 500 }), // Medchal
    L.circle([17.6248, 78.0820], { radius: 500 })  // Sangareddy
];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setInterval(updateLocation, 5000);

    document.getElementById('fetchBookings').addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:5000/get_bookings');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const bookings = await response.json();
            displayBookings(bookings);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    });

    document.getElementById('fetchInsights').addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:5000/get_insights');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const insights = await response.json();
            displayInsights(insights);
        } catch (error) {
            console.error('Failed to fetch insights:', error);
        }
    });

    document.getElementById('addUserButton').addEventListener('click', () => {
        console.log('Add User button clicked');
    });

    document.getElementById('removeUserButton').addEventListener('click', () => {
        console.log('Remove User button clicked');
    });
document.addEventListener('DOMContentLoaded', () => {
    fetchBookingStats();
    fetchRevenueStats();
});

async function fetchBookingStats() {
    try {
        const response = await fetch('http://localhost:5000/booking_stats');
        const data = await response.json();
        displayBookingChart(data);
    } catch (error) {
        console.error('Error fetching booking stats:', error);
    }
}

async function fetchRevenueStats() {
    try {
        const response = await fetch('http://localhost:5000/revenue_stats');
        const data = await response.json();
        displayRevenueChart(data);
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
    }
}

function displayBookingChart(data) {
    const ctx = document.getElementById('bookingChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Bookings',
                data: data.values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayRevenueChart(data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Revenue',
                data: data.values,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initMap() {
    map = L.map('map').setView([17.4948, 78.3578], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([17.4948, 78.3578]).addTo(map);

    geofences.forEach(geofence => geofence.addTo(map));
}

function updateLocation() {
    const previousLocation = routePoints[routeIndex];
    routeIndex = (routeIndex + 1) % routePoints.length;
    const newLocation = routePoints[routeIndex];
    marker.setLatLng(newLocation);
    map.setView(newLocation);

    const distance = calculateDistance(previousLocation, newLocation);
    totalDistance += distance;
    totalTrips += 1;

    document.getElementById('totalDistance').innerText = totalDistance.toFixed(2);
    document.getElementById('totalTrips').innerText = totalTrips;

    fetch(`http://localhost:5000/update_location?lat=${newLocation.lat}&lng=${newLocation.lng}`);
    fetchDynamicInsights(newLocation);
}

function calculateDistance(point1, point2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function fetchDynamicInsights(location) {
    try {
        const response = await fetch(`http://localhost:5000/get_dynamic_insights?lat=${location.lat}&lng=${location.lng}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const insights = await response.json();
        displayInsights(insights);
    } catch (error) {
        console.error('Failed to fetch dynamic insights:', error);
    }
}

function displayBookings(bookings) {
    const bookingsDisplay = document.getElementById('bookingsDisplay');
    bookingsDisplay.innerHTML = '';
    bookings.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.className = 'booking';
        bookingElement.innerHTML = `<p>Name: ${booking.name}</p><p>Transaction ID: ${booking.transactionId}</p><p>Status: ${booking.status}</p>`;
        bookingsDisplay.appendChild(bookingElement);
    });
}

function displayInsights(insights) {
    const insightsDisplay = document.getElementById('insightsDisplay');
    insightsDisplay.innerHTML = '';
    insights.forEach(insight => {
        const insightElement = document.createElement('div');
        insightElement.className = 'insight';
        insightElement.innerHTML = `<p>${insight.message}</p>`;
        insightsDisplay.appendChild(insightElement);
    });
