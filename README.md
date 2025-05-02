# Price Tracker

A web scraper that tracks book prices from Buscalibre México and stores price history over time.

## Features

- Scrapes book prices and titles from Buscalibre México URLs
- Stores price history in JSON format
- Runs automatically every 8 hours via GitHub Actions
- Dockerized for easy deployment (and testing in MacOS)
- Handles multiple URLs from a text file

## Setup

### Prerequisites

- Python 3.x
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jueet/price-tracker.git
cd price-tracker
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Configuration

Add book URLs to track in `urls.txt`, one URL per line. Only Buscalibre México URLs are supported.

## Usage

### Running Locally

```bash
python scraper.py
```

### Using Docker

```bash
docker compose up
```

And then open [localhost](http://127.0.0.1:5500/index.html) to watch the results from the scrapping.

### Using GitHub Actions

The scraper runs automatically every 8 hours through GitHub Actions. You can also trigger it manually through the Actions tab in your repository.

## Data Storage

Price history is stored in `data/precios.json` with the following structure:

```json
{
  "<url-hash>": {
    "url": "book-url",
    "title": "book-title",
    "image_url": "book-cover-url",
    "history": [
      {
        "timestamp": "ISO-8601-timestamp",
        "price": "price-value"
      }
    ]
  }
}
```

## Working

### Real-time Search Filter Implementation
            
This JavaScript code implements a real-time search filter functionality:
- Listens for input changes in the search field
- Filters product cards based on the search term
- Shows/hides cards by comparing product titles with search input
            
Elements:
- searchInput: Input field for search terms
- cards: Collection of product card elements with class 'card'
            
Functionality:
1. Gets search input value and converts to lowercase
2. Iterates through all product cards
3. Compares card title text with search filter
4. Shows cards that match the filter, hides others
            
Notes:
- Case-insensitive search
- Uses parent element display property for visibility control

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.