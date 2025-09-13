#!/usr/bin/env python3

import asyncio
import aiohttp
import time
import statistics
from typing import List

async def test_endpoint(session: aiohttp.ClientSession, url: str, name: str) -> dict:
    """Test a single endpoint and return performance metrics"""
    response_times = []
    errors = 0
    
    for _ in range(10):
        start_time = time.time()
        try:
            async with session.get(url) as response:
                await response.text()
                response_time = (time.time() - start_time) * 1000
                response_times.append(response_time)
                if response.status >= 400:
                    errors += 1
        except Exception as e:
            errors += 1
            print(f"Error testing {name}: {e}")
    
    if response_times:
        return {
            'endpoint': name,
            'avg_response_time': statistics.mean(response_times),
            'p95_response_time': statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max(response_times),
            'min_response_time': min(response_times),
            'max_response_time': max(response_times),
            'error_rate': errors / 10,
            'total_requests': 10
        }
    else:
        return {
            'endpoint': name,
            'error': 'All requests failed',
            'error_rate': 1.0
        }

async def run_performance_tests():
    """Run performance tests on key endpoints"""
    base_url = "http://localhost:8000"
    
    endpoints = [
        ("/healthz", "Health Check"),
        ("/health/detailed", "Detailed Health"),
        ("/teams", "Teams List"),
        ("/athletes", "Athletes List"),
        ("/analytics/team-dashboard/1", "Team Dashboard"),
    ]
    
    print("Starting NIL Moneyball Performance Tests...")
    print("=" * 50)
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for endpoint, name in endpoints:
            url = f"{base_url}{endpoint}"
            tasks.append(test_endpoint(session, url, name))
        
        results = await asyncio.gather(*tasks)
    
    print("\nPerformance Test Results:")
    print("=" * 50)
    
    for result in results:
        if 'error' in result:
            print(f"{result['endpoint']}: ERROR - {result['error']}")
        else:
            print(f"{result['endpoint']}:")
            print(f"  Average Response Time: {result['avg_response_time']:.2f}ms")
            print(f"  95th Percentile: {result['p95_response_time']:.2f}ms")
            print(f"  Min/Max: {result['min_response_time']:.2f}ms / {result['max_response_time']:.2f}ms")
            print(f"  Error Rate: {result['error_rate']:.1%}")
            
            if result['avg_response_time'] > 200:
                print(f"  ⚠️  WARNING: Average response time exceeds 200ms target")
            else:
                print(f"  ✅ Response time within target")
            print()

if __name__ == "__main__":
    asyncio.run(run_performance_tests())
