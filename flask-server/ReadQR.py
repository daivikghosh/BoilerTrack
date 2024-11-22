import cv2
import os

def decodeqrcode(filepath):
    img = cv2.imread(filepath)
    detector = cv2.QRCodeDetector()
    data, bbox, _ = detector.detectAndDecode(img)
    qritemid = 0
    qremailid = "NA"

    if data:
        print("Decoded Data:", data)
        index1 = data.find("ID=")
        index2 = data.find("&")
        index3 = data.find("Email=")
        qritemid = data[(index1+3):index2]
        qremailid = data[(index3+6):]
        
    else:
        print("No QR code detected.")

    return qritemid, qremailid

# Test
# decodeqrcode("qr_code.png")