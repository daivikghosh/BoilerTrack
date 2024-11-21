import os
import sqlite3
import re
from hashlib import sha512
from typing import List, Dict

from google.cloud import vision


base_dir = os.path.dirname(os.path.abspath(__file__))
db_dir = os.path.join(os.path.dirname(base_dir), 'databases')
KEYWORD_CACHE = os.path.join(db_dir, 'keyword-gen-cache.db')


def detect_logos(path: str):
    """Detects logos in the file."""

    client = vision.ImageAnnotatorClient()

    with open(path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.logo_detection(image=image)
    logos = response.logo_annotations
    out = []
    for logo in logos:
        out.append(logo)

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(
                response.error.message)
        )
    return out


def detect_labels(path: str):
    """Detects labels in the file."""

    client = vision.ImageAnnotatorClient()

    with open(path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    # if pylint complains, ignore the error
    response = client.label_detection(image=image)
    labels = response.label_annotations

    out = []
    for label in labels:
        out.append(label)

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(
                response.error.message)
        )
    return out


def image_keywords(image_path: str = None, want_keywords: bool = True, want_logo: bool = True):
    """
    This function takes an image path, validates it, and returns a tuple containing:
    - A list of keywords (if requested)
    - A list of logos (if requested)
    - An integer indicating the status of the operation:
        - 0 if the keywords and logos were generated successfully and not cached
        - 1 if the keywords and logos were retrieved from the cache
        - 2 if there was an error during the process

    Parameters:
    - image_path (str): The path to the image file. If None, the function will raise an error.
    - want_keywords (bool): If True, the function will attempt to detect and return keywords from the image.
    - want_logo (bool): If True, the function will attempt to detect and return logos from the image.

    Returns:
    - tuple: A tuple containing the list of keywords, list of logos, and the status code.
    """
    # print("path: " + image_path)
    # validate the file exists
    if os.path.exists(image_path):
        pass
    else:
        return "File not found or invalid path."
    # compute the hash for the file
    with open(image_path, "rb") as image_file:
        content = image_file.read()

    im_hash = sha512(content)
    # check the database for if we've already generated keywords for this image
    conn = sqlite3.connect(KEYWORD_CACHE)
    cursor = conn.cursor()

    cursor.execute('''SELECT * from images WHERE hash=?;''',
                   (im_hash.hexdigest(),))
    row = cursor.fetchone()
    if row is not None:
        # return the data from the cache if it was processed, and indicate we did so
        if want_keywords and want_logo:
            return (row[2], row[3], 1)
        elif want_keywords and not want_logo:
            return (row[2], "", 1)
        elif want_logo and not want_keywords:
            return ("", row[3], 1)
        else:
            return ("", "", 1)

    else:
        keywords = ""
        logos = ""
        # send the image to the google api for keyword generation
        try:
            if image_path:
                keywords = detect_labels(image_path)
                logos = detect_logos(image_path)
            # cache the stuff
            cursor.execute('''INSERT INTO images ('image-name', 'hash', 'gapi-response-labels', 'gapi-response-logos') VALUES (?,?,?,?)''',
                           (str(os.path.basename(image_path)), im_hash.hexdigest(), ", ".join(str(k) for k in keywords), ", ".join(str(l) for l in logos)),)
            conn.commit()
            conn.close()
            return (keywords, logos, 0)

        except Exception as e:
            print(e)
            return ("", "", 2)


def parse_keywords(raw: str) -> List[Dict[str, float]]:
    """
    Parse a raw string containing keyword entries into a list of dictionaries.

    Each entry in the raw string is expected to be a keyword with a description and a score, 
    formatted as follows:
    - description: "some description"
    - score: some_score

    The entries are separated by ', ' and the description and score are separated by newline characters.

    Args:
        raw (str): A string containing the raw keyword entries.

    Returns:
        List[Dict[str, float]]: A list of dictionaries, where each dictionary contains a 'description'
                                and a 'score' key with corresponding values.
    """
    # Split the raw string by ', ' to separate each keyword entry
    entries = raw.split(', ')
    keywords = []

    for entry in entries:
        # Split each entry by newline characters to separate lines
        lines = entry.strip().split('\n')
        description = None
        score = None

        for line in lines:
            # Extract the description and score using regular expressions
            if line.startswith('description:'):
                description = re.search(r'"(.*?)"', line).group(1)
            elif line.startswith('score:'):
                score = float(line.split(': ')[1])

        if description is not None and score is not None:
            keywords.append({'description': description, 'score': score})

    return keywords


def parse_logos(raw: str) -> List[Dict[str, float]]:
    """
    Parses a raw string containing logo descriptions and their scores, and returns a list of dictionaries.

    Each entry in the raw string is expected to be separated by '} }'. Within each entry, the description and score
    are extracted using regular expressions. The function assumes that each entry has a 'description:' and a 'score:'
    line.

    Parameters:
    raw (str): A raw string containing logo descriptions and their scores.

    Returns:
    List[Dict[str, float]]: A list of dictionaries where each dictionary contains a 'description' key with a string value
                            and a 'score' key with a float value.
    """
    # Split the raw string by '} }' to separate each logo entry
    entries = raw.split('} }')
    logos = []

    for entry in entries:
        # Split each entry by newline characters to separate lines
        lines = entry.strip().split('\n')
        description = None
        score = None

        for line in lines:
            # Extract the description and score using regular expressions
            if line.startswith('description:'):
                description = re.search(r'"(.*?)"', line).group(1)
            elif line.startswith('score:'):
                score = float(line.split(': ')[1])

        if description is not None and score is not None:
            logos.append({'description': description, 'score': score})

    return logos


def get_sorted_descriptions_or_logos(items: List[Dict[str, float]]) -> List[str]:
    """
    Sorts a list of items by their 'score' in descending order and returns a list of their 'description'.

    Parameters:
    items (List[Dict[str, float]]): A list of dictionaries, where each dictionary contains at least a 'score' key
                                    and a 'description' key with corresponding float and string values, respectively.

    Returns:
    List[str]: A list of descriptions sorted by the corresponding scores in descending order.
    """
    # Sort the items by score in descending order and extract descriptions
    sorted_items = sorted(items, key=lambda x: x['score'], reverse=True)
    descriptions = [item['description'] for item in sorted_items]
    return descriptions


if __name__ == '__main__':
    print(image_keywords(image_path='uploads/HyFbottle.jpg'))
