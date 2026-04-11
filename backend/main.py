"""
Society Management AI Chatbot - Backend Server
FastAPI server with Anthropic Claude integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
from dotenv import load_dotenv
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()
print("🔑 API KEY LOADED:", bool(os.environ.get("ANTHROPIC_API_KEY")))

app = FastAPI(title="Society Management AI Chatbot", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# --------------------
# Events Database
# (replace with real DB later)
# --------------------
EVENTS = [
    {"id": 1, "name": "Community BBQ", "date": "Saturday, 19 April 2026", "time": "12:00 PM – 4:00 PM", "location": "Garden Area", "spots": 30},
    {"id": 2, "name": "Yoga Morning", "date": "Sunday, 20 April 2026",    "time": "7:00 AM – 8:30 AM", "location": "Rooftop Terrace", "spots": 15},
    {"id": 3, "name": "Kids Fun Day",  "date": "Saturday, 26 April 2026", "time": "10:00 AM – 2:00 PM", "location": "Community Hall", "spots": 50},
    {"id": 4, "name": "Movie Night",   "date": "Friday, 25 April 2026",   "time": "8:00 PM – 11:00 PM","location": "Rooftop Terrace", "spots": 40},
]

SYSTEM_PROMPT = """You are an advanced AI assistant for a residential Society Management System.

You help residents with facilities, events, bookings, news, and contacting management.

IMPORTANT BOOKING RULE:
- When a user wants to book an event, respond with EXACTLY this JSON format and nothing else:
  {"action": "show_events"}
- When a user confirms a booking with their email, respond with EXACTLY:
  {"action": "confirm_booking", "event_id": <number>, "email": "<email>"}
- For all other queries, respond normally as a friendly assistant.

Facilities: gym (6am-10pm), pool (7am-9pm), garden (always open)
Manager contact: manager@society.com | 1234567890
Tone: Friendly, simple, short responses."""

FALLBACK_RESPONSES = {
    "gym":     "🏋️ Our gym is open 6am–10pm daily. Would you like to book a slot?",
    "pool":    "🏊 The swimming pool is open 7am–9pm. Shall I help you book?",
    "book":    "📅 Let me show you our upcoming events!",
    "event":   "🎉 Let me show you our upcoming events!",
    "contact": "📞 Manager: manager@society.com | 1234567890",
    "hello":   "👋 Hello! I can help with facilities, bookings, news, and management. What do you need?",
    "hi":      "👋 Hi there! How can I help you today?",
    "help":    "🤝 I can help with:\n• Facilities\n• Event bookings\n• Society news\n• Contacting management",
}

def get_fallback_response(message: str) -> str:
    msg = message.lower()
    for keyword, response in FALLBACK_RESPONSES.items():
        if keyword in msg:
            return response
    return "👋 Ask me about facilities, bookings, news, or management!"


# --------------------
# Email sender
# --------------------
def send_booking_email(to_email: str, event: dict) -> bool:
    try:
        smtp_user = os.environ.get("EMAIL_USER")
        smtp_pass = os.environ.get("EMAIL_PASS")

        if not smtp_user or not smtp_pass:
            print("⚠️ Email credentials not set — skipping email")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"✅ Booking Confirmed – {event['name']}"
        msg["From"]    = smtp_user
        msg["To"]      = to_email

        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border-radius:12px;border:1px solid #e2e8f0">
          <h2 style="color:#4f46e5">✅ Booking Confirmed!</h2>
          <p>Your spot has been reserved. Here are your booking details:</p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <tr><td style="padding:8px;color:#666">Event</td><td style="padding:8px;font-weight:bold">{event['name']}</td></tr>
            <tr style="background:#f8f8f8"><td style="padding:8px;color:#666">Date</td><td style="padding:8px">{event['date']}</td></tr>
            <tr><td style="padding:8px;color:#666">Time</td><td style="padding:8px">{event['time']}</td></tr>
            <tr style="background:#f8f8f8"><td style="padding:8px;color:#666">Location</td><td style="padding:8px">{event['location']}</td></tr>
          </table>
          <p style="margin-top:20px;color:#666">See you there! 🎉<br><strong>Society Management Team</strong></p>
        </div>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to_email, msg.as_string())

        print(f"✅ Email sent to {to_email}")
        return True

    except Exception as e:
        print(f"🔥 Email error: {e}")
        return False


# --------------------
# Models
# --------------------
class ChatRequest(BaseModel):
    message: str
    history: list = []

class BookingRequest(BaseModel):
    event_id: int
    email: str
    name: str

class ChatResponse(BaseModel):
    reply: str
    status: str
    action: str = "none"
    events: list = []

class HealthResponse(BaseModel):
    status: str
    message: str


# --------------------
# Routes
# --------------------
@app.get("/")
def root():
    return {"status": "ok", "message": "Society Management API is running"}


@app.get("/events")
def get_events():
    return {"events": EVENTS}


@app.post("/book")
async def book_event(request: BookingRequest):
    event = next((e for e in EVENTS if e["id"] == request.event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    email_sent = send_booking_email(request.email, event)

    return {
        "status": "ok",
        "message": f"✅ Booking confirmed for {event['name']} on {event['date']}!",
        "email_sent": email_sent,
        "event": event
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    messages = []
    for h in request.history[-10:]:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": request.message})

    if os.environ.get("ANTHROPIC_API_KEY"):
        try:
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=500,
                system=SYSTEM_PROMPT,
                messages=messages
            )
            raw = response.content[0].text.strip()
            print(f"✅ Claude: {raw[:80]}")

            # Check if Claude returned an action
            import json
            try:
                parsed = json.loads(raw)
                action = parsed.get("action", "none")

                if action == "show_events":
                    return ChatResponse(
                        reply="Here are our upcoming events! Click one to book instantly 👇",
                        status="ok",
                        action="show_events",
                        events=EVENTS
                    )

            except json.JSONDecodeError:
                pass  # Normal text response

            return ChatResponse(reply=raw, status="ok")

        except Exception as e:
            print("🔥 ERROR:", str(e))

    # Fallback
    msg_lower = request.message.lower()
    if any(k in msg_lower for k in ["book", "event", "register"]):
        return ChatResponse(
            reply="Here are our upcoming events! Click one to book instantly 👇",
            status="fallback",
            action="show_events",
            events=EVENTS
        )

    return ChatResponse(
        reply=get_fallback_response(request.message),
        status="fallback"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", message="Society Management API is running")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)