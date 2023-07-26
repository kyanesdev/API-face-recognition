import cv2
import face_recognition
import numpy as np

file = "new_user.jpg"  # Replace with the path to the image you want to use for building the profile
image = cv2.imread(file)

faces_loc = face_recognition.face_locations(image, model="cnn")

if not faces_loc:
    print("No faces found in the image.")
else:
    for fl in faces_loc:
        modelo = face_recognition.face_encodings(image, known_face_locations=[fl])
        np.savetxt("saved_user.txt", modelo)
    
    with open('saved_user.txt', 'r') as file:
        saved_user = file.read()

    print(saved_user)