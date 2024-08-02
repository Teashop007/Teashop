document.addEventListener('DOMContentLoaded', () => {
    fetch('products.json')
        .then(response => response.json())
        .then(products => displayProducts(products));

    const cart = [];

    function displayProducts(products) {
        const productList = document.getElementById('productList');
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <h3>${product.name}</h3>
                <p>Price: $${product.price}</p>
                <button onclick="addToCart('${product.id}')">Add to Cart</button>
            `;
            productList.appendChild(productDiv);
        });
    }

    window.addToCart = function(productId) {
        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                const product = products.find(p => p.id === productId);
                cart.push(product);
                displayCart();
            });
    }

    function displayCart() {
        const cartDiv = document.getElementById('cart');
        cartDiv.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <p>${item.name} - $${item.price}</p>
            `;
            cartDiv.appendChild(cartItem);
        });
    }

    function generateOrderNumber() {
        let lastOrderNumber = localStorage.getItem('lastOrderNumber');
        if (!lastOrderNumber) {
            lastOrderNumber = Date.now();
        } else {
            lastOrderNumber = parseInt(lastOrderNumber) + 1;
        }
        localStorage.setItem('lastOrderNumber', lastOrderNumber);
        return lastOrderNumber;
    }

    document.getElementById('checkoutButton').addEventListener('click', () => {
        if (cart.length === 0) {
            document.getElementById('orderStatus').textContent = 'Your cart is empty.';
            return;
        }

        const totalAmount = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
        const orderNumber = generateOrderNumber();
        const upiId = 'your-upi-id@bank';  // Replace with your UPI ID
        const upiName = 'Your Name';  // Replace with your name

        const upiUrl = `upi://pay?pa=${upiId}&pn=${upiName}&am=${totalAmount}&cu=INR&tn=Order%20${orderNumber}`;
        
        new QRCode(document.getElementById('qrcode'), {
            text: upiUrl,
            width: 128,
            height: 128,
        });

        document.getElementById('upiContainer').style.display = 'block';

        const order = {
            items: cart,
            orderId: orderNumber
        };

        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        document.getElementById('orderStatus').textContent = `Order placed successfully! Your order number is ${order.orderId}. Complete the payment by scanning the QR code below.`;
        cart.length = 0;
        displayCart();
    });
});
