document.addEventListener('DOMContentLoaded', async function () {
    const productGrid = document.getElementById('productGrid');

    // For GitHub Pages, use a relative path that works with the repository structure
    const repoName = 'price-tracker'; // Change this to your actual repository name
    const basePath = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
        ? ''
        : `/${repoName}`;

    const products = await fetch(`${basePath}/data/precios.json`)
        .then(response => response.json())
        .catch(error => console.error('Error fetching products:', error));

    const productsData = Object.values(products).map(product => {
        return {
            title: product.title,
            url: product.url,
            image_url: product.image_url || 'https://placehold.co/250',
            history: product.history
        };
    });

    // console.log(productsData);

    // Populate the table with product data
    productsData.forEach((product, idx) => {
        // Get price history indices
        const firstEntry = product.history[0];
        const latestEntry = product.history.at(-1);
        const prevEntry = product.history.length > 1 ? product.history.at(-2) : null;

        // Parse prices
        const parsePrice = p => parseFloat((p || '').replace(/[^0-9.-]+/g, ''));

        const firstPrice = firstEntry ? parsePrice(firstEntry.price) : null;
        const latestPrice = latestEntry ? parsePrice(latestEntry.price) : null;
        const prevPrice = prevEntry ? parsePrice(prevEntry.price) : null;

        // Find the lowest price in the product's history
        const lowestPrice = product.history.reduce((min, entry) => {
            const price = parsePrice(entry.price);
            return (price !== null && price < min) ? price : min;
        }, Infinity);

        // Calculate differences
        const diffFirstPrev = (prevPrice !== null && firstPrice !== null) ? prevPrice - firstPrice : null;
        const diffPrevLatest = (latestPrice !== null && prevPrice !== null) ? latestPrice - prevPrice : null;
        const diffFirstLatest = (latestPrice !== null && firstPrice !== null) ? latestPrice - firstPrice : null;
        const diffLowestLatest = (latestPrice !== null && lowestPrice !== null) ? lowestPrice - latestPrice : null;

        // Price changes
        let priceChange = null;
        if (diffPrevLatest !== null) {
            if (diffPrevLatest > 0) {
                priceChange = '<span class="text-danger">↑ Increase</span>';
            } else if (diffPrevLatest < 0) {
                priceChange = '<span class="text-success">↓ Decrease</span>';
            } else {
                priceChange = '<span class="text-muted">No Change</span>';
            }
        }

        // Dates
        const formatDate = d => new Date(d).toLocaleDateString('es-MX', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const firstDate = firstEntry ? formatDate(firstEntry.timestamp) : 'N/A';
        const latestDate = latestEntry ? formatDate(latestEntry.timestamp) : 'N/A';
        const prevDate = prevEntry ? formatDate(prevEntry.timestamp) : 'N/A';

        const formatDiff = diff =>
            diff === null ? '' :
                diff === 0 ? '<span class="text-muted ms-2">(=)</span>' :
                    diff > 0
                        ? `<span class="text-danger ms-2">(+${diff.toFixed(2)})</span>`
                        : `<span class="text-success ms-2">(${diff.toFixed(2)})</span>`;

        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
                    <div class="card h-100 hand-cursor" data-bs-toggle="modal" data-bs-target="#exampleModal">
                        <div class="contenedor-img">
                            <img src="${product.image_url}" alt="${product.title}" loading="lazy">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title"><a href="${product.url}" target="_blank" class="text-decoration-none">${product.title}</a></h5>
                            <div class="mt-3">
                                <div class="d-flex justify-content-between">
                                    <span>First Price:</span>
                                    <span>
                                        <strong>$${firstPrice !== null ? firstPrice : 'N/A'}</strong>
                                        ${formatDiff(null)}
                                    </span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Lowest Price:</span>
                                    <span>
                                        <strong>$${lowestPrice !== null ? lowestPrice : 'N/A'}</strong>
                                        ${formatDiff(diffLowestLatest)}
                                    </span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Previous Price:</span>
                                    <span>
                                        <strong>$${prevPrice !== null ? prevPrice : 'N/A'}</strong>
                                        ${formatDiff(diffFirstPrev)}
                                    </span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Current Price:</span>
                                    <span>
                                        <strong>$${latestPrice !== null ? latestPrice : 'N/A'}</strong>
                                        ${formatDiff(diffPrevLatest)}
                                    </span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Total Change:</span>
                                    <span>
                                        <strong>${priceChange || 'N/A'}</strong>
                                        ${formatDiff(diffFirstLatest)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-muted d-none">
                            <small>
                                First: ${firstDate}<br>
                                Previous: ${prevDate}<br>
                                Last updated: ${latestDate}
                            </small>
                        </div>
                    </div>
                `;
        card.addEventListener('click', () => renderChart(product));
        productGrid.appendChild(card);

        if (idx === 0) renderChart(product);
    });
});

let chartInstance = null; // Store Chart.js instance globally

function renderChart(product) {
    const modalTitle = document.getElementById('chartModalLabel');
    modalTitle.textContent = product.title;
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = product.history.map(entry =>
        new Date(entry.timestamp).toLocaleDateString('es-MX', {
            year: '2-digit', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        })
    );
    const data = product.history.map(entry =>
        parseFloat((entry.price || '').replace(/[^0-9.-]+/g, ''))
    );

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: product.title,
                data: data,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                title: { display: true, text: 'Price History' }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Price (MXN)' }
                }
            }
        }
    });
}

// Search and filter functionality
const changeTypeSelect = document.getElementById('changeType');
const searchInput = document.getElementById('searchInput');

function filterCards() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedValue = changeTypeSelect.value;
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.querySelector('.card-title a').textContent.toLowerCase();
        const priceChange = card.querySelector('.card-body .d-flex:nth-child(4) strong').textContent;

        if (title.includes(searchQuery) && (selectedValue === 'all' || (selectedValue === 'increase' && priceChange.includes('↑')) || (selectedValue === 'decrease' && priceChange.includes('↓')))) {
            card.parentElement.style.display = '';
        } else {
            card.parentElement.style.display = 'none';
        }
    });
}

searchInput.addEventListener('input', filterCards);
changeTypeSelect.addEventListener('change', filterCards);