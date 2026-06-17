let category_nav_list = document.querySelector(".category_nav_list");

function Open_Categ_list(){
    if(category_nav_list) category_nav_list.classList.toggle("active");
}

let nav_links = document.querySelector(".nav_links")

function open_Menu() {
    if(nav_links) nav_links.classList.toggle("active");
}

var cart = document.querySelector('.cart');

function open_close_cart() {
    if(cart) cart.classList.toggle("active");
}

// جلب المنتجات من السيرفر الأونلاين بدلاً من الفولدر المحلي القديم
fetch('https://zayro-km0j.onrender.com/api/products')
.then(response => response.json())
.then(data => {
    const addToCartButtons = document.querySelectorAll(".btn_add_cart")
    addToCartButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const productId = parseInt(event.target.getAttribute('data-id'))
            const selectedProduct = data.find(product => product.id == productId)
            if(selectedProduct) {
                addToCart(selectedProduct)
                const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`)
                allMatchingButtons.forEach(btn => {
                    btn.classList.add("active")
                    btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item in cart`
                })
            }
        })
    })
})
.catch(err => {
    // في حال واجه السيرفر تأخيراً في الاستيقاظ (Sleep)، نحاول جلب الملف المحلي كبديل احتياطي
    fetch('products.json')
    .then(res => res.json())
    .then(data => {
         // كود التعامل مع الأزرار الاحتياطية هنا إذا لزم الأمر
    });
});


function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []
    cart.push({...product, quantity: 1})
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
}

function updateCart() {
    const cartItemsContainer = document.getElementById("cart_items")
    if(!cartItemsContainer) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || []

    var total_Price = 0
    var total_count = 0

    cartItemsContainer.innerHTML = "";
    cart.forEach((item, index) => {
        let total_Price_item = item.price * item.quantity;
        total_Price += total_Price_item
        total_count += item.quantity

        // تم حذف مسار /shoop/ من الصورة لتقرأ من بيئة الاستضافة مباشرة
        cartItemsContainer.innerHTML += `
            <div class="item_cart">
                <img src="${item.img}" alt="">
                <div class="content">
                    <h4>${item.name}</h4>
                    <p class="price_cart">$${total_Price_item}</p>
                    <div class="quantity_control">
                        <button class="decrease_quantity" data-index=${index}>-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="Increase_quantity" data-index=${index}>+</button>
                    </div>
                </div>
                <button class="delete_item" data-inex="${index}"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `
    })

    if(document.querySelector('.price_cart_toral')) document.querySelector('.price_cart_toral').innerHTML = `$ ${total_Price}`
    if(document.querySelector('.Count_item_cart')) document.querySelector('.Count_item_cart').innerHTML = total_count
    if(document.querySelector('.count_item_header')) document.querySelector('.count_item_header').innerHTML = total_count

    document.querySelectorAll(".Increase_quantity").forEach(button => {
        button.addEventListener("click", (event) => {
            increaseQuantity(event.target.getAttribute("data-index"))
        })
    })

    document.querySelectorAll(".decrease_quantity").forEach(button => {
        button.addEventListener("click", (event) => {
            decreaseQuantity(event.target.getAttribute("data-index"))
        })
    })

    document.querySelectorAll('.delete_item').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemIndex = event.target.closest('button').getAttribute('data-inex')
            removeFromCart(itemIndex)
        })
    })
}

function increaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []
    cart[index].quantity += 1
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
}

function decreaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || []
    const removeProduct = cart.splice(index, 1)[0]
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
    if(removeProduct) updateButtonsState(removeProduct.id)
}

function updateButtonsState(productId) {
    document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`).forEach(button => {
        button.classList.remove('active');
        button.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> add to cart`
    })
}

updateCart()

// ===== WISHLIST =====
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

function updateWishlistCount() {
    const wishlist_count = document.querySelector(".wishlist_count");
    if (wishlist_count) wishlist_count.innerText = wishlist.length;
}

document.addEventListener("click", (e) => {
    const heartBtn = e.target.closest(".add_to_wishlist");
    if (heartBtn) {
        const productId = parseInt(heartBtn.getAttribute("data-id"));
        const index = wishlist.indexOf(productId);

        if (index === -1) {
            wishlist.push(productId);
            heartBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: red;"></i>';
        } else {
            wishlist.splice(index, 1);
            heartBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        }

        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateWishlistCount();
        updateWishlist();
    }
});

updateWishlistCount();

function open_close_wishlist() {
    const wishlistSide = document.getElementById("wishlist_side");
    if(!wishlistSide) return;
    wishlistSide.classList.toggle("active");
    if (wishlistSide.classList.contains("active")) {
        updateWishlist();
    }
}

function updateWishlist() {
    const wishlistContainer = document.getElementById("items_in_wishlist");
    const countHeader = document.querySelector(".wishlist_count_header");
    if(!wishlistContainer) return;

    // جلب المفضلة أيضاً من السيرفر الأونلاين
    fetch('https://zayro-km0j.onrender.com/api/products')
        .then(response => response.json())
        .then(products => {
            let itemsHtml = "";
            let count = 0;

            products.forEach(product => {
                if (wishlist.includes(product.id) || wishlist.includes(product.id.toString())) {
                    count++;
                    itemsHtml += `
                        <div class="item_cart">
                            <img src="${product.img}" alt="">
                            <div class="content">
                                <h4>${product.name}</h4>
                                <p class="price_cart">$${product.price}</p>
                            </div>
                            <button onclick="removeFromWishlist(${product.id})" class="delete_item">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `;
                }
            });

            wishlistContainer.innerHTML = itemsHtml || "<p style='text-align:center; margin-top:20px;'>No items in wishlist</p>";
            if(countHeader) countHeader.innerText = count;
        });
}

function removeFromWishlist(id) {
    wishlist = wishlist.filter(itemId => itemId != id);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlist();
    updateWishlistCount();
    const heartIcon = document.querySelector(`.add_to_wishlist[data-id="${id}"]`);
    if (heartIcon) {
        heartIcon.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
}

// ===== CHECKOUT =====
const checkoutForm = document.getElementById("checkout-form");
if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const formData = new FormData(e.target);
        try {
            const res = await fetch("https://script.google.com/macros/s/AKfycbyq2KCUG7m7vM0u0AVdT71mWKzNesWrCLVUTl9fvmno3dyBqiZXaq_3P541pHSNu2bBSA/exec", {
                method: "POST",
                body: JSON.stringify({
                    name: formData.get("name"),
                    phone: formData.get("phone"),
                    address: formData.get("address"),
                    payment: formData.get("payment"),
                    order: cart
                })
            });
            alert("Order sent successfully ✅");
            localStorage.removeItem("cart");
            updateCart();
        } catch (error) {
            alert("Error sending order ❌");
        }
    });
}
