let category_nav_list = document.querySelector(".category_nav_list");

function Open_Categ_list(){
    category_nav_list.classList.toggle("active")

}

let nav_links = document.querySelector(".nav_links")

function open_Menu() {
    nav_links.classList.toggle("active")
}


var cart = document.querySelector('.cart');

function open_close_cart() {
    cart.classList.toggle("active")
}

fetch('products.json')
.then(response => response.json())
.then(data => {
    
    const addToCartButtons = document.querySelectorAll(".btn_add_cart")

    addToCartButtons.forEach(button =>{
        button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute('data-id')
            const selcetedProduct = data.find(product => product.id == productId)
            

            addToCart(selcetedProduct)

            const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`)

            allMatchingButtons.forEach(btn =>{
                btn.classList.add("active")
                btn.innerHTML = `      <i class="fa-solid fa-cart-shopping"></i> Item in cart`
            })
        })
    })
    
    
})


function addToCart(product) {

    let cart = JSON.parse(localStorage.getItem('cart')) || []

    cart.push({... product , quantity: 1})
    localStorage.setItem('cart' , JSON.stringify(cart))


    updateCart()
}



function updateCart() {
    const cartItemsContainer = document.getElementById("cart_items")

    const cart = JSON.parse(localStorage.getItem('cart')) || []


    var total_Price = 0
    var total_count = 0

    cartItemsContainer.innerHTML = "" ;
    cart.forEach((item , index) => {

        let total_Price_item = item.price * item.quantity;

        total_Price += total_Price_item
        total_count += item.quantity

    
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

                <button class="delete_item" data-inex="${index}" ><i class="fa-solid fa-trash-can"></i></button>
            </div>


        `
    })


    const price_cart_total = document.querySelector('.price_cart_toral')
    
    const count_item_cart = document.querySelector('.Count_item_cart')

    const count_item_header = document.querySelector('.count_item_header')
    
    price_cart_total.innerHTML = `$ ${total_Price}`

    count_item_cart.innerHTML = total_count

    count_item_header.innerHTML = total_count


    const increaseButtons = document.querySelectorAll(".Increase_quantity")
    const decreaseButtons = document.querySelectorAll(".decrease_quantity")

    increaseButtons.forEach(button => {
        button.addEventListener("click" , (event) =>{
            const itemIndex = event.target.getAttribute("data-index")
            increaseQuantity(itemIndex)
        })
    })


    decreaseButtons.forEach(button => {
        button.addEventListener("click" , (event) =>{
            const itemIndex = event.target.getAttribute("data-index")
            decreaseQuantity(itemIndex)
        })
    })



    const delteButtons = document.querySelectorAll('.delete_item')
    
    delteButtons.forEach(button =>{
        button.addEventListener('click' , (event) =>{
            const itemIndex = event.target.closest('button').getAttribute('data-inex')
            removeFromCart(itemIndex)
        })
    })

}


function increaseQuantity(index){
    let cart = JSON.parse(localStorage.getItem('cart')) || []
    cart[index].quantity += 1
    localStorage.setItem('cart' , JSON.stringify(cart))
    updateCart()
}

function decreaseQuantity(index){
    let cart = JSON.parse(localStorage.getItem('cart')) || []

    if (cart[index].quantity > 1){
        cart[index].quantity -= 1
    }
 
    localStorage.setItem('cart' , JSON.stringify(cart))
    updateCart()
}





function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || []

    const removeProduct = cart.splice(index , 1)[0]
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
    updateButoonsState(removeProduct.id)
}


function updateButoonsState(productId) {
    const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`)
    allMatchingButtons.forEach(button =>{
        button.classList.remove('active');
        button.innerHTML = `      <i class="fa-solid fa-cart-shopping"></i> add to cart`
    })
}

updateCart()

// تعريف مصفوفة المفضلة
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// تحديث العداد في الهيدر
function updateWishlistCount() {
    const wishlist_count = document.querySelector(".wishlist_count"); 
    if (wishlist_count) {
        wishlist_count.innerText = wishlist.length;
    }
}

// تشغيل عند الضغط
document.addEventListener("click", (e) => {
    const heartBtn = e.target.closest(".add_to_wishlist");
    if (heartBtn) {
        const productId = heartBtn.getAttribute("data-id");
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
    }
});

// استدعاء الدالة عند تحميل الصفحة للتأكد من الرقم
updateWishlistCount();

function open_close_wishlist() {
    const wishlistSide = document.getElementById("wishlist_side");
    wishlistSide.classList.toggle("active");
}
function updateWishlist() {
    const wishlistContainer = document.getElementById("items_in_wishlist");
    const countHeader = document.querySelector(".wishlist_count_header");
    
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            let itemsHtml = "";
            let count = 0;

            products.forEach(product => {
                // التأكد من وجود المنتج في مصفوفة المفضلة
                if (wishlist.includes(product.id.toString()) || wishlist.includes(product.id)) {
                    count++;
                    // نستخدم نفس كلاسات السلة item_cart و content
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

            wishlistContainer.innerHTML = itemsHtml;
            countHeader.innerText = count;
        });
}

// دالة حذف من المفضلة
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

// دالة الفتح والإغلاق
function open_close_wishlist() {
    const wishlistSide = document.getElementById("wishlist_side");
    wishlistSide.classList.toggle("active");
    if (wishlistSide.classList.contains("active")) {
        updateWishlist(); // جلب المنتجات فور الفتح
    }
}
// --- كود رقم 2: استمع لتحديث السلة وحدث الواجهة فوراً ---
window.addEventListener("updateCart", () => {
    // إذا كانت الدوال موجودة سيقوم بتشغيلها فوراً بدون ريفرش
    if (typeof getCartItems === "function") {
        getCartItems(); 
    }
    if (typeof getCartCount === "function") {
        getCartCount();
    }
});



document.getElementById("checkout-form").addEventListener("submit", async (e) => {
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

    const data = await res.text();
    console.log(data);

    alert("Order sent successfully ✅");
    localStorage.removeItem("cart");

  } catch (error) {
    console.log(error);
    alert("Error sending order ❌");
  }
});

