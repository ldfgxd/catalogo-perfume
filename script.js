document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CONFIGURACIÓN CENTRALIZADA DE CONTACTO
    // ==========================================
    const CONFIG = {
        whatsappNumber: "521XXXXXXXXXX", // Tu número con código de país (Ej: 521...)
        instagramUrl: "https://instagram.com/tu_usuario_instagram"
    };

    // Elementos del Modal de Producto Individual
    const modal = document.getElementById('productModal');
    const closeModal = document.querySelector('.close-modal');
    const modalImg = document.getElementById('modalProductImage');
    const modalName = document.getElementById('modalProductName');
    const modalPrice = document.getElementById('modalProductPrice');
    const modalWhatsApp = document.getElementById('modalWhatsApp');
    const modalInstagram = document.getElementById('modalInstagram');
    const modalAddToCart = document.getElementById('modalAddToCart');

    // Elementos del Modal del Carrito
    const cartModal = document.getElementById('cartModal');
    const openCartModal = document.getElementById('openCartModal');
    const closeCart = document.querySelector('.close-cart');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartCount = document.getElementById('cartCount');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutWhatsApp = document.getElementById('checkoutWhatsApp');
    const clearCartBtn = document.getElementById('clearCart');

    // Estado del Carrito (Cargado desde localStorage para persistir entre páginas)
    let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];

    // Función para actualizar la interfaz del carrito
    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;

        localStorage.setItem('aura_cart', JSON.stringify(cart));

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p style="color: var(--text-muted); padding: 1rem 0;">Tu carrito está vacío.</p>';
                cartTotalPrice.textContent = '0.00';
                return;
            }

            let total = 0;
            cart.forEach((item, index) => {
                const itemPriceClean = parseFloat(item.price.replace('$', ''));
                const itemTotal = itemPriceClean * item.quantity;
                total += itemTotal;

                const itemDiv = document.createElement('div');
                itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem; text-align: left;';
                itemDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <img src="${item.img}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px;">
                        <div>
                            <h4 style="font-size: 0.9rem; color: var(--accent);">${item.name}</h4>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">${item.price} x ${item.quantity}</span>
                        </div>
                    </div>
                    <button onclick="window.removeFromCart(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem; font-weight: bold;" title="Eliminar">&times;</button>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });

            cartTotalPrice.textContent = total.toFixed(2);
        }
    }

    // Función global para eliminar un producto del carrito
    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    // Inicializar visualización del carrito al cargar la página
    updateCartUI();

    // Detectar clics en la foto o botón de comprar para abrir modal de producto
    const triggers = document.querySelectorAll('.product-image, .btn-buy');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const card = trigger.closest('.product-card');
            const name = card.querySelector('.product-name').textContent;
            const price = card.querySelector('.product-price').textContent;
            const imgSrc = card.querySelector('.product-image').src;
            const imgAlt = card.querySelector('.product-image').alt;

            modalImg.src = imgSrc;
            modalImg.alt = imgAlt;
            modalName.textContent = name;
            modalPrice.textContent = price;

            const mensajeWa = encodeURIComponent(`Hola, me interesa el perfume ${name} (${price}) que vi en su catálogo.`);
            modalWhatsApp.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${mensajeWa}`;
            modalInstagram.href = CONFIG.instagramUrl;

            modal.classList.add('active');
        });
    });

    // Cerrar modal de producto
    if (closeModal) closeModal.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    // Botón "Agregar al Carrito" dentro del modal de producto
    if (modalAddToCart) {
        modalAddToCart.addEventListener('click', () => {
            const name = modalName.textContent;
            const price = modalPrice.textContent;
            const img = modalImg.src;

            const existingIndex = cart.findIndex(item => item.name === name);
            if (existingIndex > -1) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({ name, price, img, quantity: 1 });
            }

            updateCartUI();
            modal.classList.remove('active');
            alert(`¡${name} se agregó al carrito!`);
        });
    }

    // Abrir Modal del Carrito desde el Navbar
    if (openCartModal) {
        openCartModal.addEventListener('click', (e) => {
            e.preventDefault();
            cartModal.classList.add('active');
        });
    }

    // Cerrar Modal del Carrito
    if (closeCart) closeCart.addEventListener('click', () => cartModal.classList.remove('active'));
    window.addEventListener('click', (e) => { if (e.target === cartModal) cartModal.classList.remove('active'); });

    // Vaciar Carrito completo
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            updateCartUI();
        });
    }

    // Enviar pedido completo por WhatsApp con todos los productos del carrito
    if (checkoutWhatsApp) {
        checkoutWhatsApp.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu carrito está vacío.');
                return;
            }

            let detallePedido = "Hola, quiero realizar el siguiente pedido:\n\n";
            let totalGeneral = 0;

            cart.forEach(item => {
                const sub = parseFloat(item.price.replace('$', '')) * item.quantity;
                totalGeneral += sub;
                detallePedido += `▪️ ${item.name} (${item.price}) x ${item.quantity} = $${sub.toFixed(2)}\n`;
            });

            detallePedido += `\n*Total a pagar: $${totalGeneral.toFixed(2)}*`;

            const urlWa = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(detallePedido)}`;
            window.open(urlWa, '_blank');
        });
    }
});
