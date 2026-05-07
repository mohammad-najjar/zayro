fetch('products.json')
.then(response => response.json())
.then(data => {
 
    const cart = JSON.parse(localStorage.getItem('cart')) || []
    const swiper_items_sale = document.getElementById("swiper_items_sale")
    const swiper_elctronics = document.getElementById("swiper_elctronics")
    const swiper_appliances = document.getElementById("swiper_appliances")
    const swiper_mobiles = document.getElementById("swiper_mobiles")

    data.forEach(product => {
        const isInCart = cart.some(cartItem => cartItem.id === product.id)
        const old_price_Pargrahp = product.old_price ? `<p class="old_price">$${product.old_price}</p>` : "";
        const percent_disc_div = product.old_price ? `<span class="sale_present">%${Math.floor((product.old_price - product.price) / product.old_price * 100)}</span>` : "";

        // كود الـ HTML المشترك لكل الأقسام مع روابط لصفحة المنتج
        // الكود المصلح تماماً - انسخ من هنا
        const productHtml = `
            <div class="swiper-slide product">
                ${percent_disc_div}
                
                <div class="img_product" onclick="openProductModal(${product.id})">
                    <img src="${product.img}" alt="${product.name}">
                </div>

                <div class="stars">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                </div>

                <p class="name_product" onclick="openProductModal(${product.id})" style="cursor:pointer;">
                    ${product.name}
                </p>

                <div class="price">
                    <p><span>$${product.price}</span></p>
                    ${old_price_Pargrahp}
                </div>

                <div class="icons">
                    

                    <span class="btn_add_cart ${isInCart ? 'active' : ''}" data-id="${product.id}">
                        <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? 'Item in cart' : 'add to cart'}
                    </span>
                    <span class="icon_product add_to_wishlist" data-id="${product.id}">
                        <i class="fa-regular fa-heart"></i>
                    </span>          
                </div>
            </div>`;

        // توزيع المنتجات على السوايبهر حسب التصنيف
        if(product.old_price && swiper_items_sale){
            swiper_items_sale.innerHTML += productHtml;
        }
        
        if(product.category == "electronics" && swiper_elctronics){
            swiper_elctronics.innerHTML += productHtml;
        }

        if(product.category == "appliances" && swiper_appliances){
            swiper_appliances.innerHTML += productHtml;
        }

        if(product.category == "mobiles" && swiper_mobiles){
            swiper_mobiles.innerHTML += productHtml;
        }
    })
})
function openProductModal(id) {
    const modal = document.getElementById("product_modal");
    const modalBody = document.getElementById("modal_body");

    fetch('products.json')
        .then(res => res.json())
        .then(products => {
            const product = products.find(p => p.id == id);
            if (product) {
                modalBody.innerHTML = `
                    <img src="${product.img}" alt="">
                    <div class="info">
                        <h2>${product.name}</h2>
                        <p class="price" style="color: #ff9900; font-size: 20px; font-weight: bold;">$${product.price}</p>
                        <p>${product.description || 'وصف المنتج يظهر هنا بشكل مختصر وجميل...'}</p>
                        
                        <button class="btn_add_cart" onclick="addToCartAndClose(${product.id})" style="background: #ff9900; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; margin-top: 15px; cursor: pointer;">
                           Add To Cart
                        </button>
                    </div>
                `;
                modal.style.display = "block";
            }
        });
}

function closeProductModal() {
    document.getElementById("product_modal").style.display = "none";
}

// إغلاق المودال عند الضغط خارج المحتوى
window.onclick = function(event) {
    const modal = document.getElementById("product_modal");
    if (event.target == modal) {
        closeProductModal();
    }
}

function addToCartAndClose(id) {
    fetch('products.json')
        .then(res => res.json())
        .then(products => {
            const product = products.find(p => p.id == id);
            
            if (product) {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existingProduct = cart.find(item => item.id === id);

                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    // تخزين البيانات كاملة لمنع ظهور undefined و NaN
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        img: product.img,
                        quantity: 1
                    });
                }

                localStorage.setItem('cart', JSON.stringify(cart));
                
                // --- الحل السحري هنا ---
                // استدعاء الدالة التي وجدتها لتحديث واجهة السلة فوراً
                updateCart(); 

                // تحديث العداد (الرقم 6 في الهيدر) إذا كان لديك دالة له
                if (typeof getCartCount === "function") {
                    getCartCount();
                }

                // إغلاق النافذة المنبثقة
                closeProductModal();
                
                // فتح السلة الجانبية لتظهر النتيجة فوراً
                const cartElement = document.querySelector(".cart");
                if (cartElement) {
                    cartElement.classList.add("active");
                }
            }
        });
}