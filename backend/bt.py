import requests

r = requests.get(url = "http://localhost:8080/bench?lat=0&long=0")

print(r.json());