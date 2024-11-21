"""
Main file for the boilertrack backend
"""
import logging
import os
import sqlite3
import base64
import time
import difflib
from datetime import datetime
from timeit import default_timer as timer
from uuid import uuid4


from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from PreregistedItemsdb import insert_preregistered_item

from database_cleaner import delete_deleted_items
from AddFoundItemPic import insertItem
from AddClaimRequest import insertclaim
from keyword_gen import image_keywords, parse_keywords, get_sorted_descriptions_or_logos, parse_logos


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Store the accoung info in a global var
GLOBAL_USER_EMAIL = ""


# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.abspath(__file__))
db_dir = os.path.join(os.path.dirname(base_dir), 'databases')
ITEMS_DB = os.path.join(db_dir, 'ItemListings.db')
USERS_DB = os.path.join(db_dir, 'Accounts.db')
CLAIMS_DB = os.path.join(db_dir, 'ClaimRequest.db')
PREREG_DB = os.path.join(db_dir, 'ItemListings.db')
PROCESSED_CLAIMS_DB = os.path.join(db_dir, 'ProcessedClaims.db')
DISPUTES_DB = os.path.join(db_dir, 'ItemListings.db')
FEEDBACK_DB = os.path.join(db_dir, 'feedback.db')
KEYWORD_CACHE = os.path.join(db_dir, 'keyword-gen-cache.db')
LOST_ITEMS_DB = os.path.join(db_dir, 'LostItemRequest.db')

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


def send_mail(message_pairs: list[tuple[str, str]], subject: str):
    """
    Sends emails to users if they are in the database.

    Args:
        message_pairs (list[tuple[str, str]]): A list of tuples where each tuple contains a recipient email and the corresponding message to send.
        subject (str): The subject of the email.

    Returns:
        None

    Raises:
        None
    """
    num_send = len(message_pairs)

    with app.app_context():
        app.logger.info("Sending %d emails to users at %s",
                        num_send, time.strftime('%Y-%m-%d %H:%M:%S'))

        i = 1

        for recipient, message in message_pairs:

            try:
                msg = Message(subject=subject,
                              sender=app.config['MAIL_USERNAME'],
                              recipients=[recipient])
                msg.html = message
                mail.send(msg)
                app.logger.info('Sent %d of %d emails', i, num_send)
                i += 1
            except Exception as e:
                app.logger.error("Failed to send email to %s: %s",
                                 recipient, str(e))
            # sleep for potential rate limit reasons
            time.sleep(10)


def send_reminders():
    """
    Sends reminser email to staff that don't disable it to transfer items to the central lost and found
    """
    # get all users who have not disabled reminders
    conn = create_connection_users()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM UserListing WHERE isStaff=1 AND wantsReminders=1 AND isDeleted=0")
    rows = cur.fetchall()
    emails = [row[1] for row in rows]
    names = [row[3].split()[0] for row in rows]
    desks = [row[10].split()[0] if row != "NULL" else None for row in rows]

    if len(emails) == 0:
        app.logger.info("No staff with enabled reminders to send emails to")
    subj = "BoilerTrack reminder: Please transfer items to the central lost and found"
    mail_pairs: list[tuple[str, str]] = []
    for _, (email, name, desk) in enumerate(zip(emails, names, desks)):
        message: str = ""
        if desk is not None:
            message = f"Hello there, {name}!<br> <br > It's 5pm: you know what that means!<br> Since you are assigned to the help desk at {desk}, were are reminding you that it is time to transfer items to the central lost and found.<br><br>Best,<br>The BoilerTrack Team<br><br><span style='font-size: 0.6em'>To disable email reminders, TODO < /span >"
        else:
            message = f"Hello there, {name}!<br> <br > It's 5pm: you know what that means!<br> Time to transfer items to the central lost and found.<br><br>Best,<br>The BoilerTrack Team<br><br><span style='font-size: 0.6em'>To disable email reminders, TODO < /span >"
        html_message = f"<html><body>{message}</body></html>"
        mail_pairs.append((email, html_message))
    send_mail(mail_pairs, subj)


# initialize scheduler for deleted items clearing task
scheduler = BackgroundScheduler()
# Runs every sunday at midnight
cron_trigger = CronTrigger(day_of_week="sun", hour=0, minute=0)
scheduler.add_job(func=clear_deleted_entries, trigger=cron_trigger)
# TODO uncomment when in prod
# cron_trigger2 = CronTrigger(day_of_week="mon,wed,fri", hour=5, minute=0)
# scheduler.add_job(func=send_reminders, trigger=cron_trigger2)
scheduler.start()
# currently times depend on the tz of the server, so we may need to change it if the docker is utc like mine


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


@ app.route('/preregister-item', methods=['POST'])
def preregister_item():
    try:
        # Get the form data from the request
        item_name = request.form.get('ItemName')
        color = request.form.get('Color')
        brand = request.form.get('Brand')
        description = request.form.get('Description')
        date = request.form.get('Date')
        user_email = request.form.get('UserEmail')

        # Set default QR code path
        qr_code_path = 'uploads/care.png'

        # Check if the photo file is provided and save it
        photo = request.files.get('Photo')
        if photo and photo.filename:
            filename = secure_filename(photo.filename)
            photo_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            photo.save(photo_path)
        else:
            pass

        # Insert the item into the database
        insert_preregistered_item(
            item_name, color, brand, description, photo_path, date, qr_code_path, user_email)

        return jsonify({"message": "Pre-registered item added successfully"}), 201

    except Exception as e:
        app.logger.error(f"Error adding pre-registered item: {e}")
        return jsonify({"error": "Failed to add pre-registered item"}), 500


@app.route("/found-items", methods=["GET"])
def fetch_all_items():
    items = get_all_items()
    # Convert the list of tuples into a list of dictionaries for JSON response
    items_dict = [
        {
            "ItemID": item[0],
            "ItemName": item[1],
            "Color": item[2],
            "Brand": item[3],
            "LocationFound": item[4],
            "LocationTurnedIn": item[5],
            "Description": item[6]
        }
        for item in items
    ]
    return jsonify(items_dict)


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
    data = request.get_json(silent=True)
    print(f"data: {data}")
    if data is None:
        app.logger.error("Invalid JSON data format.")
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
            "Lost item added by %(user_email)s: %(item_name)s, %(description)s, %(date_lost)s, %(location_lost)s",
            {"user_email": user_email, "item_name": item_name, "description": description,
                "date_lost": date_lost, "location_lost": location_lost}
        )

        return jsonify({'message': 'Lost item request added successfully'}), 201
    except sqlite3.Error as e:
        app.logger.error("Database error: %s", e)
        return jsonify({'error': 'Failed to add lost item request to the database'}), 500


@ app.route('/delete-lost-item/<int:item_id>', methods=['DELETE'])
def delete_lost_item(item_id):
    try:
        # Connect to the LostItemRequest.db database
        lost_item_db = os.path.join(os.path.dirname(
            base_dir), 'databases', 'LostItemRequest.db')
        conn = sqlite3.connect(lost_item_db)
        cursor = conn.cursor()

        # Delete the item from the LostItems table
        cursor.execute("DELETE FROM LostItems WHERE ItemID = ?", (item_id,))
        conn.commit()
        conn.close()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Lost item request not found'}), 404

        return jsonify({'message': 'Lost item request deleted successfully'}), 200
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500


@ app.route('/lost-item-requests', methods=['GET'])
def get_lost_item_requests():

    # data = request.get_json()

    # email: str = data['userEmail']
    # print(data)

    user_email = GLOBAL_USER_EMAIL  # Assuming this stores the current user's email

    # Check if the user email is set
    if not user_email:  # or not email:
        return jsonify({'error': 'User email not set'}), 400

    # Connect to the LostItemRequest.db database
    lost_item_db = os.path.join(os.path.dirname(
        base_dir), 'databases', 'LostItemRequest.db')
    # check if the user is staff
    conn = create_connection_users()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT isStaff FROM UserListing WHERE email=?", (user_email,))
    is_staff = cursor.fetchone()[0]
    print(is_staff)
    if is_staff:
        # get all lost items
        conn = sqlite3.connect(lost_item_db)
        cursor = conn.cursor()
        # get all lost items
        cursor.execute("SELECT * FROM lostItems")
        items = cursor.fetchall()
        conn.close()
        items_list = [{
            'ItemID': item[0],
            'ItemName': item[1],
            'Description': item[2],
            'DateLost': item[3],
            'LocationLost': item[4],
            'userEmail': item[5],
            'status': item[6],
            'ItemMatchID': item[7]
        }for item in items]
        return jsonify(items_list)

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

        conn = sqlite3.connect(LOST_ITEMS_DB)
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


@ app.route('/toggle-status/<int:item_id>', methods=['PUT'])
def toggle_status(item_id):
    data = request.get_json()
    new_status = data.get('status')

    if not new_status:
        return jsonify({'error': 'New status not provided'}), 400

    # Connect to LostItemRequest.db

    conn = sqlite3.connect(LOST_ITEMS_DB)
    cursor = conn.cursor()

    try:
        # Update the status of the lost item request
        cursor.execute("""
            UPDATE LostItems
            SET status = ?
            WHERE ItemID = ?
        """, (new_status, item_id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Item not found'}), 404

        return jsonify({'message': f'Status updated to "{new_status}".'}), 200
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        conn.close()


@ app.route('/check-lost-item-request', methods=['POST'])
def check_lost_item_request():
    data = request.get_json()

    # Extract item details from the request
    item_name = data.get('itemName')
    description = data.get('description')
    # Assuming `foundAt` is equivalent to `LocationFound`
    location_found = data.get('foundAt')
    found_item_id = data.get('foundItemId')

    # Connect to LostItemRequest.db

    conn = sqlite3.connect(LOST_ITEMS_DB)
    cursor = conn.cursor()

    # Query to find potential matches in the LostItems table
    cursor.execute("""
        SELECT ItemID, ItemName, Description, LocationLost
        FROM LostItems
        WHERE status = 'pending'
    """)
    potential_matches = cursor.fetchall()

    matching_item_id = None
    for lost_item in potential_matches:
        lost_item_id, lost_item_name, lost_item_description, location_lost = lost_item

        if item_name.lower() == lost_item_name.lower() and location_found.lower() == location_lost.lower():
            # Exact match on ItemName and Location
            matching_item_id = lost_item_id
            break
        elif item_name.lower() == lost_item_name.lower() and location_found.lower() != location_lost.lower():
            # Check for description similarity
            similarity_ratio = difflib.SequenceMatcher(
                None, description.lower(), lost_item_description.lower()).ratio()
            if similarity_ratio >= 0.5:  # 50% similarity threshold
                matching_item_id = lost_item_id
                break

    if matching_item_id:
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


@ app.route('/update-item-match', methods=['PUT'])
def update_item_match():
    data = request.get_json()
    matching_item_id = data.get('matchingItemId')
    found_item_id = data.get('foundItemId')

    # Connect to LostItemRequest.db
    conn = sqlite3.connect(LOST_ITEMS_DB)
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


@ app.route('/keyword-gen', methods=['POST'])
def get_keywords():

    # username = request.form.get('email')
    # password = request.form.get('password')

    # print("username:", username)
    # print("password:", password)

    # conn = create_connection_users()
    # if not conn:
    #     return jsonify({'error': 'Failed to connect to database'}), 500
    # cur = conn.cursor()

    # cur.execute('''
    #     SELECT * FROM UserListing WHERE Email = ? AND Password = ? AND isDeleted = 0
    # ''', (username, password))

    # row = cur.fetchone()
    # conn.close()
    # if row is None:
    #     return jsonify({'error': 'Invalid username or password'}), 401

    if 'image' not in request.files:
        app.logger.warning("keyword-gen: no image in request")
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    if file.filename == '':
        app.logger.warning("keyword-gen: empty file name provided")
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'Unsupported file type.'}), 400

    try:
        # Example: save the file temporarily, or process it further
        file.save(os.path.join(UPLOAD_FOLDER, file.filename))
        keywords_raw, logos_raw, status = image_keywords(
            os.path.join(UPLOAD_FOLDER, file.filename))

        keywords = parse_keywords(keywords_raw)
        keywords_sorted_by_desc = get_sorted_descriptions_or_logos(keywords)
        string_keywords = ', '.join(keywords_sorted_by_desc)

        logos = parse_logos(logos_raw)
        logos_sorted_by_desc = get_sorted_descriptions_or_logos(logos)
        string_logos = ', '.join(logos_sorted_by_desc)

        return jsonify({'keywords': keywords_sorted_by_desc, 'logos': logos}), 200

    except IOError:
        app.logger.error("keyword-gen: File saving failed due to IOError")
        return jsonify({'error': 'File saving failed'}), 500
    except Exception as e:
        app.logger.error(f"keyword-gen: Unexpected error occurred: {str(e)}")
        return jsonify({'error': 'Unexpected error occurred'}), 500


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
        email: str = data.get('email')
        old_password = data.get('oldPassword')
        token = data.get('token')

        conn = create_connection_users()
        cursor = conn.cursor()

        if token:
            # check if the email is in the second table, and if the timestamp is less than 24 hours old
            cursor.execute(
                '''SELECT * FROM reset_tokens WHERE user_email = ?''', (email,))
            row = cursor.fetchone()
            dbtime = float(row[2])
            if not row:
                return jsonify({'error': 'User not found'}), 404
            print(type(datetime.now()), dbtime)
            print((datetime.now().timestamp() - dbtime)/3600)
            if 1 < (datetime.now().timestamp() - dbtime) / 3600:
                return jsonify({'error': 'Token expired'}), 401

            if token != row[1]:
                return jsonify({'error': 'Invalid token'}), 401
            new_password = data.get('newPassword')
            cursor.execute('''UPDATE UserListing SET password = ? WHERE Email = ?''',
                           (new_password, email))
            conn.commit()
            return jsonify({'success': 'Password reset successfully'}), 200

        if not old_password:

            rand_tok = str(uuid4())
            timestamp = datetime.now().timestamp()

            cursor.execute('''
                SELECT * FROM UserListing WHERE email = ? AND isDeleted = 0;''', (email,))
            row = cursor.fetchone()
            if not row:
                # returning success even if user not found for ✨security reasons✨
                return jsonify({'success': 'email sent'}), 200

            cursor.execute(
                "INSERT INTO reset_tokens (user_email, token, timestamp) VALUES (?, ?, ?)", (email, rand_tok, timestamp))
            conn.commit()
            logging.info("token inserted for user %(email)s", {'email': email})
            # Sending an email
            emailstr1 = f"Hello there!<br><br>A new new token has been generated for your recent password reset request:<br><br>Token: {rand_tok}<br>User email: {email}"
            emailstr2 = "<br><br>It will be valid for 24 hours, so please use it to reset your password before then.<br><br>Thank You!<br>~BoilerTrack Devs"

            msg = Message("BoilerTrack: Password Reset Request",
                          sender="shloksbairagi07@gmail.com",
                          recipients=[email])

            msg.html = """
            <html>
                <body>
                    <p>{}</p>
                    <p>{}</p>
                </body>
            </html>
            """.format(emailstr1.replace('\n', '<br>'), emailstr2.replace('\n', '<br>'))

            mail.send(msg)
            app.logger.info("Message sent!")

            return jsonify({"success": "email sent"}), 200

        if email:
            cursor.execute(
                '''SELECT * FROM UserListing WHERE Email = ? AND isDeleted = ?''',
                (email, 0)
            )
            row = cursor.fetchone()
            if row is None:
                logging.warning("User not found: %(email)s", {'email': email})
                return jsonify({'error': 'User Not Found'}), 404
            if row[2] != old_password:
                logging.warning(
                    "Incorrect password for user: %(email)s", {'email': email})

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
        logging.error("Database error: %s",  e)
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
                logging.warning("User not found: %(email)s", {'email': email})
                return jsonify({'error': 'Incorrect password'}), 404
            if row[2] != password:
                logging.warning(
                    "Incorrect password for user: %(email)s", {'email': email})
                return jsonify({'error': 'Incorrect password'}), 401

            cursor.execute(
                "UPDATE UserListing SET isDeleted = 1 WHERE email = ?", (email,))
            conn.commit()
            if cursor.rowcount == 0:
                logging.warning(
                    "No rows updated for email: %(email)s", {'email': email})
                return jsonify({'error': 'User not found'}), 404

        return jsonify({'success': 'Account deleted successfully'}), 200
    except sqlite3.Error as e:
        logging.error("Database error: %(err)s)", {'err': e})
        return jsonify({'error': 'Database error occurred'}), 500

    finally:
        conn.close()


def get_image_base64(image_path):
    """
    Reads an image file from the specified path and encodes it to a base64 string.

    Parameters:
    image_path (str): The file path to the image that needs to be encoded.

    Returns:
    str: The base64 encoded string representation of the image.
    """
    with open(image_path, 'rb') as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Endpoint to get all items


@app.route('/items', methods=['GET'])
def view_all_items():
    """
    Fetches all items from the database and returns them as a JSON response.

    This endpoint retrieves all items stored in the database. For each item, it checks if the image is stored in bytes format or if it is None.
    If the image is in bytes, it encodes the image to a base64 string. If the image is None, it uses a default placeholder image. Otherwise, it assumes the image is already in the correct format.

    Returns:
        A JSON response containing a list of items, where each item is represented as a dictionary with the following keys:
        - ItemID: The unique identifier of the item.
        - ItemName: The name of the item.
        - Color: The color of the item.
        - Brand: The brand of the item.
        - LocationFound: The location where the item was found.
        - LocationTurnedIn: The location where the item was turned in.
        - Description: A description of the item.
        - ImageURL: The base64-encoded image data or a default image URL.
        - ItemStatus: The status of the item (e.g., found, returned).
        - Date: The date when the item was added to the database.

    Status Codes:
        200: OK - The request was successful and items are returned.
    """
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


@ app.route('/get-user-email', methods=['GET'])
def get_user_email():
    '''returns the user email'''
    return jsonify({"user_email": GLOBAL_USER_EMAIL}), 200


def get_all_claimrequests_staff():
    """Fetch all claim requests from the ClaimRequest database."""
    conn = create_connection_items(CLAIMS_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM CLAIMREQUETS WHERE ClaimStatus = 1")
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


def get_all_claimrequests_student(email):
    """Fetch all claim requests from the ClaimRequest database by email"""
    conn = create_connection_items(CLAIMS_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM CLAIMREQUETS WHERE UserEmail = ?", (email,))
    claim_requests = cursor.fetchall()
    conn.close()
    return claim_requests


@ app.route('/allclaim-requests-student/<string:emailId>', methods=['GET'])
def view_all_requests_student(emailId):
    app.logger.info("Fetching all claims")
    claims = get_all_claimrequests_student(emailId)
    claims_list = []

    for item in claims:

        if isinstance(item[2], bytes):  # Photo exists and is in bytes
            photo_data = base64.b64encode(item[2]).decode('utf-8')
        elif item[2] is None:  # Photo is NULL or None, use the placeholder
            photo_data = get_image_base64(DEFAULT_IMAGE_PATH)
        else:
            photo_data = item[2]

        item_deets = get_item_by_id(item[0])

        status = "NA"
        if (item[4] == 2):
            status = "Acepted"
        elif (item[4] == 3):
            status = "Rejected"
        else:
            status = "Pending"

        claims_list.append({
            'ItemID': item[0],
            'Comments': item[1],
            'PhotoProof': photo_data,
            'ClaimStatus': status,
            'ItemName': item_deets[1],
            'LocationTurnedIn': item_deets[5]
        })

    return jsonify(claims_list), 200


def update_claim(claim_id, comments, file_path):
    conn = create_connection_items(CLAIMS_DB)
    cursor = conn.cursor()
    cursor.execute("UPDATE CLAIMREQUETS SET Comments = ?, PhotoProof = ?, ClaimStatus = 1 WHERE ItemID = ?",
                   (comments, file_path, claim_id))
    conn.commit()
    conn.close()


@ app.route('/claim-modify-student/<int:claim_id>', methods=['PUT'])
def modify_claim(claim_id):
    app.logger.info(f"Received modify request for claim ID: {claim_id}")
    if 'file' not in request.files and 'comments' not in request.form:
        app.logger.warning("No file or comments provided in request")
        return jsonify({'error': 'No file or comments provided'}), 400

    file = request.files.get('file', None)
    comments = request.form.get('comments', None)

    file_path = None
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        app.logger.info(f"File saved to {file_path}")

    with open(file_path, 'rb') as file:
        blob_data = file.read()

    claimer = get_claim_by_id(claim_id)
    if claimer[4] == 2:
        return jsonify({'error': 'This item has already been claimed'}), 500

    try:
        update_claim(claim_id, comments, blob_data)

        itemz = get_item_by_id(claim_id)
        staffemail = itemz[5] + "@googlemail.com"

        # Sending an email
        emailstr1 = f"Hello there<br><br>A modified claim request has been submitted and is awaiting review...<br><br>Item Id: {claim_id}<br><br>Reason Given: {comments}"
        emailstr2 = f"<br><br>Please open the portal to check status of the claim<br><br>Thank You!<br>~BoilerTrack Devs"

        msg = Message("BoilerTrack: Modified Claim Request for Review",
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

        if file_path:
            os.remove(file_path)  # Remove the uploaded file

        return jsonify({'success': 'Claim modified successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error modifying claim: {str(e)}")
        return jsonify({'error': 'Failed to modify claim'}), 500


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
            'PhotoProof': image_data,
            'ClaimStatus': claim[4],
            'RejectRationale': claim[5]
        }
        return jsonify(claim_data), 200
    else:
        app.logger.warning("Claim with ID %(item_id)s not found", {
                           "item_id": item_id})
        return jsonify({'error': 'Item not found'}), 404


@ app.route('/individual-request-staff/<int:claim_id>/approve', methods=['POST'])
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
        # cursor.execute(
        # "DELETE FROM CLAIMREQUETS WHERE ItemID = ?", (claim_id,))

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


@ app.route('/get-processed-claims', methods=['GET'])
def get_processed_claims():
    conn = create_connection_items(PROCESSED_CLAIMS_DB)
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM RELEASED')
        processed_claims = cursor.fetchall()
        conn.close()

        if processed_claims:
            processed_claims_list = [
                {
                    'ClaimID': claim[0],
                    'DateClaimed': claim[1],
                    'UserEmailID': claim[2],
                    'StaffName': claim[3],
                    'StudentID': claim[4]
                }
                for claim in processed_claims
            ]
            return jsonify(processed_claims_list), 200
        else:
            return jsonify([]), 200
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        conn.close()


@ app.route('/get-processed-claim/<int:claim_id>', methods=['GET'])
def get_processed_claim(claim_id):
    conn = create_connection_items(PROCESSED_CLAIMS_DB)
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM RELEASED WHERE ClaimID = ?', (claim_id,))
        processed_claim = cursor.fetchone()
        if processed_claim:
            processed_claim_data = {
                'ClaimID': processed_claim[0],
                'DateClaimed': processed_claim[1],
                'UserEmailID': processed_claim[2],
                'StaffName': processed_claim[3],
                'StudentID': processed_claim[4]
            }
            return jsonify(processed_claim_data), 200
        else:
            return jsonify({'error': 'Processed claim not found'}), 404
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        conn.close()


@ app.route('/edit-processed-claim/<int:claim_id>', methods=['PUT'])
def edit_processed_claim(claim_id):
    data = request.json
    date_claimed = data.get('dateClaimed')
    user_email_id = data.get('userEmailID')
    staff_name = data.get('staffName')
    student_id = data.get('studentID')

    conn = create_connection_items(PROCESSED_CLAIMS_DB)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE RELEASED
            SET DateClaimed = ?, UserEmailID = ?, StaffName = ?, StudentID = ?
            WHERE ClaimID = ?
        ''', (date_claimed, user_email_id, staff_name, student_id, claim_id))

        if cursor.rowcount == 0:
            return jsonify({'error': 'Processed claim not found or no changes made'}), 404

        conn.commit()
        return jsonify({'message': 'Processed claim updated successfully'}), 200
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        conn.close()


@ app.route('/get-release-form/<int:claim_id>', methods=['GET'])
def get_release_form(claim_id):
    conn = create_connection_items(PROCESSED_CLAIMS_DB)
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM RELEASED WHERE ClaimID = ?', (claim_id,))
        release_form = cursor.fetchone()
        if release_form:
            release_data = {
                'ClaimID': release_form[0],
                'DateClaimed': release_form[1],
                'UserEmailID': release_form[2],
                'StaffName': release_form[3],
                'StudentID': release_form[4]
            }
            return jsonify(release_data), 200
        else:
            return jsonify({'error': 'Release form not found'}), 404
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        conn.close()

# @app.route('/update-release-form/<int:claim_id>', methods=['PUT'])
# def update_release_form(claim_id):
#     data = request.json
#     date_claimed = data.get('dateClaimed')
#     user_email_id = data.get('userEmailID')
#     staff_name = data.get('staffName')
#     student_id = data.get('studentID')

#     conn = create_connection_processed_claims()
#     cursor = conn.cursor()
#     try:
#         cursor.execute('''
#             UPDATE RELEASED
#             SET DateClaimed = ?, UserEmailID = ?, StaffName = ?, StudentID = ?
#             WHERE ClaimID = ?
#         ''', (date_claimed, user_email_id, staff_name, student_id, claim_id))

#         if cursor.rowcount == 0:
#             return jsonify({'error': 'Release form not found or no changes made'}), 404

#         conn.commit()
#         return jsonify({'message': 'Release form updated successfully'}), 200
#     except sqlite3.Error as e:
#         return jsonify({'error': f'Database error: {str(e)}'}), 500
#     finally:
#         conn.close()
# Route to reject a claim request


@ app.route('/submit-release-form', methods=['POST'])
def submit_release_form():

    data = request.json
    claim_id = data.get('claimId')
    date_claimed = data.get('dateClaimed')
    user_email_id = data.get('userEmailID')
    staff_name = data.get('staffName')
    student_id = data.get('studentID')

    conn = create_connection_items(PROCESSED_CLAIMS_DB)
    cursor = conn.cursor()

    # Create the RELEASED table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS RELEASED (
            ClaimID INTEGER,
            DateClaimed TEXT,
            UserEmailID TEXT,
            StaffName TEXT,
            StudentID TEXT
        )
    ''')

    # get item details from claimID = ItemID
    # get item_name color, brand, descroption, photo, (current_date), (qr_code = "uploads/care.png"), user_email = user_email_id and then
    # insert_preregistered_item(item_name, color, brand, description, photo, date, qr_code, user_email):

    # pre register item here
    # get item deials from claimID which is itemID

    try:
        cursor.execute('''
            INSERT INTO RELEASED (ClaimID, DateClaimed, UserEmailID, StaffName, StudentID)
            VALUES (?, ?, ?, ?, ?)
        ''', (claim_id, date_claimed, user_email_id, staff_name, student_id))

        conn.commit()
        item_conn = create_connection_items(ITEMS_DB)
        item_cursor = item_conn.cursor()
        item_cursor.execute('''
            SELECT ItemName, Color, Brand, Description, Photo
            FROM FOUNDITEMS
            WHERE ItemID = ?
        ''', (claim_id,))

        item = item_cursor.fetchone()
        if item:
            item_name, color, brand, description, photo = item
            if photo is None:
                image_data = DEFAULT_IMAGE_PATH
            else:
                image_data = photo
            current_date = date_claimed  # Use the provided `date_claimed` for date
            qr_code = "uploads/care.png"  # Default QR code path

            # Call the `insertPreRegisteredItem` function to insert the item into the PREREGISTERED table
            insert_preregistered_item(
                item_name, color, brand, description, image_data, current_date, qr_code, user_email_id)

            return jsonify({'message': 'Release form data submitted and item added to preregistered successfully'}), 201
        else:
            return jsonify({'error': 'Item not found in FOUNDITEMS table'}), 404
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()
        if item_conn:
            item_conn.close()


@ app.route('/individual-request-staff/<int:claim_id>/reject', methods=['POST'])
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


@ app.route('/individual-request-staff/<int:claim_id>/request-more-info', methods=['POST'])
def reject_claim_more_info(claim_id):
    rationale = 'Please provide more information.'
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


@ app.route('/dispute-claim/<int:item_id>', methods=['POST'])
def dispute_claim(item_id):
    try:
        # Connect to the disputes database
        conn = sqlite3.connect(DISPUTES_DB)
        cursor = conn.cursor()

        # Fetch the user who initially claimed the item from CLAIMREQUETS
        claims_conn = sqlite3.connect(CLAIMS_DB)
        claims_cursor = claims_conn.cursor()
        claims_cursor.execute(
            "SELECT UserEmail FROM CLAIMREQUETS WHERE ItemID = ?", (item_id,))
        claimed_by = claims_cursor.fetchone()
        claims_conn.close()

        # Check if the item was claimed
        if not claimed_by:
            return jsonify({"error": "No claim found for this item ID"}), 404

        # The user submitting the dispute
        dispute_by = GLOBAL_USER_EMAIL

        # Get the form data
        reason = request.form.get('reason')
        additional_comments = request.form.get('notes')

        # Check if dispute photo is provided and convert it to binary data
        dispute_photo = request.files.get('file')
        if dispute_photo and dispute_photo.filename:
            # Save the file to the uploads folder
            filename = secure_filename(dispute_photo.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            dispute_photo.save(file_path)

            # Convert image to binary data
            with open(file_path, 'rb') as file:
                image_data = file.read()

        else:
            return jsonify({"error": "Dispute photo proof is required"}), 400

        # SQL to insert data into ClaimDisputes table
        insert_query = """
            INSERT INTO ClaimDisputes (ItemID, ClaimedBy, DisputeBy, Reason, AdditionalComments, DisputePhotoProof)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        # Data to be inserted
        data_tuple = (
            item_id, claimed_by[0], dispute_by, reason, additional_comments, image_data)

        # Execute the insert query
        cursor.execute(insert_query, data_tuple)
        conn.commit()

        return jsonify({"message": "Dispute claim submitted successfully"}), 201

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to submit dispute claim"}), 500

    finally:
        if conn:
            conn.close()


@ app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = create_connection_items(ITEMS_DB)
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT CategoryName, ItemCount FROM CATEGORIES ORDER BY ItemCount DESC")
        cursor.execute(
            "SELECT CategoryName, ItemCount FROM CATEGORIES ORDER BY ItemCount DESC")
        categories = cursor.fetchall()
        categories_list = [
            {"CategoryName": row[0], "ItemCount": row[1]} for row in categories
        ]
        return jsonify(categories_list), 200
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/staff-analytics', methods=['GET'])
def get_staff_analytics():
    """
    Retrieve staff analytics data, including the count of claimed and unclaimed items,
    the most frequent missing locations, and the most common categories.

    Returns:
        A JSON response containing:
        - claimedCount: Number of items that have been claimed.
        - unclaimedCount: Number of items that have not been claimed.
        - missingLocations: A list of the top 5 most frequent locations where items were found.
        - commonCategories: A list of the top 5 most common item categories.
    """
    conn = create_connection_items(ITEMS_DB)
    cursor = conn.cursor()
    try:
        # Count claimed items
        # Assuming 1 = claimed
        cursor.execute("SELECT COUNT(*) FROM FOUNDITEMS WHERE ItemStatus = 3")
        claimed_count = cursor.fetchone()[0]

        # Count unclaimed items
        # Assuming 0 = unclaimed
        cursor.execute("SELECT COUNT(*) FROM FOUNDITEMS WHERE ItemStatus = 1")
        unclaimed_count = cursor.fetchone()[0]

        # Most frequent missing locations
        cursor.execute("""
            SELECT LocationFound, COUNT(*) as Count
            FROM FOUNDITEMS
            GROUP BY LocationFound
            ORDER BY Count DESC
            LIMIT 5
        """)
        missing_locations = [{"Location": row[0], "Count": row[1]}
                             for row in cursor.fetchall()]
        # Most common categories
        cursor.execute("""
            SELECT CategoryName, ItemCount
            FROM CATEGORIES
            ORDER BY ItemCount DESC
            LIMIT 5
        """)
        common_categories = [{"CategoryName": row[0],
                              "ItemCount": row[1]} for row in cursor.fetchall()]
        analytics_data = {
            "claimedCount": claimed_count,
            "unclaimedCount": unclaimed_count,
            "missingLocations": missing_locations,
            "commonCategories": common_categories
        }

        return jsonify(analytics_data), 200
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


def create_connection_staff():
    """
    Creates a connection to the staff database.

    Returns:
        sqlite3.Connection: A connection object to the SQLite staff database.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, '../databases/StaffAccounts.db')
    conn = sqlite3.connect(db_path)
    return conn


@ app.route('/api/staff/signup', methods=['POST'])
def staff_signup():
    """
    Sign up a new staff member.

    This endpoint allows a new staff member to register by providing their
    email, password, name, and building department. Upon successful registration,
    the staff account will be created and will await approval.

    Request Body:
        - email (str): The staff member's email address.
        - password (str): The staff member's password.
        - name (str): The staff member's name.
        - buildingDept (str): The staff member's building department.

    Returns:
        - 201 OK: If the account is created successfully.
        - 400 Bad Request: If required fields are missing or if the email already exists.
        - 500 Internal Server Error: If a database error occurs.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    building_dept = data.get('buildingDept')

    if not email or not password or not name or not building_dept:
        return jsonify({'error': 'Missing required fields'}), 400

    conn = create_connection_staff()
    cursor = conn.cursor()

    try:
        cursor.execute('''
            INSERT INTO StaffListing (Email, Password, Name, Dept, isApproved)
            VALUES (?, ?, ?, ?, 0)
        ''', (email, password, name, building_dept))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Account created successfully. Awaiting approval.'}), 201


@ app.route('/api/staff/login', methods=['POST'])
def staff_login():
    """
    Logs in a staff member.

    This endpoint allows a staff member to log in by providing their
    email, password, and building department. The login is successful only
    if the account is approved.

    Request Body:
        - email (str): The staff member's email address.
        - password (str): The staff member's password.
        - buildingDept (str): The staff member's building department.

    Returns:
        - 200 OK: If the login is successful and the account is approved.
        - 400 Bad Request: If required fields are missing.
        - 401 Unauthorized: If the credentials are invalid.
        - 403 Forbidden: If the account is not approved yet.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    building_dept = data.get('buildingDept')

    if not email or not password or not building_dept:
        return jsonify({'error': 'Missing required fields'}), 400

    conn = create_connection_staff()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT StaffID, isApproved FROM StaffListing
        WHERE Email = ? AND Password = ? AND Dept = ?
    ''', (email, password, building_dept))
    user = cursor.fetchone()
    conn.close()

    if user:
        staff_id, is_approved = user
        if is_approved:
            return jsonify({'message': 'Login successful', 'isApproved': is_approved}), 200
        else:
            return jsonify({'error': 'Account not approved yet.'}), 403
    else:
        return jsonify({'error': 'Invalid credentials.'}), 401


@app.route('/feedback', methods=['POST'])
def submit_feedback():
    """
    Submits feedback from a logged-in user.

    This endpoint allows a logged-in user to submit feedback by providing
    a description. The feedback is associated with the user's email.

    Request Body:
        - description (str): The feedback description provided by the user.

    Returns:
        - 201 Created: If the feedback is submitted successfully.
        - 400 Bad Request: If the feedback description is missing.
        - 500 Internal Server Error: If there is an error submitting feedback.
    """
    data = request.get_json()
    description = data.get('description', '')

    if not description:
        return jsonify({'error': 'Feedback description is required'}), 400

    try:
        conn = sqlite3.connect(FEEDBACK_DB)
        cursor = conn.cursor()

        # Insert feedback with the logged-in user's email
        cursor.execute('''
            INSERT INTO Feedback (Description, UserEmail) VALUES (?, ?)
        ''', (description, GLOBAL_USER_EMAIL))

        conn.commit()
        conn.close()
        return jsonify({'message': 'Feedback submitted successfully'}), 201

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'Failed to submit feedback'}), 500


@app.route('/feedback/user', methods=['GET'])
def get_user_feedback():
    """
    Retrieves feedback for the logged-in user.

    This endpoint allows a logged-in user to retrieve their feedback submissions.
    Each feedback item contains an identifier, the description provided by the user,
    and the timestamp at which the feedback was submitted.

    Returns:
        - 200 OK: A list of feedback items for the logged-in user.
        - 500 Internal Server Error: If there is an error fetching the user feedback.
    """
    try:
        conn = sqlite3.connect(FEEDBACK_DB)
        cursor = conn.cursor()

        # Retrieve feedback for the logged-in user
        cursor.execute('''
            SELECT FeedbackID, Description, SubmittedAt FROM Feedback WHERE UserEmail = ?
        ''', (GLOBAL_USER_EMAIL,))

        feedback_list = cursor.fetchall()
        conn.close()

        return jsonify([
            {"FeedbackID": row[0], "Description": row[1],
                "SubmittedAt": row[2]}
            for row in feedback_list
        ]), 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'Failed to fetch user feedback'}), 500


@app.route('/feedback/all', methods=['GET'])
def get_all_feedback():
    """
    Retrieves all feedback entries.

    This endpoint allows authorized users to fetch all feedback entries in the system.
    Each feedback item contains an identifier, the description provided by the user,
    the timestamp at which the feedback was submitted, and the user's email.

    Returns:
        - 200 OK: A list of all feedback items.
        - 500 Internal Server Error: If there is an error fetching all feedback.
    """
    try:
        conn = sqlite3.connect(FEEDBACK_DB)
        cursor = conn.cursor()

        # Retrieve all feedback entries
        cursor.execute('''
            SELECT FeedbackID, Description, SubmittedAt, UserEmail FROM Feedback
        ''')

        feedback_list = cursor.fetchall()
        conn.close()

        return jsonify([
            {"FeedbackID": row[0], "Description": row[1],
                "SubmittedAt": row[2], "UserEmail": row[3]}
            for row in feedback_list
        ]), 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'Failed to fetch all feedback'}), 500


if __name__ == '__main__':
    if not os.path.exists(os.path.dirname(USERS_DB)):
        os.makedirs(os.path.dirname(USERS_DB))
    # os.makedirs(DEFAULT_IMAGE_PATH, exist_ok=True)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
