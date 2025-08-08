from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from lib.auth import verify_admin_token, get_cors_headers
from lib.database import clear_analysis_results

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()

    def do_DELETE(self):
        """Handle clearing analysis data (admin only)"""
        try:
            # Set CORS headers
            headers = get_cors_headers()
            for key, value in headers.items():
                self.send_header(key, value)

            # Verify admin token
            auth_header = self.headers.get('Authorization')
            if not verify_admin_token(auth_header):
                self.send_response(401)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Unauthorized. Admin access required."
                }).encode())
                return

            # Clear analysis results from Supabase
            try:
                clear_analysis_results()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "Analysis data cleared successfully"
                }).encode())
                
            except Exception as e:
                print(f"Error clearing data: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Error clearing data: {str(e)}"
                }).encode())

        except Exception as e:
            print(f"Error in clear endpoint: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Internal server error"
            }).encode())

    def do_POST(self):
        """Handle POST requests (redirect to DELETE)"""
        self.do_DELETE()

    def do_GET(self):
        """Handle GET requests (not allowed for clear)"""
        self.send_response(405)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Method not allowed"}).encode())

