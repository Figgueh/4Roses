import os
from supabase import create_client, Client

SUPABASE_URL = "https://uxnskwzffdyvcsawklfo.supabase.co"
SUPABASE_KEY = ""
BUCKET_NAME = "images"
LOCAL_DIR = "images"


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_folder_recursively(local_path, remote_path=""):
    for root, dirs, files in os.walk(local_path):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            relative_path = os.path.relpath(file_path, local_path)
            bucket_path = f"{remote_path}/{relative_path}".replace("\\", "/")

            print(f"Uploading {file_path} → {bucket_path}...")
            with open(file_path, "rb") as f:
                data = f.read()
                try:
                    supabase.storage.from_(BUCKET_NAME).upload(bucket_path, data, {"upsert": "true"})
                except Exception as e:
                    print(f"Error uploading {bucket_path}: {e}")

if __name__ == "__main__":
    upload_folder_recursively(LOCAL_DIR)
    print("Upload complete!")
