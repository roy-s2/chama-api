from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import httpx
import os
import base64
import re
from datetime import datetime
from pydantic import BaseModel

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MPESA CONFIG ----------------
MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE", "174379")
MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL", "")

contributions_db = []

class STKPushRequest(BaseModel):
    phone_number: str
    amount: int

def has_real_keys():
    return all([MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY])

def format_phone_number(phone_number: str) -> str:
    cleaned = re.sub(r'\D', '', phone_number)
    if cleaned.startswith('0') and len(cleaned) == 10:
        return '254' + cleaned[1:]
    elif cleaned.startswith('7') and len(cleaned) == 9:
        return '254' + cleaned
    elif cleaned.startswith('254') and len(cleaned) == 12:
        return cleaned
    elif cleaned.startswith('+254'):
        return cleaned[1:]
    return cleaned

async def get_access_token():
    auth = base64.b64encode(
        f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            headers={"Authorization": f"Basic {auth}"},
        )
        return response.json()["access_token"]

# ---------------- API ROUTES FIRST ----------------

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/mpesa/stk-push")
async def stk_push(request: STKPushRequest):

    phone = format_phone_number(request.phone_number)

    if not has_real_keys():
        return {
            "message": "Mock STK push success",
            "phone": phone,
            "amount": request.amount
        }

    token = await get_access_token()

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(
        f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}".encode()
    ).decode()

    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": request.amount,
        "PartyA": phone,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": MPESA_CALLBACK_URL,
        "AccountReference": "Chama",
        "TransactionDesc": "Contribution",
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        return res.json()

@app.post("/api/mpesa/callback")
async def callback(request: Request):
    data = await request.json()
    print("Callback:", data)
    return {"ResultCode": 0, "ResultDesc": "Accepted"}

# ---------------- FRONTEND LAST (IMPORTANT FIX) ----------------
app.mount("/", StaticFiles(directory="dist", html=True), name="frontend")