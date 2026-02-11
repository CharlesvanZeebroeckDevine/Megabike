import os
import cloudscraper
import time
import random
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed

# Load env vars
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

def fetch_riders_needing_update():
    print("Fetching riders from DB...")
    # Fetch only riders without photos
    response = supabase.table("riders").select("id, pcs_slug, rider_name, photo_url").is_("photo_url", "null").order("id").execute()
    return response.data

def get_pcs_image_url(slug):
    if not slug:
        return None
    
    if not slug.startswith("rider/"):
        pcs_url = f"https://www.procyclingstats.com/rider/{slug}"
    else:
        pcs_url = f"https://www.procyclingstats.com/{slug}"
    
    try:
        # random delay to be nice
        time.sleep(random.uniform(0.1, 0.5))
        
        # Create scraper per thread to avoid issues
        local_scraper = cloudscraper.create_scraper()
        res = local_scraper.get(pcs_url)
        
        
        # If 404 or failed, try searching for the rider
        if res.status_code == 404:
             # Try simple slug (firstname-lastname)
             clean_slug = slug.replace("rider/", "").split("/")[-1]
             # Search on PCS
             search_url = f"https://www.procyclingstats.com/search.php?term={clean_slug}"
             res_search = local_scraper.get(search_url)
             if res_search.status_code == 200:
                 search_soup = BeautifulSoup(res_search.text, 'html.parser')
                 # Find first result
                 first_link = search_soup.select_one("ul.list a")
                 if first_link and first_link.get("href"):
                     new_url = f"https://www.procyclingstats.com/{first_link['href']}"
                     print(f"[{slug}] Redirecting to {new_url}")
                     res = local_scraper.get(new_url)

        
        if res.status_code != 200:
            return None
            
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Heuristic: Find any image looking like a rider photo
        images = soup.find_all("img")
        candidates = []
        for img in images:
            src = img.get("src", "")
            if "images/riders/" in src:
                candidates.append(src)
        
        # Priority: 2026 -> 2025 -> 2024 -> Any
        best_src = None
        for year in ["2026", "2025", "2024"]:
            for src in candidates:
                if year in src:
                    best_src = src
                    break
            if best_src: break
            
        if not best_src and candidates:
            best_src = candidates[0]

        if best_src:
             if best_src.startswith("http"): return best_src
             return f"https://www.procyclingstats.com/{best_src}"

    except Exception as e:
        print(f"[{slug}] Error: {e}")
        return None
    
    return None

def process_rider(rider):
    slug = rider.get("pcs_slug")
    if not slug:
        return False

    img_url = get_pcs_image_url(slug)
    if img_url:
        print(f"[{slug}] Found: {img_url}")
        # Update even if it exists, to ensure we have the best one? 
        # Or only if different? Let's update if different.
        if img_url != rider.get("photo_url"):
            try:
                supabase.table("riders").update({"photo_url": img_url}).eq("id", rider["id"]).execute()
                print(f"Updated {rider['rider_name']}")
                return True
            except Exception as e:
                print(f"Error updating {rider['rider_name']}: {e}")
    
    return False

def main():
    riders = fetch_riders_needing_update()
    print(f"Found {len(riders)} riders. Starting threads...")
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_rider, rider) for rider in riders]
        
        count = 0
        for future in as_completed(futures):
            if future.result():
                count += 1
            
    print(f"Finished. Updated {count} riders.")

if __name__ == "__main__":
    main()
