document.addEventListener('DOMContentLoaded', () => {
    const payButton = document.getElementById('payButton');
    const submitTransactionIdButton = document.getElementById('submitTransactionId');
    const statusButton = document.getElementById('statusButton');
    const fetchDataButton = document.getElementById('fetchData');
    const bookingButton = document.getElementById('bookingButton');

    if (payButton) {
        payButton.addEventListener('click', async () => {
            const customerName = document.getElementById('customerName').value.trim();
            const destination = document.getElementById('destination').value;

            if (!customerName || !destination) {
                displayMessage('Please fill in all the details.', 'error');
                return;
            }

            // Generate UPI QR Code
            const upiId = 'yashwanth.devulapalli-1@okaxis'; // Replace with your UPI ID
            const amount = 10; // Amount in INR
            const upiUrl = `upi://pay?pa=${upiId}&pn=${customerName}&am=${amount}&cu=INR`;

            generateQRCode(upiUrl);
            document.getElementById('paymentMethods').style.display = 'block';
            document.getElementById('transactionSection').style.display = 'block';
        });
    }

    if (submitTransactionIdButton) {
        submitTransactionIdButton.addEventListener('click', async () => {
            const customerName = document.getElementById('customerName').value.trim();
            const transactionId = document.getElementById('transactionId').value.trim();

            if (!transactionId) {
                displayMessage('Please enter the transaction ID.', 'error');
                return;
            }

            // Send transaction ID to the server
            try {
                const response = await fetch('http://localhost:5000/booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: customerName, transactionId: transactionId, status: 'Paid' }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Process the booking
                processBooking(customerName);
            } catch (error) {
                console.error('Failed to fetch:', error);
            }
        });
    }

    if (statusButton) {
        statusButton.addEventListener('click', () => {
            const customerName = document.getElementById('customerName').value.trim();
            const startingPoint = 'BVRIT College';
            const destination = document.getElementById('destination').value;

            if (!customerName || !destination) {
                displayMessage('Please fill in all the details.', 'error');
                return;
            }

            const trackingWindow = window.open('tracking.html', 'TrackingWindow', 'width=800,height=600');
            trackingWindow.onload = () => {
                trackingWindow.document.getElementById('trackingName').innerText = customerName;
                trackingWindow.document.getElementById('trackingStart').innerText = startingPoint;
                trackingWindow.document.getElementById('trackingDestination').innerText = destination;
            };
        });
    }

    if (fetchDataButton) {
        fetchDataButton.addEventListener('click', async () => {
            try {
                const response = await fetch('http://localhost:5000/get_bookings');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const bookings = await response.json();
                const dataDisplay = document.getElementById('dataDisplay');
                dataDisplay.innerHTML = JSON.stringify(bookings, null, 2);
            } catch (error) {
                console.error('Failed to fetch:', error);
            }
        });
    }

    if (bookingButton) {
        bookingButton.addEventListener('click', () => {
            handleBooking();
        });
    }
});

async function processBooking(customerName) {
    try {
        const response = await fetch('http://localhost:5000/get_bookings');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const bookings = await response.json();
        console.log('Bookings:', bookings); // Log the bookings for debugging

        const booking = bookings.find(b => b.name === customerName);
        if (booking && booking.status === 'Paid') {
            const messages = [
                { message: 'POD is booked successfully', language: 'en-US' }
            ];
            playVoiceMessages(messages);
            document.getElementById('bookingInfo').style.display = 'block';
            document.getElementById('statusButton').style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to fetch:', error);
    }
}

function generateQRCode(url) {
    const qrCodeElement = document.getElementById('qrCode');
    qrCodeElement.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=200x200`;
}

function displayMessage(message, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerText = message;
    } else {
        console.error(`Element with id ${elementId} not found`);
    }
}

// Function to generate a unique transaction ID
function generateTransactionID() {
    return 'txn_' + Math.random().toString(36).substr(2, 9);
}

// Function to handle booking
function handleBooking() {
    const transactionID = generateTransactionID();
    localStorage.setItem('currentTransactionID', transactionID);
    // Generate QR code with the new transaction ID
    generateQRCode(transactionID);
}

// Function to validate the transaction ID
function validateTransactionID(transactionID) {
    const currentTransactionID = localStorage.getItem('currentTransactionID');
    return transactionID === currentTransactionID;
}