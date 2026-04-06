import sys
import os
import io
import re
import time

os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

# Inject backend's virtual environment packages into the path so Streamlit
# can find PaddleOCR, ultralytics, and opencv which live in the backend venv.
venv_path = os.path.join(os.path.dirname(__file__), "backend", "venv", "Lib", "site-packages")
sys.path.insert(0, venv_path)

# Append backend directory so we can reuse mock_db without copying it.
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

import streamlit as st
import numpy as np
import cv2
from PIL import Image

from mock_db import get_owner_details
from ultralytics import YOLO
from paddleocr import PaddleOCR

# Configure Streamlit page

st.title("🚘 PlateSense AI (Streamlit Edition)")
st.markdown("Upload an image of a vehicle to detect its license plate and instantly retrieve mock vehicle owner details.")

# Cache the heavy ML models so they only load once per session
@st.cache_resource(show_spinner=False)
def load_models():
    # Load YOLO from relative backend path
    yolo_model = YOLO("backend/license_plate_detector.pt")
    # Load PaddleOCR
    ocr_reader = PaddleOCR(lang='en', use_gpu=False, show_log=False)
    return yolo_model, ocr_reader

with st.spinner("Loading AI Models into memory... Please wait."):
    try:
        yolo_model, ocr_reader = load_models()
        models_loaded = True
    except Exception as e:
        st.error(f"Failed to load models: {str(e)}")
        models_loaded = False

# Helper validation and cleaning functions from backend
def clean_plate_text(text: str) -> str:
    text = re.sub(r'[^A-Z0-9]', '', text.upper())
    return text

def validate_indian_plate(text: str) -> bool:
    pattern = r"^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$"
    return bool(re.match(pattern, text))

def apply_mapping(txt: str):
    char_to_num = {'O': '0', 'Q': '0', 'I': '1', 'L': '4', 'J': '3', 'S': '5', 'G': '6', 'B': '8', 'Z': '2'}
    num_to_char = {'0': 'O', '1': 'I', '4': 'A', '5': 'S', '6': 'G', '8': 'B', '2': 'Z'}
    
    while len(txt) > 10:
        if txt[0] in ['1', 'I', 'L']:
            txt = txt[1:]
        elif txt[-1] in ['1', 'I', 'L', '0', 'O']:
            txt = txt[:-1]
        else:
            txt = txt[:10]
             
    if len(txt) < 8:
        return txt
        
    if txt[0].isdigit() and txt[1].isdigit():
        return txt
    
    chars = list(txt)
    for i in range(min(2, len(chars))):
        if chars[i] in num_to_char: chars[i] = num_to_char[chars[i]]
    for i in range(2, min(4, len(chars))):
        if chars[i] in char_to_num: chars[i] = char_to_num[chars[i]]
    for i in range(max(4, len(chars) - 4), len(chars)):
        if chars[i] in char_to_num: chars[i] = char_to_num[chars[i]]
    for i in range(4, max(4, len(chars) - 4)):
        if chars[i] in num_to_char: chars[i] = num_to_char[chars[i]]
        
    return "".join(chars)

# File uploader
uploaded_file = st.file_uploader("Upload an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None and models_loaded:
    start_time = time.time()
    
    # Check if we should re-run on a different image
    image = Image.open(uploaded_file).convert("RGB")
    image_np = np.array(image)
    image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Original Image")
        st.image(image, use_container_width=True)

    with st.spinner("Analyzing image..."):
        # 1. YOLO Inference
        results = yolo_model(image_bgr, verbose=False)
        
        if len(results) == 0 or len(results[0].boxes) == 0:
            st.warning("No license plate detected in the image.")
            st.stop()
            
        box = results[0].boxes[0]
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        confidence = float(box.conf[0])
        
        # Draw bounding box on a copy of the image for visualization
        box_image = image_np.copy()
        cv2.rectangle(box_image, (x1, y1), (x2, y2), (0, 255, 0), 3)
        cv2.putText(box_image, f"Plate: {confidence:.2f}", (x1, max(y1-10, 0)), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        
        # 2. Crop Plate & Preprocess
        cropped_plate = image_bgr[y1:y2, x1:x2]
        
        cropped_plate_resized = cv2.resize(cropped_plate, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
        gray_plate = cv2.cvtColor(cropped_plate_resized, cv2.COLOR_BGR2GRAY)
        gray_plate = cv2.medianBlur(gray_plate, 3)
        
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray_plate = clahe.apply(gray_plate)
        ocr_ready_plate = cv2.cvtColor(gray_plate, cv2.COLOR_GRAY2BGR)
        
        # 3. OCR Extraction
        ocr_result = ocr_reader.ocr(ocr_ready_plate)
        if not ocr_result or not ocr_result[0]:
            ocr_result = ocr_reader.ocr(cropped_plate) # fallback
            
        if not ocr_result or not ocr_result[0]:
            st.error("License plate detected but text unreadable.")
            st.stop()
            
        ocr_results = [line[1][0] for line in ocr_result[0] if line and len(line) == 2]
        raw_text = " ".join(ocr_results)
        raw_text = re.sub(r'\bIND\b', '', raw_text, flags=re.IGNORECASE)
        cleaned_text = clean_plate_text(raw_text)
        
        if cleaned_text.startswith("IND"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("IND"):
            cleaned_text = cleaned_text[:-3]
            
        final_text = apply_mapping(cleaned_text)
        is_valid = validate_indian_plate(final_text)
        
        process_time = time.time() - start_time
        
        # 4. Fetch Owner Details
        owner_details = get_owner_details(final_text)
        
    with col2:
        st.subheader("Detection Results")
        st.image(box_image, caption="Plate Localized", use_container_width=True)
        
        # Present the data in a nice format
        st.success(f"**Detected Plate Number:** {final_text}")
        
        metrics_col1, metrics_col2 = st.columns(2)
        metrics_col1.metric("Confidence", f"{confidence*100:.1f}%")
        metrics_col2.metric("Processing Time", f"{process_time:.2f}s")
        
        st.markdown("### Owner Details")
        st.write(f"**Owner Name:** {owner_details.get('owner_name')}")
        st.write(f"**Vehicle Type:** {owner_details.get('vehicle_type')}")
        st.write(f"**Registration Date:** {owner_details.get('registration_date')}")
        
        status = owner_details.get('rc_status')
        if status == "ACTIVE":
            st.success(f"**RC Status:** {status}")
        else:
            st.error(f"**RC Status:** {status}")
            
        if not is_valid:
            st.warning("Warning: The recognized plate does not perfectly match the standard Indian format. Text extraction may be slightly flawed.")

st.markdown("---")
st.markdown("Built with FastAPI, YOLOv8, and PaddleOCR")
