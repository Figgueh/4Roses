import os
from supabase import create_client, Client

SUPABASE_URL = "https://ywkadgkdgycsjuhllfau.supabase.co"
SUPABASE_KEY = ""
BUCKET_NAME = "images"
OUTPUT_DIR = "images"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def download_bucket_recursively(path=""):
    # List files/folders at current path
    items = supabase.storage.from_(BUCKET_NAME).list(path=path)

    if not items:
        return

    # Filter out any None items just in case
    items = [item for item in items if item is not None]

    for item in items:
        item_name = item.get("name")
        if not item_name:
            continue

        full_path = f"{path}/{item_name}" if path else item_name
        local_path = os.path.join(OUTPUT_DIR, full_path)

        # Detect folder vs file
        # Folders have no 'id', files have an 'id'
        if not item.get("id"):  # Treat as folder
            download_bucket_recursively(full_path)
        else:
            print(f"Downloading {full_path}...")
            data = supabase.storage.from_(BUCKET_NAME).download(full_path)

            # Make local directories
            os.makedirs(os.path.dirname(local_path), exist_ok=True)

            # Save file locally
            with open(local_path, "wb") as f:
                f.write(data)

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    download_bucket_recursively()
    print("Download complete!")