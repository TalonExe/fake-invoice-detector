import boto3
import uuid
import os
from datetime import datetime, timezone
from decimal import Decimal # <--- 1. IMPORT THE DECIMAL LIBRARY
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from botocore.exceptions import NoCredentialsError, ClientError

# --- Application Setup ---
app = FastAPI()
load_dotenv()

# --- CORS Configuration ---
origins = ["http://localhost:5173", "localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AWS Configuration ---
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
DYNAMODB_TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME")

# --- AWS Service Clients ---
try:
    s3_client = boto3.client('s3')
    rekognition_client = boto3.client('rekognition')
    dynamodb_resource = boto3.resource('dynamodb')
    dynamodb_table = dynamodb_resource.Table(DYNAMODB_TABLE_NAME)
except (NoCredentialsError, ClientError):
    s3_client = rekognition_client = dynamodb_table = None
    print("WARNING: AWS credentials not found or invalid. API endpoints will not work.")
except Exception as e:
    s3_client = rekognition_client = dynamodb_table = None
    print(f"ERROR: Failed to initialize AWS clients: {e}")


# --- 2. ADD THIS HELPER FUNCTION ---
# This function recursively traverses a Python object (dicts, lists)
# and converts any float values into Decimal objects.
def replace_floats_with_decimals(obj):
    if isinstance(obj, list):
        return [replace_floats_with_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: replace_floats_with_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, float):
        # Convert float to string to avoid precision loss, then to Decimal
        return Decimal(str(obj))
    else:
        return obj


# --- API Endpoints ---
@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to your todo list."}


@app.post("/extract-text", tags=["rekognition"])
async def extract_text_from_image(image: UploadFile = File(...)):
    if not all([s3_client, rekognition_client, dynamodb_table]):
        raise HTTPException(status_code=500, detail="AWS services are not configured.")
        
    if not S3_BUCKET_NAME or not DYNAMODB_TABLE_NAME:
        raise HTTPException(status_code=500, detail="S3 Bucket or DynamoDB table name not configured in environment.")

    image_bytes = await image.read()
    receipt_id = str(uuid.uuid4())
    s3_key = f"uploads/{receipt_id}-{image.filename}"

    try:
        s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=s3_key, Body=image_bytes, ContentType=image.content_type)
        s3_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"

        response = rekognition_client.detect_text(Image={'Bytes': image_bytes})
        detected_text_with_floats = response.get('TextDetections', [])

        # --- 3. USE THE HELPER FUNCTION BEFORE SAVING ---
        # Create a deep copy of the results that is safe for DynamoDB
        detected_text_for_dynamo = replace_floats_with_decimals(detected_text_with_floats)

        timestamp = datetime.now(timezone.utc).isoformat()
        item_to_store = {
            'receipt_id': receipt_id,
            's3_url': s3_url,
            'filename': image.filename,
            'upload_timestamp': timestamp,
            'detected_text': detected_text_for_dynamo # Use the converted data here
        }
        dynamodb_table.put_item(Item=item_to_store)

        # Return the original data (with floats) to the frontend,
        # as JavaScript handles standard numbers correctly.
        return {"text_detections": detected_text_with_floats}

    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        print(f"AWS ClientError ({error_code}): {e}")
        raise HTTPException(status_code=500, detail=f"An AWS error occurred: {error_code}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@app.get("/history", tags=["history"])
async def get_analysis_history():
    if not dynamodb_table:
        raise HTTPException(status_code=500, detail="DynamoDB is not configured.")
    try:
        response = dynamodb_table.scan()
        # Note: Boto3 automatically converts Decimals back to floats when reading
        # from DynamoDB, so no conversion is needed here.
        return response.get('Items', [])
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history from DynamoDB: {e}")