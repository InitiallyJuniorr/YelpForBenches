import requests

r = requests.get(url = "http://localhost:8080/bench")

print(r.json());