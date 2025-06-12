from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import imagehash
import hashlib
import io
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# In-memory storage for items and hashes. In production use a DB.
WARDROBE = {}
HASHES = set()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

if not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY not set. Gemini API calls will fail.")

if not WEATHER_API_KEY:
    print("Warning: WEATHER_API_KEY not set. Weather API calls will use demo data.")


def analyze_image_with_gemini(image_bytes: bytes) -> dict:
    """Send image to Gemini API and return analysis."""
    if not GOOGLE_API_KEY:
        return {"description": "demo", "color": "unknown", "type": "unknown"}
    endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent"
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{"parts": [{"text": "Describe the clothing item in detail"}, {"inlineData": {"mimeType": "image/jpeg", "data": image_bytes.decode('latin1')}}]}]
    }
    params = {"key": GOOGLE_API_KEY}
    resp = requests.post(endpoint, headers=headers, params=params, json=data)
    if not resp.ok:
        raise HTTPException(status_code=500, detail="Gemini API error")
    gemini_resp = resp.json()
    text = gemini_resp.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    return {"description": text, "color": "unknown", "type": "unknown"}


def fetch_weather(lat: float, lon: float) -> dict:
    if not WEATHER_API_KEY:
        return {"condition": "Partly Cloudy", "temperature": 72, "location": "Demo City"}
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"
    resp = requests.get(url)
    if not resp.ok:
        raise HTTPException(status_code=500, detail="Weather API error")
    data = resp.json()
    return {
        "condition": data["weather"][0]["main"],
        "temperature": data["main"]["temp"],
        "location": data["name"]
    }


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    image.thumbnail((800, 800))

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    resized_bytes = buffer.getvalue()

    phash = str(imagehash.phash(image))
    if phash in HASHES:
        raise HTTPException(status_code=400, detail="Duplicate item detected")

    HASHES.add(phash)

    item_id = hashlib.sha1(resized_bytes).hexdigest()
    analysis = analyze_image_with_gemini(resized_bytes)
    WARDROBE[item_id] = {
        "id": item_id,
        "hash": phash,
        "description": analysis.get("description"),
        "color": analysis.get("color"),
        "type": analysis.get("type")
    }
    return JSONResponse(WARDROBE[item_id])


@app.get("/weather")
async def get_weather(lat: float, lon: float):
    return fetch_weather(lat, lon)


@app.get("/wardrobe")
async def list_wardrobe():
    return list(WARDROBE.values())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
