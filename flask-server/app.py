import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import sqlite3
import os
from AddFoundItemPic import *

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(base_dir, '../Databases/Accounts.db')

def create_connection():
    conn = None
    try:
        conn = sqlite3.connect(DATABASE)
    except sqlite3.Error as e:
        print(e)
    return conn

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
        
        # ADD Code here to delete the recently uploaded pic coz its already in the db
        # Do this after - Shlok
        # os.remove(file_path)
        
        return jsonify({'message': 'Item added successfully', 'filename': filename}), 200
    
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

if __name__ == '__main__':
    if not os.path.exists(os.path.dirname(DATABASE)):
        os.makedirs(os.path.dirname(DATABASE))
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)