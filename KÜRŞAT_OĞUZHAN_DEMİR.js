(() => {
    // Sabiteler	
    const API_URL = "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json";
    const STORAGE_KEY = "productCarouselData";
    let products = [];
    let initialized = false;

    // Başlangıçta çalıştırma fonksiyonu
    const init = async () => {
        if (initialized) return;
        initialized = true; // Tekrar çalışmaması için

        await fetchProducts();
        if ($(".product-carousel").length) return; // Karusel zaten varsa tekrar oluşturma
        buildHTML();
        buildCSS();
        setEvents();
    };

    // Ürünleri getirme
    const fetchProducts = async () => {
        if (products.length) return;

        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            products = JSON.parse(storedData);
            return;
        }
        try {
            const response = await fetch(API_URL);
            products = await response.json();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // HTML Yapısı
    const buildHTML = () => {
        if ($(".product-carousel").length) return;

        // Yeni container oluşturma ve '.product-detail' sonrası eklemek
        let container = $(".recommended-products");
        if (!container.length) {
            container = $('<div class="recommended-products"></div>');
            $(".product-detail").after(container);
        }

        // Karusel HTML yapısı
        const carousel = $(`
            <div class="product-carousel">
                <h2>You Might Also Like</h2>
                <div class="carousel-wrapper">
                    <button class="prev-btn"><</button>
                    <div class="carousel-container"></div>
                    <button class="next-btn">></button>
                </div>
            </div>
        `);

        container.append(carousel); // karusel için yeni container
        loadProducts();
    };

    // CSS Stilleri
    const buildCSS = () => {
        if ($("style#carousel-styles").length) return;

        const css = `
            .product-carousel {
                width: 100%;
                overflow: hidden;
                margin-top: 20px;
            }
            .carousel-wrapper {
                display: flex;
                align-items: center;
            }
            .carousel-container {
                display: flex;
                overflow: hidden;
                width: calc(100% - 80px);
                scroll-behavior: smooth;
            }
            .carousel-item {
                min-width: calc(100% / 6.5);
                text-align: center;
                position: relative;
                padding: 10px;
            }
            .carousel-item img {
                width: 100%;
                border-radius: 5px;
            }
            .heart-icon {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 20px;
                cursor: pointer;
            }
            .heart-icon.liked {
                color: blue;
            }
            .prev-btn, .next-btn {
                cursor: pointer;
                background: none;
                border: none;
                font-size: 24px;
                font-weight: bold;
                color: black;
                padding: 5px 10px;
            }
            .prev-btn:hover, .next-btn:hover {
                background-color: #f0f0f0;
            }
            .product-name {
                font-size: 14px;
                font-weight: bold;
                margin-top: 5px;
            }
            .product-price {
                font-size: 16px;
                color: blue;
                font-weight: bold;
                margin-top: 5px;
            }

            /* Büyük resimleri gizle */
            .product-detail img {
                display: none !important;
            }
        `;
        $('<style id="carousel-styles">').html(css).appendTo('head');
    };

    // Ürünleri Yükleme 
    const loadProducts = () => {
        const container = $(".carousel-container");
        container.html("");
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

        products.forEach(product => {
            const isLiked = favorites.includes(product.id) ? "liked" : "";
            const item = $(`
                <div class="carousel-item">
                    <img src="${product.img}" alt="${product.name}" />
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">${product.price.toFixed(2)} TL</p>
                    <span class="heart-icon ${isLiked}" data-id="${product.id}">❤</span>
                </div>
            `);
            item.on("click", () => window.open(product.url, "_blank"));
            item.find(".heart-icon").on("click", (e) => toggleFavorite(e, product.id));
            container.append(item);
        });
    };

    // Favorilere ekleme çıkarma 
    const toggleFavorite = (event, productId) => {
        event.stopPropagation();
        const heart = $(event.currentTarget);
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        if (favorites.includes(productId)) {
            favorites = favorites.filter(id => id !== productId);
            heart.removeClass("liked");
        } else {
            favorites.push(productId);
            heart.addClass("liked");
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
    };

    // Kaydırma butonları için olayları ayarlama
    const setEvents = () => {
        $(".prev-btn").off("click").on("click", () => {
            $(".carousel-container").animate({ scrollLeft: "-=150px" }, 300);
        });
        $(".next-btn").off("click").on("click", () => {
            $(".carousel-container").animate({ scrollLeft: "+=150px" }, 300);
        });
    };

    // Başlatma
    init();
})();