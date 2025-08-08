import os
import jwt
from datetime import datetime, timedelta
from lib.database import save_admin_session, validate_admin_session

def validate_admin_credentials(username, password):
    """Validate admin credentials against environment variables"""
    admin_username = os.environ.get("ADMIN_USERNAME")
    admin_password = os.environ.get("ADMIN_PASSWORD")
    
    if not admin_username or not admin_password:
        raise ValueError("Admin credentials not configured")
    
    return username == admin_username and password == admin_password

def generate_admin_token():
    """Generate JWT token for admin authentication"""
    jwt_secret = os.environ.get("JWT_SECRET")
    if not jwt_secret:
        raise ValueError("JWT secret not configured")
    
    # Token expires in 24 hours
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    payload = {
        "admin": True,
        "exp": expires_at,
        "iat": datetime.utcnow()
    }
    
    token = jwt.encode(payload, jwt_secret, algorithm="HS256")
    
    # Save session to database
    save_admin_session(token, expires_at)
    
    return token

def verify_admin_token(authorization_header):
    """Verify admin JWT token from Authorization header"""
    if not authorization_header:
        return False
    
    try:
        # Extract token from "Bearer <token>" format
        if not authorization_header.startswith("Bearer "):
            return False
        
        token = authorization_header.split(" ")[1]
        
        # Verify JWT token
        jwt_secret = os.environ.get("JWT_SECRET")
        if not jwt_secret:
            return False
        
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        
        # Check if token is for admin
        if not payload.get("admin"):
            return False
        
        # Validate session in database
        return validate_admin_session(token)
        
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False
    except Exception as e:
        print(f"Error verifying admin token: {e}")
        return False

def get_cors_headers():
    """Get CORS headers for API responses"""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
    }

