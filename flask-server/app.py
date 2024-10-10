import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from AddFoundItemPic import *
import base64


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_all_items():
    """Fetch all items from the database."""
    conn = sqlite3.connect('databases/ItemListings.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM FOUNDITEMS")
    items = cursor.fetchall()
    conn.close()
    return items

def get_item_by_id(item_id):
    """Fetch a single item from the database by its ID."""
    conn = sqlite3.connect('databases/ItemListings.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM FOUNDITEMS WHERE ItemID = ?", (item_id,))
    item = cursor.fetchone()
    conn.close()
    return item


@app.route('/')
def home():
    app.logger.info("Accessed root route")
    return jsonify({"message": "Welcome to the Lost and Found API"}), 200

@app.route('/items', methods=['POST'])
def add_item():
    app.logger.info("Received POST request to /items")
    app.logger.debug(f"Request form data: {request.form}")
    app.logger.debug(f"Request files: {request.files}")

    if 'image' not in request.files:
        app.logger.warning("No image file in request")
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        app.logger.warning("Empty filename")
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Get other form data
        item_name = request.form.get('itemName')
        color = request.form.get('color')
        brand = request.form.get('brand')
        found_at = request.form.get('foundAt')
        turned_in_at = request.form.get('turnedInAt')
        description = request.form.get('description')
        
        insertItem(item_name, color, brand, found_at, turned_in_at, description, file_path)
        
        app.logger.info(f"New item added: {item_name}, {color}, {brand}, {found_at}, {turned_in_at}, {description}")
        app.logger.info(f"Image saved at: {file_path}")
        
        
        #ADD Code here to delete the recently uploaded pic coz its already in the db
        #Do this after - Shlok
        #os.remove(file_path)
        
        
        return jsonify({'message': 'Item added successfully', 'filename': filename}), 200
    
    app.logger.warning("Invalid file type")
    return jsonify({'error': 'Invalid file type'}), 400

# endpoint to get all items
@app.route('/items', methods=['GET'])
def view_all_items():
    app.logger.info("Fetching all items")
    items = get_all_items()
    items_list = [{
        'ItemID': item[0],
        'ItemName': item[1],
        'Color': item[2],
        'Brand': item[3],
        'LocationFound': item[4],
        'LocationTurnedIn': item[5],
        'Description': item[6],
        'ImageURL': base64.b64encode(item[7]).decode('utf-8') if isinstance(item[7], bytes) else item[7]
    } for item in items]
    # for image display in frontend: <img src={`data:image/jpeg;base64,${base64ImageData}`} alt="Item" />

    
    return jsonify(items_list), 200
 
# New endpoint to get a specific item by its ID
@app.route('/item/<int:item_id>', methods=['GET'])
def view_item(item_id):
    app.logger.info(f"Fetching details for item ID: {item_id}")
    item = get_item_by_id(item_id)
    
    if item:
        item_data = {
            'ItemID': item[0],
            'ItemName': item[1],
            'Color': item[2],
            'Brand': item[3],
            'LocationFound': item[4],
            'LocationTurnedIn': item[5],
            'Description': item[6],
            'ImageURL': base64.b64encode(item[7]).decode('utf-8') if isinstance(item[7], bytes) else item[7]
        }
        return jsonify(item_data), 200
    else:
        app.logger.warning(f"Item with ID {item_id} not found")
        return jsonify({'error': 'Item not found'}), 404
    
# archive item
@app.route('/item/archive/<int:item_id>', methods=['POST'])
def archive_item_endpoint(item_id):
    try:
        conn = sqlite3.connect('databases/ItemListings.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE FOUNDITEMS SET Archived = 1 WHERE ItemID = ?", (item_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Item archived successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error archiving item: {e}")
        return jsonify({'error': 'Failed to archive item'}), 500

# endpoint to unarchive item
@app.route('/item/unarchive/<int:item_id>', methods=['POST'])
def unarchive_item_endpoint(item_id):
    try:
        conn = sqlite3.connect('databases/ItemListings.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE FOUNDITEMS SET Archived = 0 WHERE ItemID = ?", (item_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Item unarchived successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error unarchiving item: {e}")
        return jsonify({'error': 'Failed to unarchive item'}), 500


if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=5000)