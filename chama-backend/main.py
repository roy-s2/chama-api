from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import base64
import re
from datetime import datetime
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables (same names as before, to keep frontend unchanged)
MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE", "174379")
MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL", "")

# In-memory contribution store (replace with DB later)
contributions_db = []

class STKPushRequest(BaseModel):
    phone_number: str
    amount: int

def has_real_keys():
    return all([MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY])

def format_phone_number(phone_number: str) -> str:
    """Robust Kenyan phone number formatting."""
    cleaned = re.sub(r'\D', '', phone_number)
    if cleaned.startswith('0') and len(cleaned) == 10:
        return '254' + cleaned[1:]
    elif cleaned.startswith('7') and len(cleaned) == 9:
        return '254' + cleaned
    elif cleaned.startswith('254') and len(cleaned) == 12:
        return cleaned
    elif cleaned.startswith('+254') and len(cleaned) == 13:
        return cleaned[1:]
    else:
        return cleaned  # Daraja will reject if invalid

async def get_access_token():
    if not has_real_keys():
        raise Exception("No M-Pesa keys configured – using mock")
    auth = base64.b64encode(
        f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}".encode()
    ).decode()
    headers = {"Authorization": f"Basic {auth}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            headers=headers,
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            raise Exception("Failed to get access token")

@app.post("/api/mpesa/stk-push")
async def stk_push(request: STKPushRequest):
    # Format the phone number properly
    formatted_phone = format_phone_number(request.phone_number)

    if not has_real_keys():
        # Mock response for testing
        mock_response = {
            "MerchantRequestID": "mock-" + str(datetime.utcnow().timestamp()),
            "CheckoutRequestID": "ws_CO_" + str(int(datetime.utcnow().timestamp())),
            "ResponseCode": "0",
            "ResponseDescription": "Success. Request accepted for processing (MOCK)",
            "CustomerMessage": "Mock STK push. Enter PIN to continue."
        }
        contributions_db.append({
            "phone": formatted_phone,
            "amount": request.amount,
            "ref": mock_response["CheckoutRequestID"],
            "timestamp": datetime.utcnow().isoformat(),
            "type": "mpesa",
        })
        return mock_response

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
        "PartyA": formatted_phone,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": formatted_phone,
        "CallBackURL": MPESA_CALLBACK_URL,
        "AccountReference": "Chama Contribution",
        "TransactionDesc": "Chama savings",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=400, detail=response.text)

@app.post("/api/mpesa/callback")
async def mpesa_callback(request: Request):
    data = await request.json()
    try:
        body = data["Body"]["stkCallback"]
        result_code = body["ResultCode"]
        if result_code == 0:
            amount = body["CallbackMetadata"]["Item"][0]["Value"]
            phone = body["CallbackMetadata"]["Item"][4]["Value"]
            ref = body["CallbackMetadata"]["Item"][1]["Value"]
            contributions_db.append({
                "phone": str(phone),
                "amount": amount,
                "ref": ref,
                "timestamp": datetime.utcnow().isoformat(),
                "type": "mpesa",
            })
            print(f"✅ M-Pesa payment received: {amount} from {phone}")
        else:
            print(f"❌ M-Pesa payment failed: {body['ResultDesc']}")
    except Exception as e:
        print("Callback parse error:", e)
    return {"ResultCode": 0, "ResultDesc": "Accepted"}
