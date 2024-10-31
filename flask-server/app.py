import logging
import os
import sqlite3
import base64
import time
from datetime import datetime
from timeit import default_timer as timer

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from database_cleaner import delete_deleted_items
from AddFoundItemPic import insertItem
from AddClaimRequest import insertclaim


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Store the accoung info in a global var
GLOBAL_USER_EMAIL = ""


# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.abspath(__file__))
db_dir = os.path.join(os.path.dirname(base_dir),
                      'Databases')
ITEMS_DB = os.path.join(db_dir, 'ItemListings.db')
USERS_DB = os.path.join(db_dir, 'Accounts.db')
CLAIMS_DB = os.path.join(db_dir, 'ClaimRequest.db')
PREREG_DB = os.path.join(db_dir, 'ItemListings.db')

# trying error of no image avail
DEFAULT_IMAGE_PATH = 'uploads/TestImage.png'

# setting up some mail stuff
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'shloksbairagi07@gmail.com'
app.config['MAIL_PASSWORD'] = 'hgfi gwtz xtix ndak'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
mail = Mail(app)


def create_connection_users():
    """
    Creates a connection to the SQLite database containing user accounts.

    :return: The database connection object.
    """
    conn = None
    try:
        conn = sqlite3.connect(USERS_DB)
    except sqlite3.Error as e:
        print(e)
    return conn


def create_connection_items(db_path):
    """
    Creates a connection to the SQLite database containing item listings.

    :param db_path: The path to the SQLite database file.
    :return: The database connection object.
    """
    conn = None
    try:
        conn = sqlite3.connect(db_path)
    except sqlite3.Error as e:
        print(e)
    return conn


def allowed_file(filename):
    """
    Checks if the provided filename has an extension that is in the ALLOWED_EXTENSIONS set.

    :param filename: The name of the file to check.
    :return: True if the file's extension is allowed, False otherwise.
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_all_claim_requests():
    """Fetch all claim requests from the ClaimRequest database."""
    conn = create_connection_items(CLAIMS_DB)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM CLAIMREQUETS WHERE UserEmail = ?", (GLOBAL_USER_EMAIL,))
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


def get_all_pre_registered_items():
    """Fetch all pre-registered items from the database."""
    conn = create_connection_items(PREREG_DB)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM PREREGISTERED WHERE UserEmail = ?", (GLOBAL_USER_EMAIL,))
    pre_registered_items = cursor.fetchall()
    conn.close()
    return pre_registered_items


def clear_deleted_entries():
    """
    Clears deleted entries from the Users and FoundItems databases.

    This function removes any records marked as deleted in both the user listings
    and found items tables. It logs the start and end time of each operation for
    debugging purposes.
    """
    app.logger.info(
        "Clearing deleted items from database at %s", time.strftime('%Y-%m-%d %H:%M:%S'))
    start = timer()
    delete_deleted_items(USERS_DB, "UserListing")
    end = timer()
    app.logger.info("Clearing deleted users took %.2f seconds", (end-start))

    start = timer()
    delete_deleted_items(ITEMS_DB, "FOUNDITEMS")
    end = timer()
    app.logger.info("Clearing deleted items took %.2f seconds", (end - start))


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


# Do not put app routes above this line
# _______________________________________________________________________________


@ app.route('/')
def home():
    """
    Home route for the application.

    Logs a message when accessed and returns a welcome message.

    :return: A JSON response with a welcome message.
    """
    app.logger.info("Accessed root route")
    return jsonify({"message": "Welcome to the Lost and Found API"}), 200


@ app.route('/pre-registered-items', methods=['GET'])
def get_pre_registered_items():
    """
    Fetches pre-registered items for the user.

    This function retrieves all pre-registered items associated with a specific
    email address and formats them into a JSON response. It handles image data
    such as Photo and QR code images, converting binary data to base64 strings.

    :return: A JSON response containing details of the pre-registered items.
    """
    app.logger.info(
        "Fetching pre-registered items for email: %(gu_email)s", {"gu_email": GLOBAL_USER_EMAIL})

    # Ensure the email is provided
    if not GLOBAL_USER_EMAIL:
        return jsonify({'error': 'No user email provided'}), 400

    pre_registered_items = get_all_pre_registered_items()
    app.logger.info("Found %s pre-registered items", len(pre_registered_items))

    # Prepare the result to be returned as JSON
    result = []

    for item in pre_registered_items:
        # Handle image encoding for both Photo and QR code images
        if isinstance(item[5], bytes):  # Photo exists and is in bytes
            photo_data = base64.b64encode(item[5]).decode('utf-8')
        elif item[5] is None:  # Photo is NULL or None, use the placeholder
            photo_data = get_image_base64(DEFAULT_IMAGE_PATH)
        else:
            photo_data = item[5]

        if isinstance(item[7], bytes):  # QR code image exists and is in bytes
            qr_code_data = base64.b64encode(item[7]).decode('utf-8')
        elif item[7] is None:  # QR code is NULL or None, use the placeholder
            qr_code_data = get_image_base64(DEFAULT_IMAGE_PATH)
        else:
            qr_code_data = item[7]

        # Append item details to the result list
        result.append({
            'pre_reg_item_id': item[0],
            'ItemName': item[1],
            'Color': item[2],
            'Brand': item[3],
            'Description': item[4],
            'Photo': photo_data,
            'Date': item[6],
            'QRCodeImage': qr_code_data,
            'UserEmail': item[8]  # Assuming email is the 8th column
        })

    return jsonify(result), 200


@ app.route('/lost-item-request', methods=['POST', 'OPTIONS'])
def add_lost_item_request():
    """
    Adds a lost item request to the database.

    This function handles both POST and OPTIONS requests. For POST, it adds
    a new lost item request to the LostItemRequest.db database after validating
    that all required fields are present in the JSON data received from the client.
    For OPTIONS, it returns a CORS preflight response with a 200 status code.

    :return: A JSON response indicating success or failure of the operation.
    """
    if request.method == 'OPTIONS':
        # Handle preflight request
        return jsonify({'message': 'CORS preflight'}), 200

    app.logger.info("Received POST request to /lost-item-request")

    # Ensure it's JSON data we're receiving
    try:
        data = request.get_json()
    except Exception as e:
        app.logger.error("Error parsing JSON: %s", e)
        return jsonify({'error': 'Invalid data format. JSON expected.'}), 400

    # Log the received data for debugging
    app.logger.debug("Data received: %s", data)

    # Extract item details
    item_name = data.get('itemName')
    description = data.get('description')
    date_lost = data.get('dateLost')
    location_lost = data.get('locationLost')
    user_email = GLOBAL_USER_EMAIL

    # Check for missing data
    if not item_name or not description or not date_lost or not location_lost or not user_email:
        app.logger.warning("Missing required fields in request")
        return jsonify({'error': 'All fields are required'}), 400

    try:
        # Connect to LostItemRequest.db
        lost_item_db = os.path.join(os.path.dirname(
            base_dir), 'databases', 'LostItemRequest.db')
        conn = sqlite3.connect(lost_item_db)
        cursor = conn.cursor()

        # Insert the lost item request into the database
        cursor.execute('''
            INSERT INTO LostItems (ItemName, Description, DateLost, LocationLost, userEmail, ItemMatchID)
            VALUES (?, ?, ?, ?, ?, -1)
        ''', (item_name, description, date_lost, location_lost, user_email))

        conn.commit()
        conn.close()

        app.logger.info(
            f"Lost item added by {user_email}: {item_name}, {description}, {date_lost}, {location_lost}")

        return jsonify({'message': 'Lost item request added successfully'}), 201
    except sqlite3.Error as e:
        app.logger.error("Database error: %s", e)
        return jsonify({'error': 'Failed to add lost item request to the database'}), 500


@ app.route('/lost-item-requests', methods=['GET'])
def get_lost_item_requests():
    global GLOBAL_USER_EMAIL  # Assuming this stores the current user's email
    # this variable is not assigned
    user_email = GLOBAL_USER_EMAIL

    # Check if the user email is set
    if not user_email:
        return jsonify({'error': 'User email not set'}), 400

    # Connect to the LostItemRequest.db database
    lost_item_db = os.path.join(os.path.dirname(
        base_dir), 'databases', 'LostItemRequest.db')
    conn = sqlite3.connect(lost_item_db)
    cursor = conn.cursor()

    # Query for lost items based on user email
    cursor.execute(
        "SELECT ItemID, ItemName, Description, DateLost, LocationLost, status, ItemMatchID FROM LostItems WHERE userEmail = ?", (user_email,))
    items = cursor.fetchall()

    # Close the database connection
    conn.close()

    # Convert the results to a list of dictionaries
    items_list = [{
        'ItemID': item[0],
        'ItemName': item[1],
        'Description': item[2],
        'DateLost': item[3],
        'LocationLost': item[4],
        'status': item[5],
        'ItemMatchID': item[6]
    } for item in items]

    # Return the items as JSON
    return jsonify(items_list), 200


@ app.route('/lost-item/<int:item_id>', methods=['GET'])
def get_lost_item(item_id):
    try:
        # Connect to the LostItemRequest.db database
        lost_item_db = os.path.join(os.path.dirname(
            base_dir), 'databases', 'LostItemRequest.db')
        conn = sqlite3.connect(lost_item_db)
        cursor = conn.cursor()

        # Fetch the item from the LostItems table
        cursor.execute("SELECT * FROM LostItems WHERE ItemID = ?", (item_id,))
        item = cursor.fetchone()

        conn.close()

        if item:
            # Assuming the columns in the LostItems table are (ItemID, ItemName, Description, DateLost, LocationLost)
            item_data = {
                'ItemID': item[0],
                'ItemName': item[1],
                'Description': item[2],
                'DateLost': item[3],
                'LocationLost': item[4]
            }
            return jsonify(item_data), 200
        else:
            return jsonify({'error': 'Item not found'}), 404
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500


@ app.route('/lost-item/<int:item_id>', methods=['PUT'])
def update_lost_item(item_id):
    data = request.get_json()  # Get the JSON data from the request

    # Validate the input data
    if not data or not data.get('itemName') or not data.get('description') or not data.get('dateLost') or not data.get('locationLost'):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Connect to the LostItemRequest.db database
        lost_item_db = os.path.join(os.path.dirname(
            base_dir), 'databases', 'LostItemRequest.db')
        conn = sqlite3.connect(lost_item_db)
        cursor = conn.cursor()

        # Update the item in the LostItems table based on the itemId
        cursor.execute('''
            UPDATE LostItems
            SET ItemName = ?, Description = ?, DateLost = ?, LocationLost = ?
            WHERE ItemID = ?
        ''', (data['itemName'], data['description'], data['dateLost'], data['locationLost'], item_id))

        conn.commit()  # Commit the changes
        conn.close()   # Close the database connection

        return jsonify({'message': 'Lost item request updated successfully'}), 200
    except sqlite3.Error as e:
        return jsonify({'error': f'Failed to update lost item request in the database: {str(e)}'}), 500


@app.route('/check-lost-item-request', methods=['POST'])
def check_lost_item_request():
    data = request.get_json()

    # Extract item details from the request
    item_name = data.get('itemName')
    description = data.get('description')
    # Assuming `foundAt` is equivalent to `LocationLost`
    location_lost = data.get('foundAt')
    found_item_id = data.get('foundItemId')

    # Connect to LostItemRequest.db
    lost_item_db = os.path.join(os.path.dirname(
        base_dir), 'databases', 'LostItemRequest.db')
    conn = sqlite3.connect(lost_item_db)
    cursor = conn.cursor()

    # Query to find a matching item in the LostItems table
    cursor.execute("""
        SELECT ItemID FROM LostItems
        WHERE ItemName = ? AND Description = ? AND LocationLost = ? AND status = 'pending'
    """, (item_name, description, location_lost))

    matching_item = cursor.fetchone()

    if matching_item:
        matching_item_id = matching_item[0]

        # Update status to "in review" and set ItemMatchID for the matched item
        cursor.execute("""
            UPDATE LostItems
            SET status = 'in review', ItemMatchID = ?
            WHERE ItemID = ?
        """, (found_item_id, matching_item_id))
        conn.commit()

        conn.close()
        # Return matching_item_id to the frontend for further processing
        return jsonify({'matchFound': True, 'message': 'Matching lost item found and updated to "in review".', 'matchingItemId': matching_item_id}), 200
    else:
        conn.close()
        return jsonify({'matchFound': False, 'message': 'No matching lost item request found.'}), 200


@app.route('/update-item-match', methods=['PUT'])
def update_item_match():
    data = request.get_json()
    matching_item_id = data.get('matchingItemId')
    found_item_id = data.get('foundItemId')

    # Connect to LostItemRequest.db
    lost_item_db = os.path.join(os.path.dirname(
        base_dir), 'databases', 'LostItemRequest.db')
    conn = sqlite3.connect(lost_item_db)
    cursor = conn.cursor()

    # Update the ItemMatchID for the matched item
    cursor.execute("""
        UPDATE LostItems
        SET ItemMatchID = ?
        WHERE ItemID = ?
    """, (found_item_id, matching_item_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'ItemMatchID updated successfully'}), 200


@ app.route('/items', methods=['POST'])
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
            new_item_id = insertItem(item_name, color, brand, found_at, turned_in_at,
                                     description, file_path, 1, datetime.today().strftime('%Y-%m-%d'))

            app.logger.info(
                f"New item added: {item_name}, {color}, {brand}, {found_at}, {turned_in_at}, {description}")
            app.logger.info(f"Image saved at: {file_path}")

            # Remove the file after it's been inserted into the database
            os.remove(file_path)

            return jsonify({'message': 'Item added successfully', 'filename': filename, 'ItemID': new_item_id}), 200
        except Exception as e:
            app.logger.error(f"Error inserting item: {str(e)}")
            return jsonify({'error': 'Failed to add item to database'}), 500

    app.logger.warning("Invalid file type")
    return jsonify({'error': 'Invalid file type'}), 400


@ app.route('/signup', methods=['POST'])
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


@ app.route('/login', methods=['POST'])
def login():
    global GLOBAL_USER_EMAIL

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    GLOBAL_USER_EMAIL = email

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


@ app.route('/profile', methods=['GET', 'POST'])
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


@ app.route('/reset_password', methods=['POST'])
def password_reset():
    """
    Resets a user's password by verifying the old password and updating it with a new one.

    The function first checks if an email is provided. If not, it returns an error.
    Then, it verifies that the old password matches the one stored in the database for the given email.
    If correct, the new password is set. Otherwise, appropriate errors are returned.
    In case of success, a confirmation message is returned.

    :return: JSON response indicating success or failure
    """
    try:
        data = request.get_json()
        email = data.get('email')
        old_password = data.get('oldPassword')

        conn = create_connection_users()
        cursor = conn.cursor()

        if old_password == '':
            # TODO do the stuff for email reset
            '''procedure should be: send email with token, store token in db with a creation timestamp,
            update schedlued task to delete the token if the timestamp is > 24hours old
            add a new function to handle the reset with the token.'''
            return jsonify({'server error': 'unimplemented'}), 501
        if email:

            cursor.execute(
                '''SELECT * FROM UserListing WHERE Email = ? AND isDeleted = ?''',
                (email, 0)
            )
            row = cursor.fetchone()
            if row is None:
                logging.warning(f"User not found: {email}")
                return jsonify({'error': 'User Not Found'}), 404
            if row[2] != old_password:
                logging.warning(f"Incorrect password for user: {email}")
                print("db: {}, old: {}".format(
                    row[2], old_password))
                return jsonify({'error': 'Incorrect Password'}), 401
            new_password = data.get('newPassword')
            cursor.execute(
                '''UPDATE UserListing SET password = ? WHERE Email = ?''',
                (new_password, email)
            )
            conn.commit()
            return jsonify({'success': 'Password reset successfully'}), 200
        else:
            return jsonify({'error': 'Email not provided'}), 400
    except sqlite3.Error as e:
        logging.error(f"Database error: {e}")
        return jsonify({'error': 'Database error occurred'}), 500
    finally:
        conn.close()


@ app.route('/delete_account', methods=['POST'])
def delete_acct():
    """
    Deletes a user's account by verifying the email and password provided.

    The function first checks if an email is provided. If not, it returns an error.
    It then verifies that the password matches the one stored in the database for the given email.
    If correct, the user's 'isDeleted' field is set to 1, marking the account as deleted.
    Otherwise, appropriate errors are returned.
    In case of success, a confirmation message is returned.

    :return: JSON response indicating success or failure
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if email:
            conn = create_connection_users()
            cursor = conn.cursor()

            cursor.execute(
                '''SELECT * FROM UserListing WHERE Email = ? AND isDeleted = ?''', (email, 0))
            row = cursor.fetchone()
            if row is None:
                logging.warning(f"User not found: {email}")
                return jsonify({'error': 'Incorrect password'}), 404
            if row[2] != password:
                logging.warning(f"Incorrect password for user: {email}")
                return jsonify({'error': 'Incorrect password'}), 401

            cursor.execute(
                "UPDATE UserListing SET isDeleted = 1 WHERE email = ?", (email,))
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

    print(GLOBAL_USER_EMAIL)

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

        item = get_item_by_id(itemid)
        staffemail = item[5] + "@googlemail.com"
        status = 1

        try:
            insertclaim(itemid, comments, file_path, GLOBAL_USER_EMAIL, status)

            # Sending an email
            emailstr1 = f"Hello there<br><br>A new claim request has been submitted and is awaiting review...<br><br>Item Id: {itemid}<br><br>Reason Given: {comments}"
            emailstr2 = f"<br><br>Please open the portal to check status of the claim<br><br>Thank You!<br>~BoilerTrack Devs"

            msg = Message("BoilerTrack: New Claim Request for Review",
                          sender="shloksbairagi07@gmail.com",
                          recipients=[GLOBAL_USER_EMAIL, staffemail])

            msg.html = """
            <html>
                <body>
                    <p>{}</p>
                    <p>Image uploaded as proof of ownership:</p>
                    <img src="cid:image1">
                    <p>{}</p>
                </body>
            </html>
            """.format(emailstr1.replace('\n', '<br>'), emailstr2.replace('\n', '<br>'))

            # Attach the image
            with open(file_path, 'rb') as fp:
                msg.attach("image.jpg", "image/jpeg", fp.read(),
                           headers={'Content-ID': '<image1>'})

            mail.send(msg)
            app.logger.info("Message sent!")

            # Remove the file after it's been inserted into the database
            os.remove(file_path)

        except Exception as e:
            app.logger.error(f"Error inserting item: {str(e)}")
            return jsonify({'error': 'Failed to add item to database'}), 500

    app.logger.warning("Invalid file type")
    return jsonify({'error': 'Invalid file type'}), 400

# Endpoint to fetch claim requests and associated item details


@ app.route('/claim-requests', methods=['GET'])
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
            app.logger.warning(
                f"Item with ID {item_id} not found for claim request ID {claim[0]}")

    return jsonify(result), 200


# Endpoint to fetch found items by list of item IDs
@ app.route('/found-items', methods=['POST'])
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


def get_all_claimrequests_staff():
    """Fetch all claim requests from the ClaimRequest database."""
    conn = create_connection_items(CLAIMS_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM CLAIMREQUETS")
    claim_requests = cursor.fetchall()
    conn.close()
    return claim_requests


def get_claim_by_id(item_id):
    """Fetch a single item from the database by its ID."""
    conn = create_connection_items(CLAIMS_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM CLAIMREQUETS WHERE ItemID = ?", (item_id,))
    claim_request = cursor.fetchone()
    conn.close()
    return claim_request


@ app.route('/allclaim-requests-staff', methods=['GET'])
def view_all_requests():
    app.logger.info("Fetching all claims")
    claims = get_all_claimrequests_staff()
    claims_list = []

    for item in claims:

        if isinstance(item[2], bytes):  # Photo exists and is in bytes
            photo_data = base64.b64encode(item[2]).decode('utf-8')
        elif item[2] is None:  # Photo is NULL or None, use the placeholder
            photo_data = get_image_base64(DEFAULT_IMAGE_PATH)
        else:
            photo_data = item[2]

        item_deets = get_item_by_id(item[0])

        claims_list.append({
            'ItemID': item[0],
            'Comments': item[1],
            'PhotoProof': photo_data,
            'UserEmail': item[3],
            'ClaimStatus': item[4],
            'ItemName': item_deets[1],
            'LocationTurnedIn': item_deets[5]
        })

    return jsonify(claims_list), 200


@ app.route('/individual-request-staff/<int:item_id>', methods=['GET'])
def view_claim(item_id):
    app.logger.info("Fetching details for claim for item ID: %(item_id)s", {
                    'item_id': item_id})
    claim = get_claim_by_id(item_id)
    item = get_item_by_id(item_id)

    if claim:
        # Check if the image is bytes, None, or already present in the correct format
        if isinstance(claim[2], bytes):  # Image exists and is in bytes
            image_data = base64.b64encode(claim[2]).decode('utf-8')
        elif claim[2] is None:  # Image is NULL or None, use the placeholder
            image_data = get_image_base64(DEFAULT_IMAGE_PATH)
        else:
            image_data = claim[2]  # If already in the correct format

        claim_data = {
            'ItemID': item[0],
            'ItemName': item[1],
            'LocationTurnedIn': item[5],
            'Comments': claim[1],
            'UserEmail': claim[3],
            'PhotoProof': image_data
        }
        return jsonify(claim_data), 200
    else:
        app.logger.warning("Claim with ID %(item_id)s not found", {
                           "item_id": item_id})
        return jsonify({'error': 'Item not found'}), 404


@app.route('/individual-request-staff/<int:claim_id>/approve', methods=['POST'])
def approve_claim(claim_id):
    conn = create_connection_items(CLAIMS_DB)
    cursor = conn.cursor()
    claim = get_claim_by_id(claim_id)
    itemid = claim[0]
    item = get_item_by_id(itemid)
    location = item[5]
    name = item[1]
    claimed_email = claim[3]
    try:
        # Update claim status to 'approved'
        cursor.execute(
            "UPDATE CLAIMREQUETS SET ClaimStatus = 2 WHERE ItemID = ?", (claim_id,))

        # Remove the claim from the claim requests table
        #cursor.execute(
            #"DELETE FROM CLAIMREQUETS WHERE ItemID = ?", (claim_id,))

        conn.commit()
        conn.close()

        emailstr1 = f"Hello there<br><br>Your claim request has been approved<br><br>Item Id: {itemid}<br><br>"
        emailstr2 = f"Come pick up the {name} at {location} and bring your student ID"
        emailstr3 = f"<br><br>Thank You!<br>~BoilerTrack Devs"

        msg = Message("BoilerTrack: Claim Request Accepted",
                        sender="shloksbairagi07@gmail.com",
                        recipients=[claimed_email])

        msg.html = """
        <html>
            <body>
                <p>{}</p>
                <p>{}</p>
                <p>{}</p>
            </body>
        </html>
        """.format(emailstr1.replace('\n', '<br>'), emailstr2.replace('\n', '<br>'), emailstr3.replace('\n', '<br>'))

        mail.send(msg)
        app.logger.info("Message sent!")

        return jsonify({'message': 'Claim approved and item removed successfully'}), 200
    except sqlite3.Error:
        return jsonify({'error': 'Failed to approve claim and remove item'}), 500
    finally:
        conn.close()

# Route to reject a claim request


@app.route('/individual-request-staff/<int:claim_id>/reject', methods=['POST'])
def reject_claim(claim_id):
    # Get the rationale from the request
    rationale = request.json.get('rationale', '')
    conn = create_connection_items(CLAIMS_DB)
    cursor = conn.cursor()
    claim = get_claim_by_id(claim_id)
    itemid = claim[0]
    item = get_item_by_id(itemid)
    name = item[1]
    claimed_email = claim[3]
    try:
        # Update claim status to 'rejected' and store the rationale
        cursor.execute(
            "UPDATE CLAIMREQUETS SET ClaimStatus = 3, RejectRationale = ? WHERE ItemID = ?", (rationale, claim_id))

        # cursor.execute("DELETE FROM CLAIMREQUETS WHERE ItemID = ?", (claim_id,))
        conn.commit()

        emailstr1 = f"Hello there<br><br>Your claim request has been rejected<br><br>Item Id: {itemid}<br><br>"
        emailstr2 = f"Here is why your request for the {name} was rejected: <br><br> {rationale}"
        emailstr3 = f"<br><br>Thank You!<br>~BoilerTrack Devs"

        msg = Message("BoilerTrack: Claim Request Rejected",
                        sender="shloksbairagi07@gmail.com",
                        recipients=[claimed_email])

        msg.html = """
        <html>
            <body>
                <p>{}</p>
                <p>{}</p>
                <p>{}</p>
            </body>
        </html>
        """.format(emailstr1.replace('\n', '<br>'), emailstr2.replace('\n', '<br>'), emailstr3.replace('\n', '<br>'))

        mail.send(msg)
        app.logger.info("Message sent!")

        return jsonify({'message': 'Claim rejected and rationale saved'}), 200
    except sqlite3.Error:
        return jsonify({'error': 'Failed to reject claim and save rationale'}), 500
    finally:
        conn.close()


if __name__ == '__main__':
    if not os.path.exists(os.path.dirname(USERS_DB)):
        os.makedirs(os.path.dirname(USERS_DB))
    # os.makedirs(DEFAULT_IMAGE_PATH, exist_ok=True)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
