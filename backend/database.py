import os
import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

url: str = os.getenv("SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_KEY", "")

class SupabaseResponse:
    def __init__(self, data):
        self.data = data

class SupabaseTable:
    def __init__(self, table_name, url, key):
        self.table_name = table_name
        self.url = f"{url}/rest/v1/{table_name}"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self.params = {}

    def select(self, columns="*"):
        self.params["select"] = columns
        return self

    def order(self, column, desc=False):
        self.params["order"] = f"{column}.{'desc' if desc else 'asc'}"
        return self

    def eq(self, column, value):
        self.params[column] = f"eq.{value}"
        return self

    def insert(self, data):
        with httpx.Client() as client:
            res = client.post(self.url, json=data, headers=self.headers)
            if res.status_code not in [200, 201]:
                print(f"[DB ERROR] Insert failed ({res.status_code}): {res.text}")
            return SupabaseResponse(res.json())

    def update(self, data):
        with httpx.Client() as client:
            res = client.patch(self.url, json=data, headers=self.headers, params=self.params)
            if res.status_code not in [200, 204]:
                print(f"[DB ERROR] Update failed ({res.status_code}): {res.text}")
            return SupabaseResponse(res.json())

    def delete(self):
        with httpx.Client() as client:
            res = client.delete(self.url, headers=self.headers, params=self.params)
            if res.status_code not in [200, 204]:
                print(f"[DB ERROR] Delete failed ({res.status_code}): {res.text}")
            try:
                return SupabaseResponse(res.json())
            except:
                return SupabaseResponse([])

    def execute(self):
        with httpx.Client() as client:
            res = client.get(self.url, headers=self.headers, params=self.params)
            return SupabaseResponse(res.json())

class MiniSupabase:
    def __init__(self, url, key):
        self.url = url
        self.key = key

    def table(self, table_name):
        return SupabaseTable(table_name, self.url, self.key)

# Initialize our lightweight client
supabase = None
if url and key:
    supabase = MiniSupabase(url, key)
    print("[DATABASE] Using Lightweight HTTPX Client.")
else:
    print("[DATABASE] Warning: Credentials missing.")
