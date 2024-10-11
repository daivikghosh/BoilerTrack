import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import sqlite3
import os
from AddFoundItemPic import *
from AddClaimRequest import *
import base64

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.abspath(__file__))
ITEMS_DB = os.path.join(os.path.dirname(base_dir), 'Databases', 'ItemListings.db')
DATABASE = os.path.join(os.path.dirname(base_dir), 'Databases', 'Accounts.db')

def create_connection():
    conn = None
    try:
        conn = sqlite3.connect(DATABASE)
    except sqlite3.Error as e:
        print(e)
    return conn

def create_connection_items(db_path):
    conn = None
    try:
        conn = sqlite3.connect(db_path)
    except sqlite3.Error as e:
        print(e)
    return conn

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_all_items():
    """Fetch all items from the database."""
    conn = create_connection_items(ITEMS_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM FOUNDITEMS")
    items = cursor.fetchall()
    conn.close()
    return items

def get_item_by_id(item_id):
    """Fetch a single item from the database by its ID."""
    conn = create_connection_items(ITEMS_DB)
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
        
        try:
            insertItem(item_name, color, brand, found_at, turned_in_at, description, file_path)
            
            app.logger.info(f"New item added: {item_name}, {color}, {brand}, {found_at}, {turned_in_at}, {description}")
            app.logger.info(f"Image saved at: {file_path}")
            
            # Remove the file after it's been inserted into the database
            os.remove(file_path)
            
            return jsonify({'message': 'Item added successfully', 'filename': filename}), 200
        except Exception as e:
            app.logger.error(f"Error inserting item: {str(e)}")
            return jsonify({'error': 'Failed to add item to database'}), 500
    
    app.logger.warning("Invalid file type")
    return jsonify({'error': 'Invalid file type'}), 400


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    is_student = data.get('isStudent', False)
    is_staff = data.get('isStaff', False)

    if not email or not password or not name:
        return jsonify({'error': 'Missing required fields'}), 400

    conn = create_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('''
            INSERT INTO UserListing (Email, Password, Name, isStudent, isStaff)
            VALUES (?, ?, ?, ?, ?)
        ''', (email, password, name, int(is_student), int(is_staff)))
        conn.commit()
    except sqlite3.IntegrityError as e:
        return jsonify({'error': 'Email already exists', 'details': str(e)}), 400
    except sqlite3.Error as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM UserListing WHERE Email = ? AND Password = ?
    ''', (email, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({'message': 'Login successful', 'user': {'email': user[1], 'name': user[3], 'isStudent': bool(user[4]), 'isStaff': bool(user[5])}}), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401
    
@app.route('/profile', methods=['GET', 'POST'])
def user_profile():
    if request.method == 'GET':
        email = request.args.get('email')
    else:  # POST
        data = request.json
        email = data.get('email')

    logging.debug(f"Received request for email: {email}")

    if not email:
        logging.error("Email is required but not provided")
        return jsonify({'error': 'Email is required'}), 400

    conn = create_connection()
    cursor = conn.cursor()

    try:
        if request.method == 'GET':
            logging.debug(f"Fetching profile for email: {email}")
            cursor.execute("SELECT Name, Pronouns FROM UserListing WHERE Email = ?", (email,))
            user = cursor.fetchone()
            if user:
                return jsonify({'name': user[0], 'pronouns': user[1]}), 200
            else:
                logging.warning(f"User not found for email: {email}")
                return jsonify({'error': 'User not found'}), 404

        elif request.method == 'POST':
            name = data.get('name')
            pronouns = data.get('pronouns')
            logging.debug(f"Updating profile for email: {email}, name: {name}, pronouns: {pronouns}")
            cursor.execute("UPDATE UserListing SET Name = ?, Pronouns = ? WHERE Email = ?", (name, pronouns, email))
            conn.commit()
            if cursor.rowcount == 0:
                logging.warning(f"No rows updated for email: {email}")
                return jsonify({'error': 'User not found or no changes made'}), 404
            return jsonify({'message': 'Profile updated successfully'}), 200

    except sqlite3.Error as e:
        logging.error(f"Database error: {e}")
        return jsonify({'error': 'Database error occurred'}), 500

    finally:
        conn.close()

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



@app.route('/claim-item', methods=['POST'])
def send_request():
    app.logger.info("Received POST request to /items")
    app.logger.debug(f"Request form data: {request.form}")
    app.logger.debug(f"Request files: {request.files}")

    if 'file' not in request.files:
        app.logger.warning("No image file in request")
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        app.logger.warning("Empty filename")
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Get other form data
        itemid = request.form.get('itemId')
        comments = request.form.get('comments')
        
        try:
            insertclaim(itemid, comments, file_path)
            
            # Remove the file after it's been inserted into the database
            os.remove(file_path)
            
        except Exception as e:
            app.logger.error(f"Error inserting item: {str(e)}")
            return jsonify({'error': 'Failed to add item to database'}), 500
    
    app.logger.warning("Invalid file type")
    return jsonify({'error': 'Invalid file type'}), 400



if __name__ == '__main__':
    if not os.path.exists(os.path.dirname(DATABASE)):
        os.makedirs(os.path.dirname(DATABASE))
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
