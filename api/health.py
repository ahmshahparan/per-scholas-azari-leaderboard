from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from lib.auth import get_cors_headers

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()

    def do_GET(self):
        """Handle health check requests"""
        try:
            # Set CORS headers
            headers = get_cors_headers()
            for key, value in headers.items():
                self.send_header(key, value)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response_data = {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "service": "Per Scholas Azari Leaderboard API",
                "version": "1.0.0",
                "endpoints": {
                    "auth": "/api/auth/login",
                    "upload": "/api/data/upload",
                    "results": "/api/data/results",
                    "clear": "/api/data/clear",
                    "health": "/api/health"
                }
            }
            
            self.wfile.write(json.dumps(response_data).encode())

        except Exception as e:
            print(f"Error in health endpoint: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "unhealthy",
                "error": "Internal server error"
            }).encode())

    def do_POST(self):
        """Handle POST requests (not allowed for health)"""
        self.send_response(405)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Method not allowed"}).encode())

