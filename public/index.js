let isLoggedIn = false;
let productname1 = '';
let productprice1 = 0;
let numCopies = 1;
let formVisible = false;
let allProducts = [];

function focusBarcode() {
    const input = document.getElementById('barcode-input');
    if (input) input.focus();
}

window.addEventListener('load', focusBarcode);
window.addEventListener('click', focusBarcode);
window.addEventListener('keydown', focusBarcode);

function printProduct(barcode, name, price) {
    productname1 = name;
    productprice1 = price;

    JsBarcode("#barcode", barcode, {
        format: "EAN13",
        width: 2,
        height: 100,
        displayValue: true,
        text: barcode
    });

    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';

    const copyInput = document.getElementById('numCopiesInput');
    if (copyInput) copyInput.value = '';
}

function setCookie(name, value, hours) {
    const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0; path=/';
}

function showEditForm(id, name, price) {
    const formContainer = document.getElementById('productlist-form');
    formContainer.style.display = 'block';

    formContainer.innerHTML = `
        <form id="edit-form">
            <input type="hidden" id="edit-id" value="${id}" />
            <input type="text" id="edit-name" value="${name}" />
            <input type="number" id="edit-price" value="${price}" />
            <button type="submit">Save</button>
        </form>
    `;

    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedId = document.getElementById('edit-id').value;
        const updatedName = document.getElementById('edit-name').value;
        const updatedPrice = document.getElementById('edit-price').value;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`/products/${updatedId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_name: updatedName,
                    product_price: updatedPrice
                })
            });

            if (res.ok) {
                formContainer.style.display = 'none';
                loadProducts();
            } else {
                alert('Failed to update product');
            }
        } catch (err) {
            console.error('Update error:', err);
        }
    });
}

function calculateEAN13CheckDigit(code12) {
    const digits = code12.split('').map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + digit * (i % 2 === 0 ? 1 : 3), 0);
    return (10 - (sum % 10)) % 10;
}

function printBarcode() {
    const container = document.getElementById('barcode-container');
    const cloned = container.cloneNode(true);
    const toRemove = cloned.querySelector('#ui');
    const toRemove2 = cloned.querySelector('#ui2');
    const toRemove3 = cloned.querySelector('#text');

    if (toRemove) toRemove.remove();
    if (toRemove2) toRemove2.remove();
    if (toRemove3) toRemove3.remove();

    const barcodeContent = cloned.innerHTML;
    const barcode = Array.from({ length: numCopies }, () => `
        <div style="margin-bottom: 40px;">
            <span>${productname1} - ₱${productprice1}</span>
            ${barcodeContent}
        </div>
    `).join('');

    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print Barcode</title>
            <style>
                body {
                    font-family: sans-serif;
                    text-align: center;
                    margin-top: 50px;
                }
                svg {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
        ${barcode}
        </body>
        </html>
    `);
    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
}

async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            loadProducts();
        } else {
            alert('Failed to delete product');
        }
    } catch (err) {
        console.error('Delete error:', err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = getCookie('token');
    const isAdminPage = window.location.pathname.includes('admin.html');
    const promptSpan = document.getElementById('prompt');

    let checkTimeout;
    loadProducts();
    if (isAdminPage && !token) {
        // Only redirect to index if trying to access admin.html without token
        window.location.href = './index.html';
        return;
    }

    isLoggedIn = !!token;

document.getElementById('addproduct')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!isLoggedIn) return alert("Only admins can add products.");

    let rawBarcode = document.querySelector('[name="barcode"]').value.trim();

    if (!/^\d{12,13}$/.test(rawBarcode)) {
        return alert("Barcode must be 12 or 13 digits.");
    }

    // Trim to 12 and generate full 13-digit EAN13 barcode
    const barcode12 = rawBarcode.slice(0, 12);
    const checkDigit = calculateEAN13CheckDigit(barcode12);
    const fullBarcode = barcode12 + checkDigit;

    const productName = document.querySelector('[name="product_name"]').value;
    const productPrice = document.querySelector('[name="product_price"]').value;
    productname1 = document.querySelector('[name="product_name"]').value;
    productprice1 = document.querySelector('[name="product_price"]').value;

    try {
        const res = await fetch('/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ product_name: productName, product_price: productPrice, barcode: fullBarcode })
        });

        if (res.ok) {
            JsBarcode("#barcode", fullBarcode, {
                format: "EAN13",
                width: 2,
                height: 100,
                displayValue: true,
                text: fullBarcode
            });
            document.getElementById('modal').style.display = 'flex';
            document.getElementById('modal').style.justifyContent = 'center';
            document.getElementById('addproduct').reset();
            loadProducts();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to add product!');
        }
    } catch (err) {
        console.error('Error adding product:', err);
    }
});

  const adminLoginBtn = document.getElementById('login');
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', (e) => {
      if (isLoggedIn) {
        e.preventDefault();
        window.location.href = 'admin.html';
      }
    });
  }

document.getElementById('modal')?.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');

    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

document.getElementById('show-form')?.addEventListener('click', () => {
    document.getElementById('scanproduct').style.transition = 'transform 0.5s ease';
  if (formVisible) {
    document.getElementById('scanproduct').style.transform = 'translateX(-100%)';
  } else {
    document.getElementById('scanproduct').style.transform = 'translateX(0%)';
  }
  formVisible = !formVisible;
});

document.getElementById('copies')?.addEventListener('input', () => {
        clearTimeout(checkTimeout);
        const copy = document.getElementById('copies').value;
        numCopies = parseInt(copy) || 1;
}
);

document.getElementById('barcode-field')?.addEventListener('input', () => {
        clearTimeout(checkTimeout);

        const barcode = document.getElementById('barcode-field').value;
        if (!barcode) {
            promptSpan.textContent = '';
            return;
        }

        checkTimeout = setTimeout(async () => {
            try {
                const res = await fetch(`/products/check?barcode=${encodeURIComponent(barcode)}`);
                const data = await res.json();

                if (data.exists) {
                    promptSpan.textContent = 'Barcode already exists';
                    promptSpan.style.color = 'red';
                } else {
                    promptSpan.textContent = 'Barcode is available';
                    promptSpan.style.color = 'green';
                }
            } catch (err) {
                promptSpan.textContent = 'Error checking barcode.';
                promptSpan.style.color = 'red';
                promptSpan.style.fontWeight = 700;
    }
  }, 300);
});


    document.getElementById('scanproduct')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const barcode = document.getElementById('barcode-input').value;
        if (!barcode) return alert('Please enter a barcode');

        try {
            const res = await fetch(`/products/${barcode}`);
            if (res.ok) {
                const data = await res.json();
                document.getElementById('result').style.display = 'block';
                document.getElementById('product_name').textContent = `Name: ${data.product_name}`;
                document.getElementById('product_price').textContent = `₱${data.product_price}`;
                document.getElementById('barcode-input').reset();
            } else {
                document.getElementById('product_name').textContent = '';
                document.getElementById('product_price').textContent = '';
                alert('Product not found or invalid barcode.');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    });

    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok && data.token) {
                setCookie('token', data.token, 1); // 1 hour expiration
                isLoggedIn = true;
                window.location.href = './admin.html';
                toggleAuthUI();
                loadProducts();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    });
});

document.getElementById('search-input')?.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const filtered = allProducts.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchTerm))
    );
    renderProducts(filtered);
});

async function loadProducts() {
    try {
        const res = await fetch('/products');
        const data = await res.json();
        allProducts = data.product;
        renderProducts(allProducts);
    } catch (err) {
        console.error('Failed to load products:', err);
    }
}

function renderProducts(products) {
    const listContainer = document.getElementById('productlist');
    listContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'product-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Product Name</th>
                <th>Product Price</th>
                ${isLoggedIn ? '<th>Options</th>' : ''}
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${product.product_name}</strong></td>
            <td>₱${product.product_price}</td>
            <td class="hidden">${product.barcode}</td>
            ${isLoggedIn ? `
                <td>
                    <button class="edit-btn" onclick="showEditForm('${product._id}', '${product.product_name}', ${product.product_price})">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct('${product._id}')">Delete</button>
                    <button class="print-btn" onclick="printProduct('${product.barcode}', '${product.product_name}', ${product.product_price})">Print</button>
                </td>
            ` : ''}
        `;
        tbody.appendChild(row);
    });

    listContainer.appendChild(table);
}

