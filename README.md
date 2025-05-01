# Price Tracker

A web scraper that tracks book prices from Buscalibre México and stores price history over time.

## Features

- Scrapes book prices and titles from Buscalibre México URLs
- Stores price history in JSON format
- Runs automatically every 12 hours via GitHub Actions
- Dockerized for easy deployment
- Handles multiple URLs from a text file

## Setup

### Prerequisites

- Python 3.x
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
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

### Using GitHub Actions

The scraper runs automatically every 12 hours through GitHub Actions. You can also trigger it manually through the Actions tab in your repository.

## Data Storage

Price history is stored in `data/precios.json` with the following structure:

```json
{
  "<url-hash>": {
    "url": "book-url",
    "title": "book-title",
    "history": [
      {
        "timestamp": "ISO-8601-timestamp",
        "price": "price-value"
      }
    ]
  }
}
```

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.