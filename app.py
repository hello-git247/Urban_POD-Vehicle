from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

current_location = {"lat": 17.494793, "lng": 78.399644}

bookings = [
    {"name": "John Doe", "transactionId": "txn_123", "status": "Paid"},
    {"name": "Jane Smith", "transactionId": "txn_456", "status": "Pending"}
]


@app.route('/update_location', methods=['GET'])
def update_location():
    global current_location
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    current_location = {"lat": float(lat), "lng": float(lng)}
    return jsonify({"message": "Location updated"}), 200


@app.route('/get_location', methods=['GET'])
def get_location():
    return jsonify(current_location), 200


@app.route('/get_bookings', methods=['GET'])
def get_bookings():
    return jsonify(bookings), 200


@app.route('/get_dynamic_insights', methods=['GET'])
def get_dynamic_insights():
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    insights = [
        {"message": f"Predicted increase in bookings at location ({lat}, {lng})"},
        {"message": f"High demand expected near ({lat}, {lng})"},
        {"message": f"Low traffic expected at location ({lat}, {lng})"}
    ]
    random.shuffle(insights)
    return jsonify(insights)


@app.route('/track_health', methods=['GET'])
def track_health():
    track_health_info = {
        'health': 100,  # Placeholder value for track health
        'location': 'BVRIT College to Miyapur'  # Placeholder value for track location
    }
    return jsonify(track_health_info)

@app.route('/energy_consumption', methods=['GET'])
def energy_consumption():
    speed = request.args.get('speed', default=0,
                             type=int)
    energy_consumption = speed * random.uniform(0.1, 0.5)  # Placeholder calculation
    energy_data = {
        'consumption': energy_consumption,
        'unit': 'kWh'
    }
    return jsonify(energy_data)


@app.route('/booking', methods=['POST'])
def book_pod():
    data = request.json
    bookings.append(data)
    return jsonify({'message': 'Booking successful'}), 201

if __name__ == '__main__':
    app.run(debug=True)