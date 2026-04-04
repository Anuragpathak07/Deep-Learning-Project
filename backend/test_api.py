import urllib.request
import urllib.error
import urllib.parse
import json
import requests

url = 'https://gateway.apyflux.com/VehicleDetails/Rc_numberDetails/RJ18CC4505'

# Using the correct headers required by APYFlux
headers = {
    'x-app-id': '7a626cc8-0c28-487e-bc6b-f9a9a0fa7b54',
    'x-client-id': 's7MTZzK8lXa7U6nY4FZoEwDi88t2',
    'x-api-key': 'xYXCv2AOpaJU91X4zOO06IAhVzwZBBkpxh6nssAnhxQ=',
    'User-Agent': 'PlateSense-Backend'
}

print("--- Testing API with urllib ---")
try:
    req = urllib.request.Request(url, headers=headers)
    response = urllib.request.urlopen(req)
    print("API SUCCESS:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"Error Code: {e.code} ({e.reason})")
    print("Response body:", e.read().decode('utf-8'))
except Exception as e:
    print(e)
    
print("\n--- Testing API with requests ---")
try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    print("Response body:", response.text)
except requests.exceptions.RequestException as e:
    print(f"Request Error: {e}")
