// CMS データ読み込み・表示機能
class WasuiCMS {
    constructor() {
        this.data = null;
        this.init();
    }

    init() {
        this.loadCMSData();
        this.setupDataPolling();
    }

    // CMSデータの読み込み
    loadCMSData() {
        try {
            const savedData = localStorage.getItem('wasui_data');
            if (savedData) {
                this.data = JSON.parse(savedData);
                this.updateWebsite();
            } else {
                console.log('CMSデータが見つかりません');
            }
        } catch (error) {
            console.error('CMSデータの読み込みエラー:', error);
        }
    }

    // 定期的なデータ更新チェック
    setupDataPolling() {
        setInterval(() => {
            this.loadCMSData();
        }, 5000); // 5秒ごとにチェック
    }

    // ウェブサイトの更新
    updateWebsite() {
        if (!this.data) return;

        this.updateSiteSettings();
        this.updateNews();
        this.updateProducts();
        this.updateGifts();
        this.updateReviews();
    }

    // サイト設定の反映
    updateSiteSettings() {
        if (!this.data.settings) return;

        const settings = this.data.settings;

        // サイト名の更新
        if (settings.siteName) {
            document.title = settings.siteName;
            const siteNameElements = document.querySelectorAll('.site-name, .hero h1');
            siteNameElements.forEach(el => el.textContent = settings.siteName);
        }

        // 連絡先情報の更新
        if (settings.phone) {
            const phoneElements = document.querySelectorAll('.contact-phone');
            phoneElements.forEach(el => {
                el.textContent = settings.phone;
                el.href = `tel:${settings.phone.replace(/[^0-9+]/g, '')}`;
            });
        }

        if (settings.address) {
            const addressElements = document.querySelectorAll('.contact-address');
            addressElements.forEach(el => el.textContent = settings.address);
        }

        if (settings.hours) {
            const hoursElements = document.querySelectorAll('.contact-hours');
            hoursElements.forEach(el => el.textContent = settings.hours);
        }

        if (settings.email) {
            const emailElements = document.querySelectorAll('.contact-email');
            emailElements.forEach(el => {
                el.textContent = settings.email;
                el.href = `mailto:${settings.email}`;
            });
        }

        // 特別なお知らせの表示
        if (settings.notice && settings.notice.trim()) {
            this.showSiteNotice(settings.notice);
        }

        // SNSリンクの更新
        this.updateSocialLinks(settings);
    }

    // サイト全体のお知らせ表示
    showSiteNotice(notice) {
        let noticeElement = document.getElementById('site-notice');
        if (!noticeElement) {
            noticeElement = document.createElement('div');
            noticeElement.id = 'site-notice';
            noticeElement.className = 'site-notice';
            noticeElement.innerHTML = `
                <div class="container">
                    <p>${notice}</p>
                    <button onclick="this.parentElement.parentElement.style.display='none'">×</button>
                </div>
            `;
            document.body.insertBefore(noticeElement, document.body.firstChild);
        } else {
            noticeElement.querySelector('p').textContent = notice;
            noticeElement.style.display = 'block';
        }
    }

    // SNSリンクの更新
    updateSocialLinks(settings) {
        const socialLinks = {
            facebook: settings.facebook,
            instagram: settings.instagram,
            twitter: settings.twitter,
            line: settings.line
        };

        Object.entries(socialLinks).forEach(([platform, url]) => {
            if (url) {
                const elements = document.querySelectorAll(`.social-${platform}`);
                elements.forEach(el => {
                    el.href = url;
                    el.style.display = 'inline-block';
                });
            }
        });
    }

    // お知らせの更新
    updateNews() {
        if (!this.data.news) return;

        const activeNews = this.data.news.filter(news => news.active !== false);
        const newsContainer = document.getElementById('news-list');

        if (newsContainer && activeNews.length > 0) {
            newsContainer.innerHTML = '';

            // 最新の3件を表示
            activeNews
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3)
                .forEach(news => {
                    const newsElement = this.createNewsElement(news);
                    newsContainer.appendChild(newsElement);
                });
        }
    }

    // お知らせ要素の作成
    createNewsElement(news) {
        const div = document.createElement('div');
        div.className = 'news-item';

        const date = new Date(news.date).toLocaleDateString('ja-JP');
        const category = news.category || 'お知らせ';

        div.innerHTML = `
            <span class="news-date">${date}</span>
            <span class="news-label ${this.getCategoryClass(category)}">${category}</span>
            <p class="news-text">${news.title}</p>
        `;

        return div;
    }

    // カテゴリークラスの取得
    getCategoryClass(category) {
        const categoryClasses = {
            '新商品': 'new',
            'キャンペーン': 'campaign',
            'お知らせ': 'info',
            'イベント': 'event',
            '重要': 'important'
        };
        return categoryClasses[category] || 'info';
    }

    // 商品情報の更新
    updateProducts() {
        if (!this.data.products) return;

        const activeProducts = this.data.products.filter(product => product.active !== false);
        const productsContainer = document.getElementById('products-list');

        if (productsContainer && activeProducts.length > 0) {
            productsContainer.innerHTML = '';

            // おすすめ商品を優先表示
            const featuredProducts = activeProducts.filter(product => product.featured);
            const regularProducts = activeProducts.filter(product => !product.featured);

            [...featuredProducts, ...regularProducts]
                .slice(0, 6) // 最大6件表示
                .forEach(product => {
                    const productElement = this.createProductElement(product);
                    productsContainer.appendChild(productElement);
                });
        }
    }

    // 商品要素の作成
    createProductElement(product) {
        const article = document.createElement('article');
        article.className = 'product-item';
        if (product.featured) article.classList.add('featured');

        article.innerHTML = `
            <div class="product-image">
                ${product.image ? `<img src="${this.getImageUrl(product.image)}" alt="${product.title}">` : '<div class="no-image">画像なし</div>'}
                ${product.featured ? '<span class="featured-badge">おすすめ</span>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category || ''}</div>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-price">${product.price || ''}</div>
            </div>
        `;

        return article;
    }

    // ギフト情報の更新
    updateGifts() {
        if (!this.data.gifts) return;

        const activeGifts = this.data.gifts.filter(gift => gift.active !== false);
        const giftsContainer = document.getElementById('gifts-list');

        if (giftsContainer && activeGifts.length > 0) {
            giftsContainer.innerHTML = '';

            activeGifts
                .sort((a, b) => b.featured - a.featured) // おすすめを優先
                .slice(0, 4) // 最大4件表示
                .forEach(gift => {
                    const giftElement = this.createGiftElement(gift);
                    giftsContainer.appendChild(giftElement);
                });
        }
    }

    // ギフト要素の作成
    createGiftElement(gift) {
        const article = document.createElement('article');
        article.className = 'gift-item';
        if (gift.featured) article.classList.add('featured');

        const services = [];
        if (gift.noshi) services.push('のし対応');
        if (gift.wrapping) services.push('包装対応');
        if (gift.message) services.push('メッセージカード');

        article.innerHTML = `
            <div class="gift-image">
                ${gift.image ? `<img src="${this.getImageUrl(gift.image)}" alt="${gift.title}">` : '<div class="no-image">画像なし</div>'}
                ${gift.featured ? '<span class="featured-badge">おすすめ</span>' : ''}
            </div>
            <div class="gift-info">
                <div class="gift-type">${gift.type || ''}</div>
                <h3 class="gift-title">${gift.title}</h3>
                <p class="gift-contents">${gift.contents || ''}</p>
                <div class="gift-price">${gift.price || ''}</div>
                ${services.length > 0 ? `<div class="gift-services">${services.join(' | ')}</div>` : ''}
            </div>
        `;

        return article;
    }

    // お客様の声の更新
    updateReviews() {
        if (!this.data.reviews) return;

        const activeReviews = this.data.reviews.filter(review => review.active !== false);
        const reviewsContainer = document.getElementById('reviews-list');

        if (reviewsContainer && activeReviews.length > 0) {
            reviewsContainer.innerHTML = '';

            activeReviews
                .sort((a, b) => b.featured - a.featured) // おすすめを優先
                .slice(0, 3) // 最大3件表示
                .forEach(review => {
                    const reviewElement = this.createReviewElement(review);
                    reviewsContainer.appendChild(reviewElement);
                });
        }
    }

    // レビュー要素の作成
    createReviewElement(review) {
        const article = document.createElement('article');
        article.className = 'review-item';
        if (review.featured) article.classList.add('featured');

        const stars = '★'.repeat(parseInt(review.rating)) + '☆'.repeat(5 - parseInt(review.rating));
        const customerInfo = [review.age, review.gender].filter(x => x).join(' ');

        article.innerHTML = `
            <div class="review-header">
                <div class="review-customer">${review.customerName || '匿名'}様</div>
                <div class="review-rating">${stars}</div>
            </div>
            <div class="review-content">
                <p>"${review.content}"</p>
                ${review.product ? `<div class="review-product">購入商品：${review.product}</div>` : ''}
                ${customerInfo ? `<div class="review-info">${customerInfo}</div>` : ''}
            </div>
            ${review.image ? `<div class="review-image"><img src="${this.getImageUrl(review.image)}" alt="${review.customerName}様"></div>` : ''}
        `;

        return article;
    }

    // 画像URLの取得
    getImageUrl(imageData) {
        if (!imageData) return '';
        if (imageData.startsWith('data:')) return imageData;
        return imageData;
    }

    // CMSデータの取得（外部からアクセス用）
    getData() {
        return this.data;
    }

    // 特定のセクションのデータ取得
    getNews() {
        return this.data?.news?.filter(item => item.active !== false) || [];
    }

    getProducts() {
        return this.data?.products?.filter(item => item.active !== false) || [];
    }

    getGifts() {
        return this.data?.gifts?.filter(item => item.active !== false) || [];
    }

    getReviews() {
        return this.data?.reviews?.filter(item => item.active !== false) || [];
    }

    getSettings() {
        return this.data?.settings || {};
    }
}

// グローバルインスタンスの作成
let wasuiCMS;

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
    wasuiCMS = new WasuiCMS();

    // CMSデータが利用可能であることを他のスクリプトに通知
    document.dispatchEvent(new CustomEvent('cmsLoaded', { detail: wasuiCMS }));
});

// グローバルアクセス用
window.WasuiCMS = WasuiCMS;
window.wasuiCMS = wasuiCMS;