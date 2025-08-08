#!/usr/bin/env python3
"""
Simple test script to verify API structure and imports
Run this to check if all dependencies and imports work correctly
"""

import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.dirname(__file__))

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        # Test lib imports
        from lib.auth import validate_admin_credentials, generate_admin_token, verify_admin_token, get_cors_headers
        print("✅ lib.auth imported successfully")
        
        from lib.database import get_supabase_client, save_analysis_results, get_latest_analysis_results
        print("✅ lib.database imported successfully")
        
        from lib.gamification import process_csv_data, calculate_user_scores, identify_achievements
        print("✅ lib.gamification imported successfully")
        
        # Test external dependencies
        import jwt
        print("✅ PyJWT imported successfully")
        
        import pandas as pd
        print("✅ pandas imported successfully")
        
        # Note: supabase import will fail without credentials, but that's expected
        print("✅ All core imports successful")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    
    return True

def test_cors_headers():
    """Test CORS headers function"""
    print("\\nTesting CORS headers...")
    
    try:
        from lib.auth import get_cors_headers
        headers = get_cors_headers()
        
        required_headers = [
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods", 
            "Access-Control-Allow-Headers"
        ]
        
        for header in required_headers:
            if header in headers:
                print(f"✅ {header}: {headers[header]}")
            else:
                print(f"❌ Missing header: {header}")
                return False
                
        return True
        
    except Exception as e:
        print(f"❌ CORS headers test failed: {e}")
        return False

def test_gamification_logic():
    """Test gamification analysis with sample data"""
    print("\\nTesting gamification logic...")
    
    try:
        from lib.gamification import analyze_question_quality, process_csv_data
        
        # Test question analysis
        result = analyze_question_quality(
            "How do I prepare for AWS certification exam?",
            "Here's a comprehensive guide to AWS certification preparation..."
        )
        
        print(f"✅ Question analysis: {result['points']} points")
        print(f"   Criteria: {result['criteria']}")
        
        # Test CSV processing with minimal data
        sample_csv = """email,first,last,input,outputs,credits,course_name,course_id,instance_ainame,success,query_duration_ms,ttft,created
test@example.com,Test,User,Sample question,Sample answer,5,Test Course,test-101,Azari,TRUE,2000,100,2024-01-15T10:30:00Z"""
        
        results = process_csv_data(sample_csv)
        print(f"✅ CSV processing successful")
        print(f"   Users processed: {results['summaryStats']['totalUsers']}")
        print(f"   Total interactions: {results['summaryStats']['totalInteractions']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Gamification logic test failed: {e}")
        return False

def check_file_structure():
    """Check if all required files exist"""
    print("\\nChecking file structure...")
    
    required_files = [
        "api/auth/login.py",
        "api/data/upload.py", 
        "api/data/results.py",
        "api/data/clear.py",
        "api/health.py",
        "lib/auth.py",
        "lib/database.py",
        "lib/gamification.py",
        "requirements.txt",
        "vercel.json",
        "supabase-schema.sql"
    ]
    
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ Missing: {file_path}")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests"""
    print("🧪 Gamification Analyzer API Tests")
    print("=" * 50)
    
    tests = [
        ("File Structure", check_file_structure),
        ("Imports", test_imports),
        ("CORS Headers", test_cors_headers),
        ("Gamification Logic", test_gamification_logic)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\\n🔍 Running {test_name} test...")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {e}")
            results.append((test_name, False))
    
    print("\\n" + "=" * 50)
    print("📊 Test Summary:")
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\\n🎯 {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\\n🎉 All tests passed! API is ready for deployment.")
    else:
        print("\\n⚠️  Some tests failed. Please check the issues above.")

if __name__ == "__main__":
    main()

