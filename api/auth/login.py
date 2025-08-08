from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from lib.auth import validate_admin_credentials, generate_admin_token, get_cors_headers

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()

    def do_POST(self):
        """Handle admin login"""
        try:
            # Set CORS headers
            headers = get_cors_headers()
            for key, value in headers.items():
                self.send_header(key, value)

            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No data provided"}).encode())
                return

            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Username and password required"}).encode())
                return
            
            # Validate credentials
            if validate_admin_credentials(username, password):
                # Generate JWT token
                token = generate_admin_token()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "token": token,
                    "message": "Login successful"
                }).encode())
            else:
                self.send_response(401)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Invalid credentials"
                }).encode())
                
        except Exception as e:
            print(f"Error in login endpoint: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Internal server error"
            }).encode())

    def do_GET(self):
        """Handle GET requests (not allowed for login)"""
        self.send_response(405)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Method not allowed"}).encode())

