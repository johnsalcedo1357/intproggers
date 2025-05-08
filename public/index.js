document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('addproduct').addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const productName = document.querySelector('[name="product_name"]').value;
        const productPrice = document.querySelector('[name="product_price"]').value;

        console.log("Adding product:", productName, productPrice);  // Debug log
        try {
            const res = await fetch('/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: productName,
                    product_price: productPrice
                })
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Product added:', data);
                JsBarcode("#barcode", data._id, {
                    format: "CODE128",
                    width: 2,
                    height: 100,
                    displayValue: true
                });

            document.getElementById('addproduct').reset();
            
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

        if (!barcode) {
            alert('Please enter a barcode');
            return;
        }

        try {
            const res = await fetch(`/products/${barcode}`);
            if (res.ok) {
                const data = await res.json();
                document.getElementById('product_name').textContent = `Name: ${data.product_name}`;
                document.getElementById('product_price').textContent = `Price: $${data.product_price}`;
            } else {
                document.getElementById('product_name').textContent = '';
                document.getElementById('product_price').textContent = '';
                alert('Product not found or invalid barcode.');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    });
});
