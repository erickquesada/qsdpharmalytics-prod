#!/usr/bin/env python3
"""
QSDPharmalitics Backend API Comprehensive Test Suite
Tests all endpoints according to the review request specifications
"""

import requests
import json
import time
from typing import Dict, Any, Optional
import sys
import os

# Configuration
BASE_URL = "https://pharma-analytics-db.preview.emergentagent.com"
API_V1_PREFIX = "/api/v1"

class QSDPharmaliticsAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.api_v1_url = f"{BASE_URL}{API_V1_PREFIX}"
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.test_results = []
        self.admin_user_id = None
        
        # Test data
        self.test_user_data = {
            "email": "john.doe@pharmalitics.com",
            "username": "johndoe",
            "password": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
            "role": "analyst",
            "phone": "+1234567890",
            "department": "Analytics"
        }
        
        self.test_admin_data = {
            "email": "admin@pharmalitics.com", 
            "username": "admin",
            "password": "admin",
            "first_name": "System",
            "last_name": "Administrator",
            "role": "admin"
        }
        
        self.test_product_data = {
            "code": "ASPIRIN-100MG",
            "name": "Aspirin",
            "brand": "PharmaCorp",
            "manufacturer": "PharmaCorp Industries",
            "description": "Pain relief medication",
            "active_ingredient": "Acetylsalicylic acid",
            "dosage": "100mg",
            "package_size": "30 tablets",
            "unit_price": 12.99,
            "suggested_retail_price": 15.99,
            "cost_price": 8.50,
            "therapeutic_class": "Analgesic",
            "controlled_substance": False,
            "prescription_required": False,
            "ndc_number": "12345-678-90",
            "expiry_monitoring": True,
            "is_available": True
        }
        
        self.test_pharmacy_data = {
            "name": "Central Pharmacy",
            "license_number": "PH-2024-001",
            "address": "123 Main Street",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
            "phone": "+1-555-0123",
            "email": "info@centralpharmacy.com",
            "manager_name": "Sarah Johnson",
            "chain_name": "Independent",
            "is_active": True
        }

    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        if response_data:
            result["response"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")

    def make_request(self, method: str, url: str, **kwargs) -> requests.Response:
        """Make HTTP request with error handling"""
        try:
            if self.access_token and 'headers' not in kwargs:
                kwargs['headers'] = {'Authorization': f'Bearer {self.access_token}'}
            elif self.access_token and 'headers' in kwargs:
                kwargs['headers']['Authorization'] = f'Bearer {self.access_token}'
            
            response = self.session.request(method, url, timeout=30, **kwargs)
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise

    def test_root_endpoint(self):
        """Test GET / - Root endpoint"""
        try:
            # The root endpoint returns HTML (frontend), so we'll test the API root instead
            response = self.make_request('GET', f"{self.base_url}/api")
            
            if response.status_code == 200:
                # Try to parse as JSON, but handle HTML response
                try:
                    data = response.json()
                    if "QSDPharmalitics" in str(data):
                        self.log_result("Root Endpoint", True, f"Status: {response.status_code}, API accessible")
                    else:
                        self.log_result("Root Endpoint", True, f"Status: {response.status_code}, API responding")
                except:
                    # If not JSON, check if it's a valid response
                    if response.status_code == 200:
                        self.log_result("Root Endpoint", True, f"Status: {response.status_code}, API accessible")
                    else:
                        self.log_result("Root Endpoint", False, f"Status: {response.status_code}")
            else:
                self.log_result("Root Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Exception: {str(e)}")

    def test_health_check(self):
        """Test GET /api/v1/health - Health check"""
        try:
            response = self.make_request('GET', f"{self.api_v1_url}/health")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("Health Check", True, f"Status: healthy, Version: {data.get('version')}")
                else:
                    self.log_result("Health Check", False, f"Unhealthy status: {data}")
            else:
                self.log_result("Health Check", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")

    def test_user_registration(self):
        """Test POST /api/v1/auth/register - User registration"""
        try:
            response = self.make_request('POST', f"{self.api_v1_url}/auth/register", 
                                      json=self.test_user_data)
            
            if response.status_code == 201:
                data = response.json()
                if data.get("email") == self.test_user_data["email"]:
                    self.log_result("User Registration", True, f"User created: {data.get('username')}")
                else:
                    self.log_result("User Registration", False, f"Unexpected response: {data}")
            elif response.status_code == 400 and "already" in response.text.lower():
                self.log_result("User Registration", True, "User already exists (expected for repeated tests)")
            else:
                self.log_result("User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("User Registration", False, f"Exception: {str(e)}")

    def test_admin_creation(self):
        """Test creating admin user for testing"""
        try:
            response = self.make_request('POST', f"{self.api_v1_url}/auth/create-admin")
            
            if response.status_code == 201:
                data = response.json()
                self.admin_user_id = data.get("id")
                self.log_result("Admin User Creation", True, f"Admin created: {data.get('username')}")
            elif response.status_code == 400 and "already exists" in response.text.lower():
                self.log_result("Admin User Creation", True, "Admin already exists (expected)")
            else:
                self.log_result("Admin User Creation", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Admin User Creation", False, f"Exception: {str(e)}")

    def test_user_login(self):
        """Test POST /api/v1/auth/login - User login"""
        try:
            # Try admin login first
            login_data = {
                "username_or_email": "admin",
                "password": "admin"
            }
            
            response = self.make_request('POST', f"{self.api_v1_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                self.refresh_token = data.get("refresh_token")
                
                if self.access_token and data.get("token_type") == "bearer":
                    self.log_result("User Login (Admin)", True, f"Token received, expires in: {data.get('expires_in')}s")
                else:
                    self.log_result("User Login (Admin)", False, f"Invalid token response: {data}")
            else:
                self.log_result("User Login (Admin)", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("User Login (Admin)", False, f"Exception: {str(e)}")

    def test_token_refresh(self):
        """Test POST /api/v1/auth/refresh - Token refresh"""
        if not self.refresh_token:
            self.log_result("Token Refresh", False, "No refresh token available")
            return
            
        try:
            # The refresh endpoint expects the token as a query parameter
            response = self.make_request('POST', f"{self.api_v1_url}/auth/refresh?refresh_token={self.refresh_token}")
            
            if response.status_code == 200:
                data = response.json()
                new_access_token = data.get("access_token")
                
                if new_access_token and new_access_token != self.access_token:
                    self.access_token = new_access_token
                    self.refresh_token = data.get("refresh_token")
                    self.log_result("Token Refresh", True, "New tokens received")
                else:
                    self.log_result("Token Refresh", False, f"Invalid refresh response: {data}")
            else:
                self.log_result("Token Refresh", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Token Refresh", False, f"Exception: {str(e)}")

    def test_get_current_user(self):
        """Test GET /api/v1/users/me - Get current user"""
        if not self.access_token:
            self.log_result("Get Current User", False, "No access token available")
            return
            
        try:
            response = self.make_request('GET', f"{self.api_v1_url}/users/me")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("username"):
                    self.log_result("Get Current User", True, f"User: {data.get('username')}, Role: {data.get('role')}")
                else:
                    self.log_result("Get Current User", False, f"Invalid user data: {data}")
            else:
                self.log_result("Get Current User", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Get Current User", False, f"Exception: {str(e)}")

    def test_create_product_category(self):
        """Test creating product category first"""
        if not self.access_token:
            self.log_result("Create Product Category", False, "No access token available")
            return
            
        try:
            category_data = {
                "name": "Pain Relief",
                "description": "Medications for pain management",
                "is_active": True
            }
            
            response = self.make_request('POST', f"{self.api_v1_url}/products/categories", 
                                      json=category_data)
            
            if response.status_code == 201:
                data = response.json()
                self.test_product_data["category_id"] = data.get("id")
                self.log_result("Create Product Category", True, f"Category created: {data.get('name')}")
            elif response.status_code == 400 and "already exists" in response.text.lower():
                # Get existing category
                response = self.make_request('GET', f"{self.api_v1_url}/products/categories")
                if response.status_code == 200:
                    categories = response.json()
                    for cat in categories:
                        if cat.get("name") == "Pain Relief":
                            self.test_product_data["category_id"] = cat.get("id")
                            break
                self.log_result("Create Product Category", True, "Category already exists")
            else:
                self.log_result("Create Product Category", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Create Product Category", False, f"Exception: {str(e)}")

    def test_create_product(self):
        """Test POST /api/v1/products - Create product"""
        if not self.access_token:
            self.log_result("Create Product", False, "No access token available")
            return
            
        try:
            response = self.make_request('POST', f"{self.api_v1_url}/products", 
                                      json=self.test_product_data)
            
            if response.status_code == 201:
                data = response.json()
                if data.get("code") == self.test_product_data["code"]:
                    self.log_result("Create Product", True, f"Product created: {data.get('name')} ({data.get('code')})")
                else:
                    self.log_result("Create Product", False, f"Unexpected response: {data}")
            elif response.status_code == 400 and "already exists" in response.text.lower():
                self.log_result("Create Product", True, "Product already exists (expected for repeated tests)")
            else:
                self.log_result("Create Product", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Create Product", False, f"Exception: {str(e)}")

    def test_get_products(self):
        """Test GET /api/v1/products - List products"""
        if not self.access_token:
            self.log_result("Get Products", False, "No access token available")
            return
            
        try:
            response = self.make_request('GET', f"{self.api_v1_url}/products")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Products", True, f"Retrieved {len(data)} products")
                else:
                    self.log_result("Get Products", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("Get Products", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Get Products", False, f"Exception: {str(e)}")

    def test_create_pharmacy(self):
        """Test POST /api/v1/pharmacies - Create pharmacy"""
        if not self.access_token:
            self.log_result("Create Pharmacy", False, "No access token available")
            return
            
        try:
            response = self.make_request('POST', f"{self.api_v1_url}/pharmacies", 
                                      json=self.test_pharmacy_data)
            
            if response.status_code == 201:
                data = response.json()
                if data.get("name") == self.test_pharmacy_data["name"]:
                    self.log_result("Create Pharmacy", True, f"Pharmacy created: {data.get('name')}")
                else:
                    self.log_result("Create Pharmacy", False, f"Unexpected response: {data}")
            elif response.status_code == 400 and "already exists" in response.text.lower():
                self.log_result("Create Pharmacy", True, "Pharmacy already exists (expected for repeated tests)")
            else:
                self.log_result("Create Pharmacy", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Create Pharmacy", False, f"Exception: {str(e)}")

    def test_get_pharmacies(self):
        """Test GET /api/v1/pharmacies - List pharmacies"""
        if not self.access_token:
            self.log_result("Get Pharmacies", False, "No access token available")
            return
            
        try:
            response = self.make_request('GET', f"{self.api_v1_url}/pharmacies")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Pharmacies", True, f"Retrieved {len(data)} pharmacies")
                else:
                    self.log_result("Get Pharmacies", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("Get Pharmacies", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Get Pharmacies", False, f"Exception: {str(e)}")

    def test_analytics_dashboard(self):
        """Test GET /api/v1/analytics/dashboard-summary - Dashboard data"""
        if not self.access_token:
            self.log_result("Analytics Dashboard", False, "No access token available")
            return
            
        try:
            response = self.make_request('GET', f"{self.api_v1_url}/analytics/dashboard-summary")
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Analytics Dashboard", True, f"Dashboard data retrieved: {data.get('total_revenue', 'N/A')} revenue")
            else:
                self.log_result("Analytics Dashboard", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Analytics Dashboard", False, f"Exception: {str(e)}")

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        try:
            # Temporarily remove token
            temp_token = self.access_token
            self.access_token = None
            
            response = self.make_request('GET', f"{self.api_v1_url}/products")
            
            if response.status_code == 401:
                self.log_result("Unauthorized Access Test", True, "Correctly rejected unauthorized request")
            else:
                self.log_result("Unauthorized Access Test", False, f"Expected 401, got {response.status_code}")
            
            # Restore token
            self.access_token = temp_token
            
        except Exception as e:
            self.log_result("Unauthorized Access Test", False, f"Exception: {str(e)}")

    def test_invalid_endpoints(self):
        """Test 404 handling for invalid endpoints"""
        try:
            response = self.make_request('GET', f"{self.api_v1_url}/nonexistent")
            
            if response.status_code == 404:
                self.log_result("404 Error Handling", True, "Correctly returned 404 for invalid endpoint")
            else:
                self.log_result("404 Error Handling", False, f"Expected 404, got {response.status_code}")
                
        except Exception as e:
            self.log_result("404 Error Handling", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🧪 Starting QSDPharmalitics Backend API Tests...")
        print(f"🌐 Base URL: {self.base_url}")
        print(f"🔗 API URL: {self.api_v1_url}")
        print("=" * 60)
        
        # Basic connectivity tests
        self.test_root_endpoint()
        self.test_health_check()
        
        # Authentication flow
        self.test_admin_creation()
        self.test_user_registration()
        self.test_user_login()
        self.test_token_refresh()
        self.test_get_current_user()
        
        # CRUD operations (requires authentication)
        self.test_create_product_category()
        self.test_create_product()
        self.test_get_products()
        self.test_create_pharmacy()
        self.test_get_pharmacies()
        
        # Analytics
        self.test_analytics_dashboard()
        
        # Security tests
        self.test_unauthorized_access()
        self.test_invalid_endpoints()
        
        # Summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['details']}")
        
        print("\n" + "=" * 60)
        return passed, failed


if __name__ == "__main__":
    tester = QSDPharmaliticsAPITester()
    tester.run_all_tests()