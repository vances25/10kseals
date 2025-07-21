from fastapi import FastAPI, HTTPException, Request, Form, Header, Response, File, UploadFile
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
import uuid
from fastapi.staticfiles import StaticFiles
import time



load_dotenv()

database = None


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


#app = FastAPI(docs_url=None, redoc_url=None)
app = FastAPI()

limiter = Limiter(key_func=get_remote_address)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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


@app.post("/upload_pictures")
async def upload_pictures(
    request: Request,
    after: UploadFile = File(...),
    before: UploadFile = File(...),
    Authorization: str = Header(...)
):
    db = request.app.state.db
    
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}

    try:
        result = decode_token(Authorization.split("Bearer ")[1], os.getenv("ACCESS_KEY"))
        if not result:
            raise HTTPException(status_code=403, detail="Unauthorized")
    except:
        raise HTTPException(status_code=403, detail="bad format")

    file_id = str(uuid.uuid4()).split("-")[-1]

    # Extract file extensions
    _, before_ext = os.path.splitext(before.filename)
    _, after_ext = os.path.splitext(after.filename)

    if before_ext not in ALLOWED_EXTENSIONS or after_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG, JPEG, PNG, and WEBP files are allowed")


    # Set full filenames with extensions
    before_filename = f"uploads/before_{file_id}{before_ext}"
    after_filename = f"uploads/after_{file_id}{after_ext}"
    
    db["powerwash"]["uploads"].insert_one({
        "before_file": f"before_{file_id}{before_ext}",
        "after_file": f"after_{file_id}{after_ext}",
        "uploaded_at": time.time()
        })

    # Write before picture
    with open(before_filename, "wb") as f:
        f.write(await before.read())

    # Write after picture
    with open(after_filename, "wb") as f:
        f.write(await after.read())

    return {"before": before_filename, "after": after_filename}
    
    
@app.get("/get_photos")
async def get_photos(
    request: Request,
    limit: int | None = 10000
):
    db = request.app.state.db
    
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


    all_photos = await db["powerwash"]["uploads"].find({}, {"_id": 0}).sort("uploaded_at", -1).to_list(length=limit)
    
    
    

    return {"detail": "success", "photos": all_photos}


@app.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="refresh_token",
        path="/",
    )
    return {"detail": "Logged out"}


@app.delete("/delete_photo")
async def delete_photo(
    before: str,
    after: str,
    request: Request,
    Authorization: str = Header(...),
):
    db = request.app.state.db

    try:
        result = decode_token(Authorization.split("Bearer ")[1], os.getenv("ACCESS_KEY"))
        if not result:
            raise HTTPException(status_code=403, detail="Unauthorized")
    except:
        raise HTTPException(status_code=403, detail="bad format")
    
    
    await db["powerwash"]["uploads"].delete_one({"after_file": after})

    base_path = os.path.join(os.getcwd(), "uploads")  # safer base path

    before_path = os.path.join(base_path, before)
    after_path = os.path.join(base_path, after)

    for path in [before_path, after_path]:
        if os.path.exists(path):
            os.remove(path)
        else:
            print(f"File not found: {path}")

    return {"detail": f"succesfully deleted photo pair set with {after}"}


class ChangePassword(BaseModel):
    old_password: str
    new_password: str
@app.post("/change_password")
async def change_password(
    data: ChangePassword,
    request: Request,
    Authorization: str = Header(...),
):
    db = request.app.state.db

    try:
        result = decode_token(Authorization.split("Bearer ")[1], os.getenv("ACCESS_KEY"))
        if not result:
            raise HTTPException(status_code=403, detail="Unauthorized")
    except:
        raise HTTPException(status_code=403, detail="bad format")
    
    admin_user = await db["powerwash"]["admin"].find_one({"username": "10kseals_admin"}, {"_id": 0})
    
    
    if not bcrypt.checkpw(data.old_password.encode(), admin_user["password"]):
        raise HTTPException(status_code=401, detail="incorrect password!")
    
    
    db["powerwash"]["admin"].update_one({"username": "10kseals_admin"}, {"$set": {"password": bcrypt.hashpw(data.new_password.encode(), bcrypt.gensalt())}})
    
    return {"detail": "new password set!"}
    
    
    
    

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
