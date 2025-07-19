from fastapi import FastAPI, HTTPException, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio

load_dotenv()

database = None

#app = FastAPI(docs_url=None, redoc_url=None)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def create_tokens(email, userid, role, time_delay=15):
    REFRESH_KEY = os.getenv("REFRESH_KEY")
    ACCESS_KEY = os.getenv("ACCESS_KEY")
    
    algorithm = "HS256"
    
    now = time.time()
    
    access_payload = {
        "exp": now + time_delay,
        "iat": now,
        "email": email,
        "role": role,
        "sub": userid
    }
    
    refresh_payload = {
        "exp": now + (60 * 60 * 24 * 7),
        "iat": now,
        "email": email,
        "sub": userid
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



    print("start up completed")





if __name__ == "__main__":
    print("hello world")
