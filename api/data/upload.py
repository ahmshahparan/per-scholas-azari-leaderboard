from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from lib.auth import verify_admin_token, get_cors_headers
from lib.gamification import process_csv_data
from lib.database import save_analysis_results

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()

    def do_POST(self):
        """Handle CSV data upload and processing"""
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
            
            csv_content = data.get('csvData')
            if not csv_content:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "CSV data required"}).encode())
                return

            # Process CSV data using gamification analysis
            try:
                analysis_results = process_csv_data(csv_content)
            except Exception as e:
                print(f"Error processing CSV: {e}")
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Error processing CSV data: {str(e)}"
                }).encode())
                return

            # Save results to Supabase
            try:
                saved_result = save_analysis_results(analysis_results)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "Data processed and saved successfully",
                    "summary": analysis_results["summaryStats"]
                }).encode())
                
            except Exception as e:
                print(f"Error saving to database: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Error saving data: {str(e)}"
                }).encode())

        except Exception as e:
            print(f"Error in upload endpoint: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Internal server error"
            }).encode())

    def do_GET(self):
        """Handle GET requests (not allowed for upload)"""
        self.send_response(405)
        headers = get_cors_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Method not allowed"}).encode())

