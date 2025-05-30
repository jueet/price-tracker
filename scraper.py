import requests
from bs4 import BeautifulSoup
import json
import hashlib
from datetime import datetime, timezone
import os

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0",
    "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Referer": "https://www.google.com/",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Connection": "keep-alive",
}

def get_price_from_page(html):
    soup = BeautifulSoup(html, 'html.parser')
    price_element = soup.select_one('#detallePrecio .precio')
    if not price_element:
        return None
    return price_element.text.strip()

def get_price_and_title(html):
    soup = BeautifulSoup(html, 'html.parser')
    
    # Extraer precio
    price_element = soup.select_one('#detallePrecio .precio')
    price = price_element.text.strip().replace('$', '').strip() if price_element else None

    # Extraer título
    title_element = soup.select_one('p.tituloProducto')
    title = title_element.text.strip() if title_element else "Título no encontrado"

    # Extraer URL de la imagen
    image_element = soup.select_one('img#imgPortada')
    image_url = image_element['src'] if image_element and 'src' in image_element.attrs else image_element.get('data-src') if image_element else "URL de imagen no encontrada"

    return price, title, image_url

def hash_url(url):
    return hashlib.md5(url.encode()).hexdigest()

def load_data():
    if not os.path.exists('data'):
        os.makedirs('data')
    try:
        with open('data/precios.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_data(data):
    with open('data/precios.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def main():
    with open('urls.txt') as f:
        urls = [line.strip() for line in f if line.strip()]

    previous_data = load_data()
    updated_data = {}

    for url in urls:
        try:
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()
            price, title, image_url = get_price_and_title(response.text)
            if price is None:
                print(f"No se encontró precio en {url}")
                continue

            uid = hash_url(url)
            utc_now = datetime.now(timezone.utc)
            timestamp = utc_now.isoformat()

            history = previous_data.get(uid, {}).get("history", [])
            if not history or history[-1]["price"] != price:
                history.append({"timestamp": timestamp, "price": price})

            updated_data[uid] = {
                "url": url,
                "title": title,
                "image_url": image_url,
                "history": history
            }

            print(f"[{title}] Precio actual: {price}")
        except Exception as e:
            print(f"Error con {url}: {e}")

    save_data(updated_data)

if __name__ == '__main__':
    main()
