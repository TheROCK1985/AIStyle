# AIStyle

This repository contains a basic Python `FastAPI` backend for uploading clothing images and retrieving weather data.

## Running the backend

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r python_backend/requirements.txt
   ```
2. Copy `.env.example` to `.env` and add your API keys:
   ```bash
   cp python_backend/.env.example python_backend/.env
   # edit python_backend/.env and add your keys
   ```
3. Start the server:
   ```bash
   python python_backend/main.py
   ```

The server exposes two endpoints:

- `POST /upload` – upload an image file and store metadata returned by the Gemini API.
- `GET /weather?lat=<lat>&lon=<lon>` – fetch weather information.

Uploaded wardrobe items are stored in memory for demonstration purposes.
