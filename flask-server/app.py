import logging
import os
import sqlite3
import base64
import time

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from apscheduler.schedulers.background import BackgroundScheduler
from timeit import default_timer as timer
from apscheduler.triggers.cron import CronTrigger

from database_cleaner import delete_deleted_items
from AddFoundItemPic import *
from AddClaimRequest import *
import base64
from datetime import datetime
# from flask_mail import Mail, Message

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.abspath(__file__))
ITEMS_DB = os.path.join(os.path.dirname(base_dir),
                        'Databases', 'ItemListings.db')
USERS_DB = os.path.join(os.path.dirname(base_dir), 'Databases', 'Accounts.db')
CLAIMS_DB = os.path.join(os.path.dirname(base_dir), 'Databases', 'ClaimRequest.db')

#trying error of no image avail
DEFAULT_IMAGE_PATH = 'uploads/TestImage.png'

# #setting up some mail stuff
# app.config['MAIL_SERVER']='sandbox.smtp.mailtrap.io'
# app.config['MAIL_PORT'] = 2525
# app.config['MAIL_USERNAME'] = 'b12d6e1f84f6ba'
# app.config['MAIL_PASSWORD'] = '1c4c3423a6d643'
# app.config['MAIL_USE_TLS'] = True
# app.config['MAIL_USE_SSL'] = False
# mail = Mail(app)

def create_connection_users():
    conn = None
    try:
        conn = sqlite3.connect(USERS_DB)
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

def get_all_claim_requests():
    """Fetch all claim requests from the ClaimRequest database."""
    conn = create_connection_items(CLAIMS_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM CLAIMREQUETS")
    claim_requests = cursor.fetchall()
    conn.close()
    return claim_requests

def get_found_items_by_ids(item_ids):
    """Fetch found items for a list of item IDs from the FoundItems database."""
    conn = create_connection_items(ITEMS_DB)
    cursor = conn.cursor()
    query = f"SELECT * FROM FOUNDITEMS WHERE ItemID IN ({','.join(['?' for _ in item_ids])})"
    cursor.execute(query, item_ids)
    found_items = cursor.fetchall()
    conn.close()
    return found_items


def clear_deleted_entries():
    app.logger.info(
        f"Clearing deleted items from database at {time.strftime('%Y-%m-%d %H:%M:%S')}")
    start = timer()
    delete_deleted_items(USERS_DB, "UserListing")
    end = timer()
    app.logger.info(f"Clearing deleted users took {end-start}")

    start = timer()
    delete_deleted_items(ITEMS_DB, "FOUNDITEMS")
    end = timer()
    app.logger.info(f"Clearing deleted items took {end-start}")


# initialize scheduler for deleted items clearing task
scheduler = BackgroundScheduler()
cron_trigger = CronTrigger(hour=0, minute=0)
# Runs every sunday at midnight
scheduler.add_job(func=clear_deleted_entries, trigger=cron_trigger)
scheduler.start()


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

@app.route('/lost-item-request', methods=['POST', 'OPTIONS'])
def add_lost_item_request():
    if request.method == 'OPTIONS':
        # Handle preflight request
        return jsonify({'message': 'CORS preflight'}), 200

    app.logger.info("Received POST request to /lost-item-request")
    
    # Ensure it's JSON data we're receiving
    try:
        data = request.get_json()
    except Exception as e:
        app.logger.error(f"Error parsing JSON: {e}")
        return jsonify({'error': 'Invalid data format. JSON expected.'}), 400

    # Log the received data for debugging
    app.logger.debug(f"Data received: {data}")

    # Extract item details
    item_name = data.get('itemName')
    description = data.get('description')
    date_lost = data.get('dateLost')
    location_lost = data.get('locationLost')

    # Check for missing data
    if not item_name or not description or not date_lost or not location_lost:
        app.logger.warning("Missing required fields in request")
        return jsonify({'error': 'All fields are required'}), 400

    try:
        # Connect to LostItemRequest.db
        lost_item_db = os.path.join(os.path.dirname(base_dir), 'databases', 'LostItemRequest.db')
        conn = sqlite3.connect(lost_item_db)
        cursor = conn.cursor()

        # Insert the lost item request into the database
        cursor.execute('''
            INSERT INTO LostItems (ItemName, Description, DateLost, LocationLost)
            VALUES (?, ?, ?, ?)
        ''', (item_name, description, date_lost, location_lost))
        
        conn.commit()
        conn.close()

        app.logger.info(f"Lost item added: {item_name}, {description}, {date_lost}, {location_lost}")
        return jsonify({'message': 'Lost item request added successfully'}), 201
    except sqlite3.Error as e:
        app.logger.error(f"Database error: {e}")
        return jsonify({'error': 'Failed to add lost item request to the database'}), 500


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
            insertItem(item_name, color, brand, found_at, turned_in_at, description, file_path, 1, datetime.today().strftime('%Y-%m-%d'))
            
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
    is_deleted = 0

    if not email or not password or not name:
        return jsonify({'error': 'Missing required fields'}), 400

    conn = create_connection_users()
    cursor = conn.cursor()

    try:
        cursor.execute('''
            INSERT INTO UserListing (Email, Password, Name, isStudent, isStaff, isDeleted)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (email, password, name, int(is_student), int(is_staff), int(is_deleted)))
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

    conn = create_connection_users()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM UserListing WHERE Email = ? AND Password = ? AND isDeleted = 0
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

    conn = create_connection_users()
    cursor = conn.cursor()

    try:
        if request.method == 'GET':
            logging.debug(f"Fetching profile for email: {email}")
            cursor.execute(
                "SELECT Name, Pronouns FROM UserListing WHERE Email = ?", (email,))
            user = cursor.fetchone()
            if user:
                return jsonify({'name': user[0], 'pronouns': user[1]}), 200
            else:
                logging.warning(f"User not found for email: {email}")
                return jsonify({'error': 'User not found'}), 404

        elif request.method == 'POST':
            name = data.get('name')
            pronouns = data.get('pronouns')
            logging.debug(
                f"Updating profile for email: {email}, name: {name}, pronouns: {pronouns}")
            cursor.execute(
                "UPDATE UserListing SET Name = ?, Pronouns = ? WHERE Email = ?", (name, pronouns, email))
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


@app.route('/delete_account', methods=['POST'])
def deleteAcct():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if email:
            conn = create_connection_users()
            cursor = conn.cursor()
            print('274')
            cursor.execute(
                '''SELECT * FROM UserListing WHERE Email = ? AND isDeleted = ?''', (email, 0))
            row = cursor.fetchone()
            if row[2] != password or row is None:
                print("incorrect")
                logging.warning(f"incorrect password for user: {email}")
                return jsonify({'error': 'Incorrect password'}), 401

            cursor.execute(
                "UPDATE UserListing SET isDeleted = 1 WHERE email = '%s'" % (email))
            conn.commit()
            if cursor.rowcount == 0:
                logging.warning(f"No rows updated for email: {email}")
                return jsonify({'error': 'User not found'}), 404

        return jsonify({'success': 'Account deleted successfully'}), 200
    except sqlite3.Error as e:
        logging.error(f"Database error: {e}")
        return jsonify({'error': 'Database error occurred'}), 500

    finally:
        conn.close()


# # endpoint to get all items
# @app.route('/items', methods=['GET'])
# def view_all_items():
#     app.logger.info("Fetching all items")
#     items = get_all_items()
#     items_list = [{
#         'ItemID': item[0],
#         'ItemName': item[1],
#         'Color': item[2],
#         'Brand': item[3],
#         'LocationFound': item[4],
#         'LocationTurnedIn': item[5],
#         'Description': item[6],
#         'ImageURL': base64.b64encode(item[7]).decode('utf-8') if isinstance(item[7], bytes) else item[7]
#     } for item in items]
#     # for image display in frontend: <img src={`data:image/jpeg;base64,${base64ImageData}`} alt="Item" />


#     return jsonify(items_list), 200


# Function to read and encode an image file to base64
def get_image_base64(image_path):
    with open(image_path, 'rb') as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Endpoint to get all items


@ app.route('/items', methods=['GET'])
def view_all_items():
    app.logger.info("Fetching all items")
    items = get_all_items()
    items_list = []

    for item in items:
        if isinstance(item[7], bytes):  # Image exists and is in bytes
            image_data = base64.b64encode(item[7]).decode('utf-8')
        elif item[7] is None:  # Image is NULL or None, use the placeholder
            image_data = get_image_base64(DEFAULT_IMAGE_PATH)
        else:
            image_data = item[7]  # If already in the correct format

        items_list.append({
            'ItemID': item[0],
            'ItemName': item[1],
            'Color': item[2],
            'Brand': item[3],
            'LocationFound': item[4],
            'LocationTurnedIn': item[5],
            'Description': item[6],
            'ImageURL': image_data,
            'ItemStatus': item[9],
            'Date': item[10]
        })

    return jsonify(items_list), 200

# # New endpoint to get a specific item by its ID
# @app.route('/item/<int:item_id>', methods=['GET'])
# def view_item(item_id):
#     app.logger.info(f"Fetching details for item ID: {item_id}")
#     item = get_item_by_id(item_id)

#     if item:
#         item_data = {
#             'ItemID': item[0],
#             'ItemName': item[1],
#             'Color': item[2],
#             'Brand': item[3],
#             'LocationFound': item[4],
#             'LocationTurnedIn': item[5],
#             'Description': item[6],
#             'ImageURL': base64.b64encode(item[7]).decode('utf-8') if isinstance(item[7], bytes) else item[7]
#         }
#         return jsonify(item_data), 200
#     else:
#         app.logger.warning(f"Item with ID {item_id} not found")
#         return jsonify({'error': 'Item not found'}), 404

# New endpoint to get a specific item by its ID


@ app.route('/item/<int:item_id>', methods=['GET'])
def view_item(item_id):
    app.logger.info(f"Fetching details for item ID: {item_id}")
    item = get_item_by_id(item_id)

    if item:
        # Check if the image is bytes, None, or already present in the correct format
        if isinstance(item[7], bytes):  # Image exists and is in bytes
            image_data = base64.b64encode(item[7]).decode('utf-8')
        elif item[7] is None:  # Image is NULL or None, use the placeholder
            image_data = get_image_base64(DEFAULT_IMAGE_PATH)
        else:
            image_data = item[7]  # If already in the correct format

        item_data = {
            'ItemID': item[0],
            'ItemName': item[1],
            'Color': item[2],
            'Brand': item[3],
            'LocationFound': item[4],
            'LocationTurnedIn': item[5],
            'Description': item[6],
            'ImageURL': image_data,
            'Archived': bool(item[8]),
            'ItemStatus': item[9],
            'Date': item[10]
        }
        return jsonify(item_data), 200
    else:
        app.logger.warning(f"Item with ID {item_id} not found")
        return jsonify({'error': 'Item not found'}), 404


# archive item


@ app.route('/item/archive/<int:item_id>', methods=['POST'])
def archive_item_endpoint(item_id):
    try:
        conn = sqlite3.connect(ITEMS_DB)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE FOUNDITEMS SET Archived = 1 WHERE ItemID = ?", (item_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Item archived successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error archiving item: {e}")
        return jsonify({'error': 'Failed to archive item'}), 500

# endpoint to unarchive item


@ app.route('/item/unarchive/<int:item_id>', methods=['POST'])
def unarchive_item_endpoint(item_id):
    try:
        conn = sqlite3.connect(ITEMS_DB)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE FOUNDITEMS SET Archived = 0 WHERE ItemID = ?", (item_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Item unarchived successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error unarchiving item: {e}")
        return jsonify({'error': 'Failed to unarchive item'}), 500


@ app.route('/item/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    app.logger.info(f"Received PUT request to update item {item_id}")

    conn = create_connection_items(ITEMS_DB)
    cursor = conn.cursor()

    try:
        # Fetch the current item data
        cursor.execute("SELECT * FROM FOUNDITEMS WHERE ItemID = ?", (item_id,))
        current_item = cursor.fetchone()

        if not current_item:
            return jsonify({'error': 'Item not found'}), 404

        # Update fields
        item_name = request.form.get('itemName', current_item[1])
        color = request.form.get('color', current_item[2])
        brand = request.form.get('brand', current_item[3])
        found_at = request.form.get('foundAt', current_item[4])
        turned_in_at = request.form.get('turnedInAt', current_item[5])
        description = request.form.get('description', current_item[6])

        # Handle image update
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                image_data = file.read()  # Keep as binary data
            else:
                return jsonify({'error': 'Invalid file type'}), 400
        else:
            # Keep the current image if no new image is provided
            image_data = current_item[7]

        # Update the database
        cursor.execute('''
            UPDATE FOUNDITEMS
            SET ItemName=?, Color=?, Brand=?, LocationFound=?, LocationTurnedIn=?, Description=?, Photo=?
            WHERE ItemID=?
        ''', (item_name, color, brand, found_at, turned_in_at, description, image_data, item_id))

        conn.commit()
        return jsonify({'message': 'Item updated successfully'}), 200

    except Exception as e:
        app.logger.error(f"Error updating item: {str(e)}")
        return jsonify({'error': 'Failed to update item in database'}), 500

    finally:
        cursor.close()
        conn.close()


@ app.route('/claim-item', methods=['POST'])
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
            
            
            
            
            
            # # Sending an email
            # emailstr1 = "Hello there\n\nA new claim request has been submitted and is awaiting review...\n\nItem Id:" + itemid + "\n\nReason Given:" + comments
            # emailstr2 = "\n\nPlease open the portal to accept or deny the claim\n\nThank You!\n~BoilerTrack Devs"
            
            # msg = Message("BoilerTrack: New Claim Request for Review",
            #       sender="boilertrackdevs@mailtrap.io",
            #       recipients=["staff@mailtrap.io"])
            
            # msg.html = f"""
            # <html>
            #     <body>
            #         <p>{emailstr1.replace('\n', '<br>')}</p>
            #         <p>Image uploaded as proof of ownership:</p>
            #         <img src="cid:image1">
            #         <p>{emailstr2.replace('\n', '<br>')}</p>
            #     </body>
            # </html>
            # """
            
            # # Attach the image
            # with open(file_path, 'rb') as fp:
            #     msg.attach("image.jpg", "image/jpeg", fp.read(), headers={'Content-ID': '<image1>'})
            
            # mail.send(msg)
            # app.logger.info("Message sent!")
            
            
            
            
            
            # Remove the file after it's been inserted into the database
            os.remove(file_path)

        except Exception as e:
            app.logger.error(f"Error inserting item: {str(e)}")
            return jsonify({'error': 'Failed to add item to database'}), 500

    app.logger.warning("Invalid file type")
    return jsonify({'error': 'Invalid file type'}), 400

# Endpoint to fetch claim requests and associated item details
@app.route('/claim-requests', methods=['GET'])
def view_claim_requests():
    app.logger.info("Fetching all claim requests")
    claim_requests = get_all_claim_requests()
    app.logger.info(f"Found {len(claim_requests)} claim requests")

    # Extract item IDs from claim requests
    item_ids = [request[0] for request in claim_requests]
    
    # Fetch corresponding found items
    found_items = get_found_items_by_ids(item_ids)

    # Create a map for easy access of found items by their IDs
    found_items_map = {item[0]: item for item in found_items}
    app.logger.info("this was the issue")
    # Combine claim request data with corresponding found item details
    result = []
    for claim in claim_requests:
        item_id = claim[0]
        if item_id in found_items_map:
            found_item = found_items_map[item_id]

            # Handle image encoding or placeholder image
            if isinstance(found_item[7], bytes):
                image_data = base64.b64encode(found_item[7]).decode('utf-8')
            elif found_item[7] is None:
                image_data = get_image_base64(DEFAULT_IMAGE_PATH)
            else:
                image_data = found_item[7]

            result.append({
                'ItemID': claim[0],
                'Comments': claim[1],
                'PhotoProof': base64.b64encode(claim[2]).decode('utf-8') if claim[2] else None,
                'ItemName': found_item[1],
                'Color': found_item[2],
                'Brand': found_item[3],
                'LocationFound': found_item[4],
                'LocationTurnedIn': found_item[5],
                'Description': found_item[6],
                'ImageURL': image_data,
                'ItemStatus': found_item[9],
                'Date': found_item[10]
            })
        else:
            app.logger.warning(f"Item with ID {item_id} not found for claim request ID {claim[0]}")

    return jsonify(result), 200


# Endpoint to fetch found items by list of item IDs
@app.route('/found-items', methods=['POST'])
def view_found_items():
    item_ids = request.json.get('itemIDs', [])
    if not item_ids:
        return jsonify({'error': 'No item IDs provided'}), 400

    app.logger.info(f"Fetching found items for item IDs: {item_ids}")
    found_items = get_found_items_by_ids(item_ids)

    result = []
    for item in found_items:
        if isinstance(item[7], bytes):
            image_data = base64.b64encode(item[7]).decode('utf-8')
        elif item[7] is None:
            image_data = get_image_base64(DEFAULT_IMAGE_PATH)
        else:
            image_data = item[7]

        result.append({
            'ItemID': item[0],
            'ItemName': item[1],
            'Color': item[2],
            'Brand': item[3],
            'LocationFound': item[4],
            'LocationTurnedIn': item[5],
            'Description': item[6],
            'ImageURL': image_data,
            'ItemStatus': item[9],
            'Date': item[10]
        })

    return jsonify(result), 200
    

if __name__ == '__main__':
    if not os.path.exists(os.path.dirname(USERS_DB)):
        os.makedirs(os.path.dirname(USERS_DB))
    os.makedirs(DEFAULT_IMAGE_PATH, exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
