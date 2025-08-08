from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from lib.auth import get_cors_headers
from lib.database import get_latest_analysis_results

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()

    def do_GET(self):
        """Handle fetching latest analysis results (public endpoint)"""
        try:
            # Set CORS headers
            headers = get_cors_headers()
            for key, value in headers.items():
                self.send_header(key, value)

            # Fetch latest results from Supabase
            try:
                results = get_latest_analysis_results()
                
                if results:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "success": True,
                        "data": results
                    }).encode())
                else:
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "success": False,
                        "message": "No analysis results found"
                    }).encode())
                    
            except Exception as e:
                print(f"Error fetching results: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Error fetching data: {str(e)}"
                }).encode())

        except Exception as e:
            print(f"Error in results endpoint: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Internal server error"
            }).encode())

    def do_POST(self):
        """Handle POST requests (not allowed for results)"""
        self.send_response(405)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Method not allowed"}).encode())

