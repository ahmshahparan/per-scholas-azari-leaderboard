import os
import json
from datetime import datetime
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """Initialize and return Supabase client"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY")
    
    if not url or not key:
        raise ValueError("Supabase URL and key must be set in environment variables")
    
    return create_client(url, key)

def save_analysis_results(results_data):
    """Save analysis results to Supabase"""
    supabase = get_supabase_client()
    
    # Prepare data for insertion
    data = {
        "created_at": datetime.utcnow().isoformat(),
        "summary_stats": json.dumps(results_data["summaryStats"]),
        "ranking_data": json.dumps(results_data["rankingData"]),
        "raw_data_count": len(results_data.get("rawData", []))
    }
    
    try:
        # Insert new results (this will replace any existing data)
        result = supabase.table("analysis_results").insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error saving analysis results: {e}")
        raise

def get_latest_analysis_results():
    """Get the most recent analysis results from Supabase"""
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("analysis_results").select("*").order("created_at", desc=True).limit(1).execute()
        
        if result.data:
            data = result.data[0]
            return {
                "summaryStats": json.loads(data["summary_stats"]),
                "rankingData": json.loads(data["ranking_data"]),
                "createdAt": data["created_at"],
                "rawDataCount": data["raw_data_count"]
            }
        return None
    except Exception as e:
        print(f"Error fetching analysis results: {e}")
        raise

def clear_analysis_results():
    """Clear all analysis results from Supabase"""
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("analysis_results").delete().neq("id", 0).execute()
        return True
    except Exception as e:
        print(f"Error clearing analysis results: {e}")
        raise

def save_admin_session(token, expires_at):
    """Save admin session token to Supabase"""
    supabase = get_supabase_client()
    
    data = {
        "token": token,
        "created_at": datetime.utcnow().isoformat(),
        "expires_at": expires_at.isoformat()
    }
    
    try:
        result = supabase.table("admin_sessions").insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error saving admin session: {e}")
        raise

def validate_admin_session(token):
    """Validate admin session token"""
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("admin_sessions").select("*").eq("token", token).gt("expires_at", datetime.utcnow().isoformat()).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error validating admin session: {e}")
        return False

