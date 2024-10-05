from flask import Flask, jsonify

app = Flask(__name__)

# Mock in-memory data store for items (replace with SQLite later)
items = [
    {"description": "Lost Wallet", "size": "Small", "color": "Black", "shape": "Rectangle", "additional_notes": "Found near library"},
    {"description": "Phone", "size": "Medium", "color": "Silver", "shape": "Rectangle", "additional_notes": "No case, slight scratch on screen"}
]

# route to return the list of items
@app.route("/items", methods=["GET"])
def get_items():
    return jsonify(items) # Convert Python data to JSON

@app.route("/test")
def test():
    return{"test": ["Test1", "Test2"]}

if __name__ == "__main__":
    app.run(debug=True)