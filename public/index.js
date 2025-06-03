let isLoggedIn = false;
let productname1 = '';
let productprice1 = 0;
let numCopies = 1;

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

    const productName = document.querySelector('[name="product_name"]').value;
    const productPrice = document.querySelector('[name="product_price"]').value;
    const barcode = document.querySelector('[name="barcode"]').value;
    productname1 = document.querySelector('[name="product_name"]').value;
    productprice1 = document.querySelector('[name="product_price"]').value;
    try {
        const res = await fetch('/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_name: productName, product_price: productPrice, barcode }),
            credentials: 'include'
        });

        if (res.ok) {
            const data = await res.json();
            JsBarcode("#barcode", barcode, { format: "EAN13", width: 2, height: 100, displayValue: true });
            document.getElementById('barcode-container').style.display = 'block';
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

document.getElementById('copies')?.addEventListener('input', () => {
        clearTimeout(checkTimeout);
        const copy = document.getElementById('copies').value;
        numCopies = parseInt(copy) || 1;
}
);

document.getElementById('barcode-field')?.addEventListener('input', () => {
        clearTimeout(checkTimeout);

        const barcode = document.getElementById('barcode-field').value.trim();
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
                document.getElementById('product_name').textContent = `Name: ${data.product_name}`;
                document.getElementById('product_price').textContent = `₱${data.product_price}`;
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

document.getElementById('logout-btn')?.addEventListener('click', () => {
        deleteCookie('token');
        isLoggedIn = false;
        window.location.href = './index.html'; // Redirect on logout
});

async function loadProducts() {
    try {
        const res = await fetch('/products');
        const data = await res.json();
        const products = data.product;
        const listContainer = document.getElementById('productlist');
        listContainer.innerHTML = '';
        const title = document.createElement('div');
        title.innerHTML = '<center><h1>Product List</h1></center>';
        listContainer.appendChild(title);
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.innerHTML = `
                <div class="item-div">
                    <span><strong>${product.product_name}</strong></span>  <span>₱${product.product_price}</span>
                    ${isLoggedIn ? `
                        <span><button class="edit-btn" onclick="showEditForm('${product._id}', '${product.product_name}', ${product.product_price})">Edit</button>
                        <button class="delete-btn" onclick="deleteProduct('${product._id}')">Delete</button></span>
                    ` : ''}
                </div>
            `;
            listContainer.appendChild(productDiv);
        });
    } catch (err) {
        console.error('Failed to load products:', err);
    }
}

function addProductToList(barcode, name, price) {
  const container = document.getElementById("productlist");
  const item = document.createElement("div");
  item.className = "product-item";
  item.innerHTML = `
    <p><strong>Product Name:</strong> ${name}</p>
    <p><strong>Price:</strong> ₱${parseFloat(price).toFixed(2)}</p>
    <p><strong>Barcode:</strong> ${barcode}</p>
    <div class="product-buttons">
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;
  container.appendChild(item);
}

