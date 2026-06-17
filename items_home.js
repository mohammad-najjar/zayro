console.log("items_home.js works 🔥");

let allProducts = [];

// جلب المنتجات من سيرفر Render الأونلاين بدلاً من الملف المحلي القديم
fetch('https://zayro-km0j.onrender.com/api/products')
.then(response => response.json())
.then(data => {
    allProducts = data.sort(() => Math.random() - 0.5);
    renderProducts(allProducts);
    setupSearch();
    setupCategoryFilter();
})
.catch(err => {
    console.error("Error fetching online products, trying local backup:", err);
    // حل احتياطي في حال تأخر السيرفر في الاستيقاظ
    fetch('products.json')
    .then(response => response.json())
    .then(data => {
        allProducts = data.sort(() => Math.random() - 0.5);
        renderProducts(allProducts);
        setupSearch();
        setupCategoryFilter();
    });
});

function getStarsHtml(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars += '<i class="fa-solid fa-star"></i>';
        else if (rating >= i - 0.5) stars += '<i class="fa-solid fa-star-half-stroke"></i>';
        else stars += '<i class="fa-regular fa-star"></i>';
    }
    return stars;
}

function renderProducts(products) {
    const grid = document.getElementById("all_products_grid");
    if (!grid) return;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (products.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:40px;color:#999;">No products found</p>`;
        return;
    }

    grid.innerHTML = products.map(product => {
        const isInCart = cart.some(c => c.id === product.id);
        const isInWishlist = wishlist.includes(product.id);
        const old_price = product.old_price ? `<p class="old_price">$${product.old_price}</p>` : "";
        const discount = product.old_price
            ? `<span class="sale_present">%${Math.floor((product.old_price - product.price) / product.old_price * 100)}</span>`
            : "";

        // تم تعديل مسار الصورة هنا بحذف /shoop/
        return `
            <div class="product">
                ${discount}
                <div class="img_product" onclick="openProductModal(${product.id})" style="cursor:pointer;">
                    <img src="${product.img}" alt="${product.name}">
                </div>
                <div class="product_info">
                    <p class="name_product" onclick="openProductModal(${product.id})">${product.name}</p>
                    <div class="stars">
                        ${getStarsHtml(product.rating || 0)}
                        <span class="reviews_count">(${product.reviews || 0})</span>
                    </div>
                    <div class="price">
                        <p><span>$${product.price}</span></p>
                        ${old_price}
                    </div>
                    <div class="icons">
                        <span class="btn_add_cart ${isInCart ? 'active' : ''}" data-id="${product.id}">
                            <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? 'Item in cart' : 'add to cart'}
                        </span>
                        <span class="icon_product add_to_wishlist ${isInWishlist ? 'wishlist_active' : ''}" data-id="${product.id}">
                            <i class="fa-${isInWishlist ? 'solid' : 'regular'} fa-heart" ${isInWishlist ? 'style="color:red"' : ''}></i>
                        </span>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// wishlist
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add_to_wishlist");
    if (btn) {
        const id = parseInt(btn.getAttribute("data-id"));
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const idx = wishlist.indexOf(id);
        if (idx === -1) {
            wishlist.push(id);
            btn.innerHTML = '<i class="fa-solid fa-heart" style="color:red"></i>';
            btn.classList.add('wishlist_active');
        } else {
            wishlist.splice(idx, 1);
            btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            btn.classList.remove('wishlist_active');
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        if(document.querySelector(".wishlist_count")) {
            document.querySelector(".wishlist_count").innerText = wishlist.length;
        }
    }
});

function setupSearch() {
    const searchForm  = document.querySelector(".search_box");
    const searchInput = document.getElementById("search");
    if (searchForm)  searchForm.addEventListener("submit", e => { e.preventDefault(); applyFilter(); });
    if (searchInput) searchInput.addEventListener("input", applyFilter);
}

function setupCategoryFilter() {
    const select = document.getElementById("category");
    if (select) select.addEventListener("change", applyFilter);
    document.querySelectorAll(".category_nav_list a").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const cat = link.getAttribute("data-cat") || "all";
            if (select) select.value = cat;
            const catList = document.querySelector(".category_nav_list");
            if(catList) catList.classList.remove("active");
            applyFilter();
        });
    });
}

function applyFilter() {
    const searchVal   = (document.getElementById("search")?.value || "").toLowerCase().trim();
    const categoryVal = (document.getElementById("category")?.value || "all").toLowerCase().trim();
    const filtered = allProducts.filter(p => {
        const matchSearch = !searchVal || p.name.toLowerCase().includes(searchVal);
        const matchCat    = categoryVal === "all" || p.category?.toLowerCase() === categoryVal;
        return matchSearch && matchCat;
    });
    renderProducts(filtered);
}

// Modal
function openProductModal(id) {
    fetch('https://zayro-km0j.onrender.com/api/products')
        .then(res => res.json())
        .then(products => {
            const product = products.find(p => p.id == id);
            if (product) {
                // تعديل مسار الصورة والـ a href في الـ Modal لتتوافق مع جيت هاب
                document.getElementById("modal_body").innerHTML = `
                    <img src="${product.img}" alt="">
                    <div class="info">
                        <h2>${product.name}</h2>
                        <div class="stars" style="margin:8px 0">${getStarsHtml(product.rating || 0)} <span style="font-size:13px;color:#888">(${product.reviews || 0})</span></div>
                        <p style="font-size:20px;font-weight:bold;color:#000;margin:8px 0;">$${product.price}</p>
                        <p>${product.description || ''}</p>
                        <button onclick="addToCartFromModal(${product.id})" style="background:#000;color:#fff;padding:10px 20px;border:none;border-radius:2px;margin-top:15px;cursor:pointer;width:100%;font-size:14px;">
                            <i class="fa-solid fa-cart-shopping" style="color:#fff;margin-right:6px;"></i> Add To Cart
                        </button>
                        <a href="product.html?id=${product.id}" style="background:#f5f5f5;color:#000;padding:10px 20px;border-radius:2px;margin-top:8px;text-decoration:none;display:block;text-align:center;font-size:14px;">
                            View More
                        </a>
                    </div>
                `;
                document.getElementById("product_modal").style.display = "block";
            }
        });
}

function closeProductModal() {
    const modal = document.getElementById("product_modal");
    if(modal) modal.style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("product_modal");
    if (event.target == modal) closeProductModal();
}

function addToCartFromModal(id) {
    fetch('https://zayro-km0j.onrender.com/api/products')
        .then(res => res.json())
        .then(products => {
            const product = products.find(p => p.id == id);
            if (product) {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existing = cart.find(item => item.id === id);
                if (existing) existing.quantity += 1;
                else cart.push({...product, quantity: 1});
                localStorage.setItem('cart', JSON.stringify(cart));
                
                if (typeof updateCart === "function") {
                    updateCart();
                }
                closeProductModal();
                const cartSide = document.querySelector(".cart");
                if(cartSide) cartSide.classList.add("active");
            }
        });
}
