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
    """This function takes an image path, validates it, and returns a list of keywords
     returns a tuple with a list of keywords, a logo, and 0 if successful, 1 if cached, and 2 if there was an error
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


def get_sorted_descriptions(keywords: List[Dict[str, float]]) -> List[str]:
    # Sort the keywords by score in descending order and extract descriptions
    sorted_keywords = sorted(keywords, key=lambda x: x['score'], reverse=True)
    descriptions = [keyword['description'] for keyword in sorted_keywords]
    return descriptions


def parse_logos(raw: str) -> List[Dict[str, float]]:
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


def get_sorted_logos(logos: List[Dict[str, float]]) -> List[str]:
    # Sort the logos by score in descending order and extract descriptions
    sorted_logos = sorted(logos, key=lambda x: x['score'], reverse=True)
    descriptions = [logo['description'] for logo in sorted_logos]
    return descriptions


if __name__ == '__main__':
    print(image_keywords(image_path='uploads/HyFbottle.jpg'))
