import requests

r = requests.get(url = "http://localhost:8080/bench-lookup?lat=34.066068&lon=-118.442755")

print(r.json());