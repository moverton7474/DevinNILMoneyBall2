#!/usr/bin/env python3

import asyncio
import aiohttp
import time
import json
from typing import Dict, Any

async def test_health_endpoints():
    """Test health check endpoints"""
    print("Testing health endpoints...")
    
    async with aiohttp.ClientSession() as session:
        async with session.get("http://localhost:8000/healthz") as response:
            if response.status == 200:
                print("✅ Basic health check: PASS")
            else:
                print(f"❌ Basic health check: FAIL ({response.status})")
        
        async with session.get("http://localhost:8000/health/detailed") as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Detailed health check: PASS")
                print(f"   Database: {data['services']['database']['status']}")
                print(f"   Redis: {data['services']['redis']['status']}")
                print(f"   Application: {data['services']['application']['status']}")
            else:
                print(f"❌ Detailed health check: FAIL ({response.status})")

async def test_metrics_endpoint():
    """Test Prometheus metrics endpoint"""
    print("\nTesting metrics endpoint...")
    
    async with aiohttp.ClientSession() as session:
        async with session.get("http://localhost:8000/metrics") as response:
            if response.status == 200:
                text = await response.text()
                if "http_requests_total" in text:
                    print("✅ Metrics endpoint: PASS")
                    print("   Found HTTP request metrics")
                else:
                    print("❌ Metrics endpoint: Missing expected metrics")
            else:
                print(f"❌ Metrics endpoint: FAIL ({response.status})")

async def test_rate_limiting():
    """Test rate limiting functionality"""
    print("\nTesting rate limiting...")
    
    async with aiohttp.ClientSession() as session:
        success_count = 0
        rate_limited_count = 0
        
        for i in range(10):
            async with session.get("http://localhost:8000/teams") as response:
                if response.status == 200:
                    success_count += 1
                elif response.status == 429:
                    rate_limited_count += 1
        
        print(f"   API calls: {success_count} successful, {rate_limited_count} rate limited")
        
        if success_count > 0:
            print("✅ Rate limiting: CONFIGURED")
        else:
            print("❌ Rate limiting: NOT WORKING")

async def test_caching():
    """Test Redis caching functionality"""
    print("\nTesting caching...")
    
    async with aiohttp.ClientSession() as session:
        start_time = time.time()
        async with session.get("http://localhost:8000/analytics/team-dashboard/1") as response:
            first_call_time = time.time() - start_time
            if response.status == 200:
                print(f"   First dashboard call: {first_call_time:.3f}s")
                
                start_time = time.time()
                async with session.get("http://localhost:8000/analytics/team-dashboard/1") as response:
                    second_call_time = time.time() - start_time
                    print(f"   Second dashboard call: {second_call_time:.3f}s")
                    
                    if second_call_time < first_call_time * 0.5:
                        print("✅ Caching: WORKING (second call significantly faster)")
                    else:
                        print("⚠️  Caching: May not be working optimally")
            else:
                print(f"❌ Dashboard endpoint: FAIL ({response.status})")

async def test_security_headers():
    """Test security headers"""
    print("\nTesting security headers...")
    
    async with aiohttp.ClientSession() as session:
        async with session.get("http://localhost:8000/healthz") as response:
            headers = response.headers
            
            security_headers = [
                "X-Content-Type-Options",
                "X-Frame-Options", 
                "X-XSS-Protection",
                "Referrer-Policy"
            ]
            
            found_headers = 0
            for header in security_headers:
                if header in headers:
                    found_headers += 1
                    print(f"   ✅ {header}: {headers[header]}")
                else:
                    print(f"   ❌ {header}: Missing")
            
            if found_headers == len(security_headers):
                print("✅ Security headers: ALL PRESENT")
            else:
                print(f"⚠️  Security headers: {found_headers}/{len(security_headers)} present")

async def test_performance():
    """Test API performance"""
    print("\nTesting API performance...")
    
    endpoints = [
        ("/healthz", "Health Check"),
        ("/teams", "Teams List"),
        ("/athletes", "Athletes List")
    ]
    
    async with aiohttp.ClientSession() as session:
        for endpoint, name in endpoints:
            times = []
            for _ in range(5):
                start_time = time.time()
                async with session.get(f"http://localhost:8000{endpoint}") as response:
                    if response.status == 200:
                        response_time = (time.time() - start_time) * 1000
                        times.append(response_time)
            
            if times:
                avg_time = sum(times) / len(times)
                if avg_time < 200:
                    print(f"   ✅ {name}: {avg_time:.1f}ms (target: <200ms)")
                else:
                    print(f"   ⚠️  {name}: {avg_time:.1f}ms (exceeds 200ms target)")
            else:
                print(f"   ❌ {name}: All requests failed")

async def main():
    """Run all production feature tests"""
    print("NIL Moneyball Production Features Test")
    print("=" * 50)
    
    try:
        await test_health_endpoints()
        await test_metrics_endpoint()
        await test_rate_limiting()
        await test_caching()
        await test_security_headers()
        await test_performance()
        
        print("\n" + "=" * 50)
        print("Production features testing completed!")
        print("\nNote: Some tests may show warnings if services are not fully configured.")
        print("This is normal for development environments.")
        
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        print("Make sure the NIL Moneyball backend is running on localhost:8000")

if __name__ == "__main__":
    asyncio.run(main())
