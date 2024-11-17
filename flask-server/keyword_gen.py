import os
import sqlite3
from hashlib import sha512

from app import KEYWORD_CACHE
from google.cloud import vision


def detect_logos_bytes(im_bytes: bytes):
    client = vision.ImageAnnotatorClient()

    image = vision.Image(content=im_bytes)

    response = client.logo_detection(image=image)
    logos = response.logo_annotations

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(
                response.error.message)
        )
    return logos


def detect_logos(path: str):
    """Detects logos in the file."""

    client = vision.ImageAnnotatorClient()

    with open(path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.logo_detection(image=image)
    logos = response.logo_annotations

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(
                response.error.message)
        )
    return logos


def detect_labels_bytes(im_bytes: bytes):
    """Detects labels in the file."""

    client = vision.ImageAnnotatorClient()

    image = vision.Image(content=im_bytes)

    response = client.label_detection(image=image)
    labels = response.label_annotations

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(
                response.error.message)
        )
    return labels


def detect_labels(path: str):
    """Detects labels in the file."""

    client = vision.ImageAnnotatorClient()

    with open(path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.label_detection(image=image)
    labels = response.label_annotations

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(
                response.error.message)
        )
    return labels


def image_keywords(image_path: str = None, image_bytes: bytes = None, want_keywords: bool = True, want_logo: bool = True):
    """This function takes an image path, validates it, and returns a list of keywords
     returns a tuple with a list of keywords, a logo, and 0 if successful, 1 if cached, and 2 if there was an error
      """
    # validate the file exists
    if os.path.exists(image_path):
        pass
    else:
        return "File not found or invalid path."
    # compute the hash for the file
    content: bytes = None
    if image_bytes is None:
        with open(image_path, "rb") as image_file:
            content = image_file.read()
    else:
        content = image_bytes
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
            else:
                keywords = detect_labels_bytes(image_bytes)
                logos = detect_logos_bytes(image_bytes)
        except Exception:
            return ("", "", 2)


if __name__ == '__main__':
    print(detect_logos('uploads/HyFbottle.jpg'))
