// Store Chart.js instance globally
let chartInstance = null;

// Search and filter functionality
const changeTypeSelector = document.getElementById('typeSelector');
const searchInput = document.getElementById('searchInput');
const orderSelector = document.getElementById('orderSelector');

// Add at the beginning of your DOMContentLoaded event listener
const gridViewBtn = document.getElementById('gridViewBtn');
const tableViewBtn = document.getElementById('tableViewBtn');
const productGrid = document.getElementById('productGrid');
const productTable = document.getElementById('productTable');
const tableBody = productTable.querySelector('tbody');

// View toggle functions
function showGridView() {
    productGrid.classList.remove('d-none');
    productTable.classList.add('d-none');
    gridViewBtn.classList.add('active');
    tableViewBtn.classList.remove('active');
}

function showTableView() {
    productGrid.classList.add('d-none');
    productTable.classList.remove('d-none');
    gridViewBtn.classList.remove('active');
    tableViewBtn.classList.add('active');
}

// Add event listeners
gridViewBtn.addEventListener('click', showGridView);
tableViewBtn.addEventListener('click', showTableView);

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
                    <h5 class="card-title">
                        <a href="${product.url}" target="_blank" class="text-decoration-none">${product.title}</a>
                    </h5>
                    
                    <div class="current-price-section text-center my-3 p-2 border-bottom">
                        <div class="fs-4">$${latestPrice !== null ? latestPrice.toFixed(2) : 'N/A'}</div>
                        <div class="price-change">
                            ${priceChange || 'N/A'} ${formatDiff(diffPrevLatest)}
                        </div>
                    </div>
        
                    <div class="price-stats">
                        <div class="row g-2">
                            <div class="col-6">
                                <div class="p-2 bg-light rounded">
                                    <small class="text-muted d-block">Lowest</small>
                                    <strong>$${lowestPrice !== null ? lowestPrice.toFixed(2) : 'N/A'}</strong>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="p-2 bg-light rounded">
                                    <small class="text-muted d-block">First</small>
                                    <strong>$${firstPrice !== null ? firstPrice.toFixed(2) : 'N/A'}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div class="total-change mt-3">
                            <small class="text-muted">Total Change:</small>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar ${diffFirstLatest > 0 ? 'bg-danger' : 'bg-success'}" 
                                     role="progressbar" 
                                     style="width: ${Math.abs(diffFirstLatest) / firstPrice * 100}%">
                                </div>
                            </div>
                            <small class="d-block text-end">${formatDiff(diffFirstLatest)}</small>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <small class="text-muted">
                        Last updated: ${latestDate}
                    </small>
                </div>
            </div>
        `;
        card.addEventListener('click', () => renderChart(product));

        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>
            <div class="d-flex align-items-center">
                <img src="${product.image_url}" alt="" class="me-2" style="width: 50px; height: 50px; object-fit: cover;">
                <a href="${product.url}" target="_blank" class="text-decoration-none">${product.title}</a>
            </div>
        </td>
        <td>$${latestPrice !== null ? latestPrice.toFixed(2) : 'N/A'}</td>
        <td>${priceChange || 'N/A'} ${formatDiff(diffPrevLatest)}</td>
        <td>$${lowestPrice !== null ? lowestPrice.toFixed(2) : 'N/A'}</td>
        <td>$${firstPrice !== null ? firstPrice.toFixed(2) : 'N/A'}</td>
        <td>${latestDate}</td>
    `;

        // Add click handler for chart
        row.style.cursor = 'pointer';
        row.setAttribute('data-bs-toggle', 'modal');
        row.setAttribute('data-bs-target', '#exampleModal');
        row.addEventListener('click', () => renderChart(product));

        // Append elements
        productGrid.appendChild(card);
        tableBody.appendChild(row);

        if (idx === 0) renderChart(product);
    });
});

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

function filterCards() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedValue = changeTypeSelector.value;
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.querySelector('.card-title a').textContent.toLowerCase();
        const priceChange = card.querySelector('.price-change').textContent;

        if (title.includes(searchQuery) && (selectedValue === 'all' || (selectedValue === 'increase' && priceChange.includes('↑')) || (selectedValue === 'decrease' && priceChange.includes('↓')))) {
            card.parentElement.style.display = '';
        } else {
            card.parentElement.style.display = 'none';
        }
    });

    // Filter table rows
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const title = row.querySelector('a').textContent.toLowerCase();
        const priceChange = row.querySelector('td:nth-child(3)').textContent;

        if (title.includes(searchQuery) && (selectedValue === 'all' ||
            (selectedValue === 'increase' && priceChange.includes('↑')) ||
            (selectedValue === 'decrease' && priceChange.includes('↓')))) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function sortCards() {
    const productGrid = document.getElementById('productGrid');
    const cols = Array.from(productGrid.querySelectorAll('.col'));
    const order = orderSelector.value;

    // Sort grid
    cols.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.current-price-section .fs-4').textContent.replace(/[^0-9.-]+/g, ''));
        const priceB = parseFloat(b.querySelector('.current-price-section .fs-4').textContent.replace(/[^0-9.-]+/g, ''));
        return order === 'asc' ? priceA - priceB : order === 'desc' ? priceB - priceA : 0;
    });

    // Remove all .col elements before re-inserting
    cols.forEach(col => productGrid.removeChild(col));
    cols.forEach(col => productGrid.appendChild(col));

    // Sort table
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    rows.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('td:nth-child(2)').textContent.replace(/[^0-9.-]+/g, ''));
        const priceB = parseFloat(b.querySelector('td:nth-child(2)').textContent.replace(/[^0-9.-]+/g, ''));
        return order === 'asc' ? priceA - priceB : order === 'desc' ? priceB - priceA : 0;
    });

    rows.forEach(row => tableBody.appendChild(row));
}

searchInput.addEventListener('input', filterCards);
changeTypeSelector.addEventListener('change', filterCards);
orderSelector.addEventListener('change', sortCards);