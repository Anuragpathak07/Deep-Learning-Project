import io
import re
import time
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from paddleocr import PaddleOCR
import logging

from mock_db import get_owner_details

app = FastAPI(title="PlateSense AI Backend")

# Setup CORS for frontend to talk
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins on dev. Adjust later.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize YOLO model and EasyOCR
try:
    logger.info("Loading YOLO model...")
    yolo_model = YOLO("license_plate_detector.pt")
    logger.info("Loading PaddleOCR (CPU Fallback). This might take a moment...")
    ocr_reader = PaddleOCR(lang='en', use_gpu=False)
    logger.info("Models loaded successfully")
except Exception as e:
    logger.error(f"Failed to load models: {e}")
    yolo_model = None
    ocr_reader = None

def clean_plate_text(text: str) -> str:
    """Removes special characters, whitespaces, and converts to uppercase."""
    text = re.sub(r'[^A-Z0-9]', '', text.upper())
    return text

def validate_indian_plate(text: str) -> bool:
    """
    Validates against typical Indian number plate syntax:
    ^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$
    """
    pattern = r"^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$"
    return bool(re.match(pattern, text))

@app.post("/detect")
async def detect_license_plate(file: UploadFile = File(...)):
    if not yolo_model or not ocr_reader:
         raise HTTPException(status_code=500, detail="Models are not initialized.")

    start_time = time.time()
    
    try:
        # Read image to numpy array/opencv format
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image)
        # Convert RGB to BGR for OpenCV / YOLO processing
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    except Exception as e:
        logger.error(f"Image load error: {e}")
        raise HTTPException(status_code=400, detail="Invalid image file or format. Please upload a valid image.")

    # 1. YOLO Inference
    results = yolo_model(image_bgr, verbose=False)
    
    if len(results) == 0 or len(results[0].boxes) == 0:
        return JSONResponse(status_code=404, content={"message": "No license plate detected"})
    
    # Take the highest confidence box
    box = results[0].boxes[0]
    x1, y1, x2, y2 = map(int, box.xyxy[0])
    confidence = float(box.conf[0])

    # 2. Crop Plate
    try:
        cropped_plate = image_bgr[y1:y2, x1:x2]
        
        # Preprocess cropped plate for OCR: Upscale 2x and convert to Grayscale
        cropped_plate = cv2.resize(cropped_plate, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
        gray_plate = cv2.cvtColor(cropped_plate, cv2.COLOR_BGR2GRAY)
        
        # Apply Median Blur to remove pepper noise (like small screws) while preserving hard edges
        gray_plate = cv2.medianBlur(gray_plate, 3)
        
        # Enhance contrast with CLAHE instead of Morphological operations
        # MORPH_CLOSE on dark text can erode thin lines (like the crossbar of a 4), turning it into a 6.
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray_plate = clahe.apply(gray_plate)
        
        # PaddleOCR 3.4.0 requires a 3-channel (H, W, 3) image. 
        # We must convert the single channel contrasted grayscale image back into 3 identical channels.
        ocr_ready_plate = cv2.cvtColor(gray_plate, cv2.COLOR_GRAY2BGR)
        
    except Exception as e:
         logger.error(f"Error cropping/processing plate: {e}")
         return JSONResponse(status_code=500, content={"message": "Error processing detected plate"})
    
    #OUR OCR MODEL PERFORMS SEGMENTATION AND CLASSIFICATION
    result = ocr_reader.ocr(ocr_ready_plate)
    
    if not result or not result[0]:
        logger.info("Fallback PaddleOCR try...")
        result = ocr_reader.ocr(cropped_plate)
        if not result or not result[0]:
             return JSONResponse(status_code=400, content={"message": "License plate detected but text unreadable."})
             
    # Extract text from OCR Model result structure
    ocr_results = [line[1][0] for line in result[0] if line and len(line) == 2]
    
    raw_text = " ".join(ocr_results)
    raw_text = re.sub(r'\bIND\b', '', raw_text, flags=re.IGNORECASE)
    cleaned_text = clean_plate_text(raw_text)
    
    if cleaned_text.startswith("IND"):
        cleaned_text = cleaned_text[3:]
    if cleaned_text.endswith("IND"):
        cleaned_text = cleaned_text[:-3]

    # Advanced Heuristic correction for common misreads based on std Indian Plate format (AA NNAA NNNN)
    char_to_num = {'O': '0', 'Q': '0', 'I': '1', 'L': '4', 'J': '3', 'S': '5', 'G': '6', 'B': '8', 'Z': '2'}
    num_to_char = {'0': 'O', '1': 'I', '4': 'A', '5': 'S', '6': 'G', '8': 'B', '2': 'Z'}
    
    def apply_mapping(txt: str):
        # Clean boundary hallucinations (like detecting edge of plate as '1' or 'I')
        while len(txt) > 10:
            if txt[0] in ['1', 'I', 'L']:
                 txt = txt[1:]
            elif txt[-1] in ['1', 'I', 'L', '0', 'O']:
                 txt = txt[:-1]
            else:
                 # Truncate to max legal length to allow mapping
                 txt = txt[:10]
                 
        if len(txt) < 8:
            return txt
            
        # BH format (22 BH 6517 A) -> 9 chars, first 2 are digits
        if txt[0].isdigit() and txt[1].isdigit():
            return txt
        
        # Standard format (RJ 14 CV 0002)
        chars = list(txt)
        
        # First 2 must be letters
        for i in range(min(2, len(chars))):
            if chars[i] in num_to_char: chars[i] = num_to_char[chars[i]]
        
        # Next 2 must be numbers
        for i in range(2, min(4, len(chars))):
            if chars[i] in char_to_num: chars[i] = char_to_num[chars[i]]
            
        # Last 4 must be numbers
        for i in range(max(4, len(chars) - 4), len(chars)):
            if chars[i] in char_to_num: chars[i] = char_to_num[chars[i]]
            
        # Middle must be letters
        for i in range(4, max(4, len(chars) - 4)):
            if chars[i] in num_to_char: chars[i] = num_to_char[chars[i]]
            
        return "".join(chars)
    
    cleaned_text = apply_mapping(cleaned_text)
    is_valid = validate_indian_plate(cleaned_text)
    
    if not cleaned_text:
         return JSONResponse(status_code=400, content={"message": "License plate detected but text could not be extracted cleanly."})

    # 5. Fetch Mock Database Owner Details
    owner_details = get_owner_details(cleaned_text)
    
    process_time = time.time() - start_time
    
    # 6. Return standard JSON mapping exactly to the user request structure
    # Bounding box output typically is [x, y, w, h] as asked
    w = x2 - x1
    h = y2 - y1
    
    response_data = {
        "plate_number": cleaned_text,
        "is_valid_format": is_valid,  # Additional flag for the frontend
        "confidence": round(confidence, 2),
        "processing_time": f"{process_time:.2f}s",
        "owner_details": owner_details,
        "box": [x1, y1, w, h], 
        "image_url": "/processed/xyz.jpg" # Required strictly by the assignment syntax even if static
    }
    
    return response_data

@app.get("/health")
def health_check():
    return {"status": "ok"}
