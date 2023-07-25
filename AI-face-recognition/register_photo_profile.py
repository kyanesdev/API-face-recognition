import cv2
import time

# Open the webcam
video_capture = cv2.VideoCapture(0)

# Function to save the photo
def save_photo():
    # Read frame from the webcam
    _, frame = video_capture.read()
    
    # Get current timestamp
    timestamp = int(time.time())

    # Save the frame as an image
    cv2.imwrite('new_user.jpg', frame)

# Open a window
cv2.namedWindow("Window", cv2.WINDOW_NORMAL)

# Resize the window
cv2.resizeWindow("Window", 800, 600)

# Display a counter for 5 seconds
start_time = time.time()
while (time.time() - start_time) < 5:
    # Read frame from the webcam
    _, frame = video_capture.read()
    
    # Show the counter on the frame
    cv2.putText(frame, str(int(5 - (time.time() - start_time))), (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)
    
    # Show the frame in the window
    cv2.imshow("Window", frame)
    cv2.waitKey(1)

# Take a photo
save_photo()

# Close all windows
cv2.destroyAllWindows()