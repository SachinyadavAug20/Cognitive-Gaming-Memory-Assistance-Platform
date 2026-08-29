import pickle
import cv2
import mediapipe as mp
import numpy as np
import time

# Load trained model
model_dict = pickle.load(open('./model.p', 'rb'))
model = model_dict['model']

# Camera
cap = cv2.VideoCapture(0)

# MediaPipe Hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.3,
    min_tracking_confidence=0.3
)

# Gesture labels
labels_dict = {
    0: 'B',
    1: 'A',
    2: 'V',
    3: 'Y',
    4: 'L',
    5: 'F'
}

# Text typed by hand gestures
typed_text = ""

# Gesture timing variables
current_gesture = None
gesture_start_time = 0
gesture_printed = False

# Required time to hold gesture
required_time = 2.0


while True:

    data_aux = []
    x_ = []
    y_ = []

    ret, frame = cap.read()

    if not ret:
        break

    frame = cv2.flip(frame, 1)

    H, W, _ = frame.shape

    # Convert BGR -> RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Detect hands
    results = hands.process(frame_rgb)

    if results.multi_hand_landmarks:

        for hand_landmarks in results.multi_hand_landmarks:

            # Draw hand landmarks
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style()
            )

            # Get landmark coordinates
            for landmark in hand_landmarks.landmark:

                x = landmark.x
                y = landmark.y

                x_.append(x)
                y_.append(y)

            # Create normalized data
            for landmark in hand_landmarks.landmark:

                x = landmark.x
                y = landmark.y

                data_aux.append(x - min(x_))
                data_aux.append(y - min(y_))

        # Bounding box
        x1 = int(min(x_) * W) - 10
        y1 = int(min(y_) * H) - 10

        x2 = int(max(x_) * W) - 10
        y2 = int(max(y_) * H) - 10

        # Predict gesture
        prediction = model.predict([np.asarray(data_aux)])

        predicted_character = labels_dict[int(prediction[0])]

        # -------------------------------
        # GESTURE HOLDING LOGIC
        # -------------------------------

        current_time = time.time()

        # New gesture detected
        if predicted_character != current_gesture:

            current_gesture = predicted_character
            gesture_start_time = current_time
            gesture_printed = False

        # How long the gesture has been held
        gesture_duration = current_time - gesture_start_time

        # Print only after holding for 2 seconds
        if gesture_duration >= required_time and not gesture_printed:

            typed_text += predicted_character

            gesture_printed = True

        # -------------------------------
        # DISPLAY
        # -------------------------------

        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (0, 0, 0),
            4
        )

        cv2.putText(
            frame,
            "Gesture: " + predicted_character,
            (x1, y1 - 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 0),
            3,
            cv2.LINE_AA
        )

        # Show holding timer
        if not gesture_printed:

            cv2.putText(
                frame,
                "Hold: {:.1f}s".format(gesture_duration),
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                2,
                cv2.LINE_AA
            )

        else:

            cv2.putText(
                frame,
                "PRINTED!",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 128, 0),
                2,
                cv2.LINE_AA
            )

    else:

        # No hand detected
        current_gesture = None
        gesture_start_time = 0
        gesture_printed = False

    # Display typed text
    cv2.rectangle(
        frame,
        (20, 20),
        (W - 20, 100),
        (255, 255, 255),
        -1
    )

    cv2.putText(
        frame,
        "Text: " + typed_text,
        (40, 75),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.5,
        (0, 0, 0),
        3,
        cv2.LINE_AA
    )

    # Instructions
    cv2.putText(
        frame,
        "Hold gesture for 2 seconds | C = Clear | SPACE = Space | Q = Quit",
        (20, H - 20),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 0, 0),
        2,
        cv2.LINE_AA
    )

    cv2.imshow('Hand Gesture Typing', frame)

    key = cv2.waitKey(1) & 0xFF

    # Quit
    if key == ord('q'):
        break

    # Clear text
    elif key == ord('c'):
        typed_text = ""

    # Add space
    elif key == ord(' '):
        typed_text += " "


cap.release()
cv2.destroyAllWindows()