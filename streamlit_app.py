import sys
import os

# When running locally, inject the backend venv so the ML packages are found.
# On Streamlit Cloud this path won't exist, so we skip silently.
_local_venv = os.path.join(os.path.dirname(__file__), "backend", "venv", "Lib", "site-packages")
if os.path.isdir(_local_venv):
    sys.path.insert(0, _local_venv)

# Make mock_db importable from the backend sub-directory
_backend_dir = os.path.join(os.path.dirname(__file__), "backend")
if _backend_dir not in sys.path:
    sys.path.append(_backend_dir)

import io
import re
import time

import streamlit as st
import numpy as np
import cv2
from PIL import Image
import easyocr

from mock_db import get_owner_details
from ultralytics import YOLO

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(page_title="PlateSense AI", layout="wide", page_icon="🚘")

st.title("🚘 PlateSense AI")
st.markdown("Upload an image of a vehicle to detect its license plate and retrieve owner details.")

# ── Model loading (cached – runs once per session) ───────────────────────────
@st.cache_resource(show_spinner=False)
def load_models():
    model_path = os.path.join(os.path.dirname(__file__), "backend", "license_plate_detector.pt")
    yolo_model = YOLO(model_path)
    # EasyOCR: GPU=False for cloud/CPU environments
    ocr_reader = easyocr.Reader(["en"], gpu=False)
    return yolo_model, ocr_reader

with st.spinner("Loading AI models… this may take a moment on first run."):
    try:
        yolo_model, ocr_reader = load_models()
        models_loaded = True
    except Exception as e:
        st.error(f"Failed to load models: {e}")
        models_loaded = False

# ── Helper functions (mirrored from backend/main.py) ─────────────────────────
def clean_plate_text(text: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", text.upper())

def validate_indian_plate(text: str) -> bool:
    return bool(re.match(r"^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$", text))

def apply_mapping(txt: str) -> str:
    char_to_num = {"O": "0", "Q": "0", "I": "1", "L": "4", "J": "3",
                   "S": "5", "G": "6", "B": "8", "Z": "2"}
    num_to_char = {"0": "O", "1": "I", "4": "A", "5": "S",
                   "6": "G", "8": "B", "2": "Z"}

    while len(txt) > 10:
        if txt[0] in ["1", "I", "L"]:
            txt = txt[1:]
        elif txt[-1] in ["1", "I", "L", "0", "O"]:
            txt = txt[:-1]
        else:
            txt = txt[:10]

    if len(txt) < 8:
        return txt
    if txt[0].isdigit() and txt[1].isdigit():
        return txt

    chars = list(txt)
    for i in range(min(2, len(chars))):
        if chars[i] in num_to_char:
            chars[i] = num_to_char[chars[i]]
    for i in range(2, min(4, len(chars))):
        if chars[i] in char_to_num:
            chars[i] = char_to_num[chars[i]]
    for i in range(max(4, len(chars) - 4), len(chars)):
        if chars[i] in char_to_num:
            chars[i] = char_to_num[chars[i]]
    for i in range(4, max(4, len(chars) - 4)):
        if chars[i] in num_to_char:
            chars[i] = num_to_char[chars[i]]
    return "".join(chars)

# ── Main UI ──────────────────────────────────────────────────────────────────
uploaded_file = st.file_uploader("Upload a vehicle image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None and models_loaded:
    start_time = time.time()

    image = Image.open(uploaded_file).convert("RGB")
    image_np = np.array(image)
    image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Original Image")
        st.image(image, use_container_width=True)

    with st.spinner("Analysing image…"):
        # 1. YOLO detection
        results = yolo_model(image_bgr, verbose=False)
        if not results or len(results[0].boxes) == 0:
            st.warning("No license plate detected in the image.")
            st.stop()

        box = results[0].boxes[0]
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        confidence = float(box.conf[0])

        # Draw bounding box
        vis = image_np.copy()
        cv2.rectangle(vis, (x1, y1), (x2, y2), (0, 255, 0), 3)
        cv2.putText(vis, f"Plate {confidence:.2f}", (x1, max(y1 - 10, 0)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        # 2. Crop + preprocess
        crop = image_bgr[y1:y2, x1:x2]
        crop = cv2.resize(crop, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        gray = cv2.medianBlur(gray, 3)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)
        ocr_input = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

        # 3. EasyOCR extraction
        ocr_res = ocr_reader.readtext(ocr_input)
        if not ocr_res:
            ocr_res = ocr_reader.readtext(crop)  # fallback to original crop
        if not ocr_res:
            st.error("Plate detected but text unreadable.")
            st.stop()

        # EasyOCR returns list of (bbox, text, confidence)
        raw = " ".join(item[1] for item in ocr_res)
        raw = re.sub(r"\bIND\b", "", raw, flags=re.IGNORECASE)
        cleaned = clean_plate_text(raw)
        cleaned = cleaned[3:] if cleaned.startswith("IND") else cleaned
        cleaned = cleaned[:-3] if cleaned.endswith("IND") else cleaned
        final = apply_mapping(cleaned)
        is_valid = validate_indian_plate(final)

        process_time = time.time() - start_time
        owner = get_owner_details(final)

    with col2:
        st.subheader("Detection Results")
        st.image(vis, caption="Detected plate region", use_container_width=True)

        st.success(f"**Plate Number:** `{final}`")

        m1, m2 = st.columns(2)
        m1.metric("Confidence", f"{confidence * 100:.1f}%")
        m2.metric("Processing Time", f"{process_time:.2f}s")

        st.markdown("### Owner Details")
        st.write(f"**Owner:** {owner.get('owner_name')}")
        st.write(f"**Vehicle:** {owner.get('vehicle_type')}")
        st.write(f"**Registered:** {owner.get('registration_date')}")

        rc = owner.get("rc_status", "")
        if rc == "ACTIVE":
            st.success(f"**RC Status:** {rc}")
        else:
            st.error(f"**RC Status:** {rc}")

        if not is_valid:
            st.warning("Note: Plate format does not match standard Indian syntax — OCR may be slightly off.")

st.markdown("---")
st.caption("PlateSense AI · YOLOv8 + EasyOCR")
