let isLoggedIn = false;

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    isLoggedIn = !!token;
    toggleAuthUI();
    loadProducts();

    document.getElementById('addproduct').addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!isLoggedIn) return alert("Only admins can add products.");

        const productName = document.querySelector('[name="product_name"]').value;
        const productPrice = document.querySelector('[name="product_price"]').value;

        try {
            const res = await fetch('/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_name: productName, product_price: productPrice })
            });

            if (res.ok) {
                const data = await res.json();
                JsBarcode("#barcode", data._id, { format: "CODE128", width: 2, height: 100, displayValue: true });
                document.getElementById('barcode-container').style.display = 'block';
                document.getElementById('addproduct').reset();
                loadProducts();
            } else {
                alert('Failed to add product!');
            }
        } catch (err) {
            console.error('Error adding product:', err);
        }
    });

    document.getElementById('scanproduct').addEventListener('submit', async function (e) {
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

    document.getElementById('login-form').addEventListener('submit', async (e) => {
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
                localStorage.setItem('token', data.token);
                isLoggedIn = true;
                toggleAuthUI();
                loadProducts();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        isLoggedIn = false;
        toggleAuthUI();
        loadProducts();
    });
});

function toggleAuthUI() {
    const token = localStorage.getItem('token');
    document.getElementById('login-form').style.display = token ? 'none' : 'block';
    document.getElementById('logout-btn').style.display = token ? 'block' : 'none';
    document.getElementById('addproduct').style.display = token ? 'block' : 'none';
}

async function loadProducts() {
    try {
        const res = await fetch('/products');
        const data = await res.json();
        const products = data.product;
        const listContainer = document.getElementById('productlist');
        listContainer.innerHTML = '';

        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.innerHTML = `
                <div>
                    <p><strong>${product.product_name}</strong> - ₱${product.product_price}</p>
                    ${isLoggedIn ? `
                        <button onclick="showEditForm('${product._id}', '${product.product_name}', ${product.product_price})">Edit</button>
                        <button onclick="deleteProduct('${product._id}')">Delete</button>
                    ` : ''}
                </div>
            `;
            listContainer.appendChild(productDiv);
        });
    } catch (err) {
        console.error('Failed to load products:', err);
    }
}

function showEditForm(id, name, price) {
    const formContainer = document.getElementById('productlist-form');
    formContainer.style.display = 'block';

    formContainer.innerHTML = `
        <form id="edit-form">
            <input type="text" id="edit-name" value="${name}" />
            <input type="number" id="edit-price" value="${price}" />
            <button type="submit">Save</button>
        </form>
    `;

    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedName = document.getElementById('edit-name').value;
        const updatedPrice = document.getElementById('edit-price').value;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`/products/${id}`, {
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
