from fastapi import FastAPI, HTTPException, Request, Form, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import bcrypt
import time
import jwt



load_dotenv()

database = None

#app = FastAPI(docs_url=None, redoc_url=None)
app = FastAPI()

limiter = Limiter(key_func=get_remote_address)


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def create_tokens(time_delay=180):
    REFRESH_KEY = os.getenv("REFRESH_KEY")
    ACCESS_KEY = os.getenv("ACCESS_KEY")
    
    algorithm = "HS256"
    
    now = time.time()
    
    access_payload = {
        "exp": now + time_delay,
        "iat": now,
        "sub": "10kseals_admin"
    }
    
    refresh_payload = {
        "exp": now + (60 * 60 * 24 * 7),
        "iat": now,
        "sub": "10kseals_admin"
    }
    
    access_token = jwt.encode(access_payload, ACCESS_KEY, algorithm=algorithm)
    refresh_token = jwt.encode(refresh_payload, REFRESH_KEY, algorithm=algorithm)
    
    return access_token, refresh_token

def decode_token(token, key):
    algorithm = "HS256"
    
    try:
        access_data = jwt.decode(token, key, algorithms=[algorithm])
        
        return access_data

    except jwt.exceptions.InvalidSignatureError:
        print("Signature verification failed.")
        return None
    except jwt.exceptions.ExpiredSignatureError:
        print("Token has expired.")
        return None
    except jwt.exceptions.InvalidTokenError:
        print("Invalid token format")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None








@app.on_event("startup")
async def startup():
    global database

    DB_URL = os.getenv("DB_URL")


    database = AsyncIOMotorClient(DB_URL)

    app.state.db = database
    db = database["powerwash"]["admin"]
    
    admin_user = await db.find_one({"username": "10kseals_admin"}, {"_id": 0})
    
    if not admin_user:
        print("new account!")
        db.insert_one({"username": "10kseals_admin", "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt())})

    print("start up completed")


class LoginData(BaseModel):
    username: str
    password: str
@app.post("/login")
@limiter.limit("6/minute")
async def login(data: LoginData, request: Request, response: Response):
    db = app.state.db["powerwash"]["admin"]
    
    admin_user = await db.find_one({"username": data.username})
    
    if not admin_user:
        raise HTTPException(status_code=401, detail="you are not permited")
    
    
    if not bcrypt.checkpw(data.password.encode(), admin_user["password"]):
        raise HTTPException(status_code=401, detail="you are not permited")
    

    access_token, refresh_token = create_tokens()

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
        path="/",
        #domain=os.getenv("DOMAIN")
    )


    return {"access_token": access_token}


@app.post("/refresh")
async def refresh(request: Request, response: Response):
    db = request.app.state.db
    refresh_token = request.cookies.get("refresh_token")
    
    print(refresh_token)
    payload = decode_token(refresh_token, os.getenv("REFRESH_KEY"))
    
    if not payload:
        raise HTTPException(status_code=403, detail="expired refresh token")
    

    access_token, refresh_token = create_tokens()
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
        path="/",
        #domain=os.getenv("DOMAIN")
    )

    return {"access_token": access_token}

if __name__ == "__main__":
    print("hello world")
