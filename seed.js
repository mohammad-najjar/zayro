const mongoose = require("mongoose");

const Product = require("./models/Product");

mongoose.connect("mongodb://mohammadreyad:123456Aa@ac-jkk4roe-shard-00-00.xsnskpq.mongodb.net:27017,ac-jkk4roe-shard-00-01.xsnskpq.mongodb.net:27017,ac-jkk4roe-shard-00-02.xsnskpq.mongodb.net:27017/?ssl=true&replicaSet=atlas-685s4r-shard-0&authSource=admin&appName=Cluster0")

.then(async () => {

  console.log("MongoDB Connected 🔥");

  await Product.deleteMany();
  

  await Product.insertMany([

    {
      title: "Redmi 13C",
      image: "/shoop/img/product/1.png",
      price: 280,
      category: "mobiles",

      description: "Awesome mobile phone"
    },

    {
      title: "Dell Laptop",
      image: "/shoop/img/product/2.png",
      price: 400,
      category: "electronics",
      description: "Powerful laptop"
    },

    {
      title: "Canon Camera",
      image: "/shoop/img/product/3.png",
      price: 530,
      category: "appliances",
      description: "Professional camera"
    },
    {
        "image": "/shoop/img/product/0.png",
        "title": "SAMSUNG 55 Inch UHD 4K Smart TV With Receiver",
        "price": 350,
        "category":"electronics",
        "description": "شاشة بمقاس 6.6 بوصة، رام 4 جيجا، ذاكرة تخزين 64 جيجا، بطارية تدوم طويلاً مع تصميم انسيابي جذاب."
    },
    {
        "id": 1,
        "image": "/shoop/img/product/1.png",
        "title": "Redmi 13C Dual SIM with 6GB RAM",
        "price": 280,
        "category":"mobiles",
        "description": "-awesome mobile phone with dual SIM support and 6GB RAM."
    },
    {
        "id": 2,
        "image": "/shoop/img/product/2.png",
        "title": "Dell Laptop Latitude 5530 Core i7-1255U 8GB SSD",
        "price": 400,
        "category":"electronics",
        "description": "شاشة بمقاس 6.6 بوصة، رام 4 جيجا، ذاكرة تخزين 64 جيجا، بطارية تدوم طويلاً مع تصميم انسيابي جذاب."
    },
    {
        "id": 3,
        "image": "/shoop/img/product/3.png",
        "title": "Canon EOS RP Mirrorless Camera",
        "price": 530,
        "category":"electronics"
    },
    {
        "id": 4,
        "image": "/shoop/img/product/4.png",
        "title": "OPPO A18 128GB 4GB Glowing Black",
        "price": 250,
        "category":"mobiles"
    },
    {
        "id": 5,
        "image": "/shoop/img/product/5.png",
        "title": "Samsung 27-Inch G55C Odyssey QHD 4k",
        "price": 280,
        "category":"electronics"
    },
    {
        "id": 6,
        "image": "/shoop/img/product/6.png",
        "title": "Infinix Smart (Galaxy White, 4GB RAM, 64GB Storage)",
        "price": 220,
        "old_price": 300,
        "category":"mobiles"
    },
    {
        "id": 7,
        "image": "/shoop/img/product/7.png",
        "title": "HP Victus Gaming Laptop 8RAM SSD",
        "price": 370,
        "category":"electronics"
    },
    {
        "id": 8,
        "image": "/shoop/img/product/8.png",
        "title": "Xiaomi Redmi 13C Dual SIM 8GB",
        "price": 320,
        "category":"mobiles"
    },
    {
        "id": 9,
        "image": "/shoop/img/product/9.png",
        "title": "Handheld Barcode Scanner 1D/2D/QR Code",
        "price": 80,
        "old_price": 100,
        "category":"electronics"
    },
    {
        "id": 10,
        "image": "/shoop/img/product/10.png",
        "title": "Large Venue building mapping Projector",
        "price": 300,
        "category":"electronics"
    },
    {
        "id": 11,
        "image": "/shoop/img/product/11.png",
        "title": "Infinix Hot 40i (RAM: 4+4GB, 128GB)",
        "price": 260,
        "old_price": 300,
        "category":"mobiles"
    },
    {
        "id": 12,
        "image": "/shoop/img/product/12.png",
        "title": "HP DeskJet 2710 Printer, All-in-One",
        "price": 370,
        "category":"electronics"
    },
    {
        "id": 13,
        "image": "/shoop/img/product/13.png",
        "title": "Fuzzy Logic Rice Cooker DIGITAL-JAR 1.8L 940W – HD4515/67",
        "price": 490,
        "category":"appliances"
    },
    {
        "id": 14,
        "image": "/shoop/img/product/14.png",
        "title": "Sencor STS 5070SS Electric Toaster for Four Slices",
        "price": 340,
        "category":"appliances"
    },
    {
        "id": 15,
        "image": "/shoop/img/product/15.png",
        "title": "Infinix Smart 6 Plus (Miracle Black)",
        "price": 240,
        "old_price": 300,
        "category":"mobiles"
    },
    {
        "id": 16,
        "image": "/shoop/img/product/16.png",
        "title": "Washing Machine 959 Series 8kg Senator Aqua SX, Silver",
        "price": 600,
        "old_price": 700,
        "category":"appliances"
    },
    {
        "id": 17,
        "image": "/shoop/img/product/17.png",
        "title": "HIKVISION PTZ Camera 4K Outdoo",
        "price": 185,
        "category":"electronics"
    },
    {
        "id": 18,
        "image": "/shoop/img/product/18.png",
        "title": "OPPO Reno11 5G 256GB 12GB",
        "price": 225,
        "category":"mobiles"
    },
    {
        "id": 19,
        "image": "/shoop/img/product/19.png",
        "title": "VIVAX kettle WH-175L with a capacity of 1.7 ",
        "price": 140,
        "category":"appliances"
    },
    {
        "id": 20,
        "image": "/shoop/img/product/20.png",
        "title": "Kenstar Ester ABS Plastic 750W Mixer Grinder",
        "price": 280,
        "old_price": 330,
        "category":"appliances"
    },
    {
        "id": 21,
        "image": "/shoop/img/product/21.png",
        "title": "Multifunctional Food Processor",
        "price": 350,
        "category":"appliances"
    },
    {
        "id": 22,
        "image": "/shoop/img/product/22.png",
        "title": "Zanussi Washing Machine 8 Kg 1200 RPM ",
        "price": 580,
        "category":"appliances"
    },
    {
        "id": 23,
        "image": "/shoop/img/product/23.png",
        "title": "Sharp 42 Lt Electronic Oven Convection",
        "price": 400,
        "category":"appliances"
    },
    {
        "id": 24,
        "image": "/shoop/img/product/24.png",
        "title": "Lenovo Monitor Legion R27fc-30 Gaming Curved",
        "price": 300,
        "old_price": 380,
        "category":"electronics"
    }

  ]);

  console.log("Products Added 🚀");

  process.exit();

})

.catch(err => console.log(err));
