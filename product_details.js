// 1. الحصول على الـ ID من الرابط (URL)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// 2. جلب البيانات من ملف الـ JSON
fetch('products.json')
    .then(res => res.json())
    .then(products => {
        // البحث عن المنتج المطابق للـ ID
        const product = products.find(p => p.id == productId);

        if (product) {
            // توزيع البيانات في الصفحة
            document.getElementById('main_img').src = product.img;
            document.getElementById('product_name').innerText = product.name;
            document.getElementById('product_price').innerText = '$' + product.price;
            
            // إذا كان لديك وصف في الـ JSON
            document.getElementById('product_desc').innerText = product.description || "No description available for this product.";
        }
    });