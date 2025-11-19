// ==================================================
// UTILITY FUNCTIONS
// ==================================================
const $ = (sel, all = false) =>
  all ? document.querySelectorAll(sel) : document.querySelector(sel);

// ==================================================
// LOADING SCREEN
// ==================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = $('.loader');
    if (loader) loader.classList.add('hidden');
  }, 800);
});

// ==================================================
// SCROLL ANIMATIONS
// ==================================================
const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
      }
    });
  }, { threshold: 0.1 });

  $('.fade-in', true).forEach(el => observer.observe(el));
};

// ==================================================
// NAVBAR SCROLL EFFECT
// ==================================================
window.addEventListener('scroll', () => {
  const navbar = $('.navbar');
  const currentScroll = window.scrollY;

  if (currentScroll > 50) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }

  // Back to top button
  const btnTop = $('#back-to-top');
  if (currentScroll > 300) {
    btnTop?.classList.add('show');
  } else {
    btnTop?.classList.remove('show');
  }
});

// ==================================================
// BACK TO TOP BUTTON
// ==================================================
const backToTopBtn = $('#back-to-top');
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  });
}

// ==================================================
// NAVBAR MOBILE MENU
// ==================================================
const navMenu = $(".navbar-nav");
const btnHamb = $("#hamburger-menu");

if (btnHamb) {
  btnHamb.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    navMenu.classList.toggle("active");
    searchForm?.classList.remove("active");
    cartPanel?.classList.remove("active");
  });
}

document.addEventListener("click", (e) => {
  if (navMenu && !navMenu.contains(e.target) && !btnHamb?.contains(e.target)) {
    navMenu.classList.remove("active");
  }
});

// ==================================================
// SEARCH PANEL
// ==================================================
const searchForm = $(".search-form");
const btnSearch = $("#search-button");
const searchInput = $("#search-box");

if (btnSearch && searchForm) {
  btnSearch.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    searchForm.classList.toggle("active");
    navMenu?.classList.remove("active");
    cartPanel?.classList.remove("active");
    if (searchForm.classList.contains("active")) searchInput?.focus();
  });

  document.addEventListener("click", (e) => {
    if (!searchForm.contains(e.target) && !btnSearch.contains(e.target)) {
      searchForm.classList.remove("active");
    }
  });
}

function doSearch() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  const menuCards = $(".menu .menu-card", true);
  const prodCards = $(".products .product-card", true);

  const match = (el) => el.innerText.toLowerCase().includes(q);

  [...menuCards].forEach((card) => {
    card.classList.toggle("is-hidden", q && !match(card));
  });
  [...prodCards].forEach((card) => {
    card.classList.toggle("is-hidden", q && !match(card));
  });
}

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
  });

  searchInput.addEventListener("input", () => {
    if (!searchInput.value.trim()) doSearch();
  });
}

// ==================================================
// SHOPPING CART PANEL
// ==================================================
const cartPanel = $(".shopping-cart");
const btnCart = $("#shopping-cart-button");
const cartCount = $("#cart-count");

if (btnCart && cartPanel) {
  btnCart.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    cartPanel.classList.toggle("active");
    navMenu?.classList.remove("active");
    searchForm?.classList.remove("active");
  });

  document.addEventListener("click", (e) => {
    if (!cartPanel.contains(e.target) && !btnCart.contains(e.target)) {
      cartPanel.classList.remove("active");
    }
  });
}

// Close panels with ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    navMenu?.classList.remove("active");
    searchForm?.classList.remove("active");
    cartPanel?.classList.remove("active");
    
    const modalDetail = $('#modal-detail-produk');
    if (modalDetail?.classList.contains('active')) {
      closeModalDetail();
    }
    
    const modalCheckout = $('#modal-checkout');
    if (modalCheckout?.classList.contains('active')) {
      closeCheckoutModal();
    }
  }
});

// ==================================================
// CART DATA & FUNCTIONS
// ==================================================
let cartItems = [];

function parsePrice(text) {
  const t = (text || "").toUpperCase().replace(/[^\dK]/g, "");
  if (t.endsWith("K")) return parseInt(t) * 1000;
  const num = parseInt(t.replace(/\D/g, ""));
  return isNaN(num) ? 0 : num;
}

function formatIDR(n) {
  if (!n) return "0";
  if (n % 1000 === 0 && n < 1_000_000) return (n / 1000) + "K";
  return new Intl.NumberFormat("id-ID").format(n);
}

function updateCartCount() {
  const totalQty = cartItems.reduce((a, b) => a + Number(b.qty || 0), 0);
  if (cartCount) cartCount.textContent = totalQty;
}

function renderCart() {
  if (!cartPanel) return;
  cartPanel.innerHTML = "";

  if (cartItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "cart-empty";
    empty.textContent = "Keranjang kosong.";
    cartPanel.appendChild(empty);
    updateCartCount();
    return;
  }

  let total = 0;

  cartItems.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    const line = item.priceRaw * Number(item.qty || 1);
    total += line;

    row.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div class="item-detail">
        <h3>${item.title}</h3>
        <p>${formatIDR(item.priceRaw)} × ${item.qty} = ${formatIDR(line)}</p>
      </div>
      <i data-feather="trash-2" class="remove-item" data-id="${idx}"></i>
    `;
    cartPanel.appendChild(row);
  });

  const totalRow = document.createElement("div");
  totalRow.className = "cart-total";
  totalRow.innerHTML = `
    <span>Total</span>
    <span>${formatIDR(total)}</span>
  `;
  cartPanel.appendChild(totalRow);

  // Tombol Checkout (Buka Form)
  const btnCheckout = document.createElement("button");
  btnCheckout.className = "checkout-wa";
  btnCheckout.innerHTML = '<i data-feather="check-circle"></i> <span>Checkout</span>';
  btnCheckout.style.display = "flex";
  btnCheckout.style.alignItems = "center";
  btnCheckout.style.justifyContent = "center";
  btnCheckout.style.gap = "0.5rem";
  btnCheckout.onclick = openCheckoutModal;
  cartPanel.appendChild(btnCheckout);

  if (window.feather) feather.replace();
  updateCartCount();
}

// ==================================================
// TOAST NOTIFICATION
// ==================================================
function showToast(message) {
  const toast = $('#toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}

// ==================================================
// ADD TO CART
// ==================================================
function addToCart(img, title, priceText, qty) {
  const priceRaw = parsePrice(priceText);
  const q = Math.max(1, parseInt(qty) || 1);

  const exist = cartItems.find(i => i.title === title && i.priceRaw === priceRaw);
  if (exist) {
    exist.qty = Number(exist.qty) + q;
  } else {
    cartItems.push({ img, title, priceRaw, qty: q });
  }

  renderCart();
  showToast('✓ ' + title + ' ditambahkan!');
}

// Remove item
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.classList?.contains("remove-item")) {
    const id = parseInt(t.getAttribute("data-id"));
    if (!isNaN(id)) {
      const removedItem = cartItems[id];
      cartItems.splice(id, 1);
      renderCart();
      if (removedItem) {
        showToast('🗑️ ' + removedItem.title + ' dihapus');
      }
    }
  }
});

// ==================================================
// WIRE ADD TO CART BUTTONS
// ==================================================
function wireAddToCart(selector, pickers) {
  $(selector, true).forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = btn.closest(pickers.card);
      if (!card) return;

      const img = card.querySelector("img")?.src || "";
      const title = card.querySelector(pickers.title)?.textContent?.trim() || "Produk";
      const priceText = card.querySelector(pickers.price)?.textContent || "0";
      const qtyEl = card.querySelector(".qty");
      const qty = qtyEl ? qtyEl.value : 1;

      addToCart(img, title, priceText, qty);
      
      cartPanel?.classList.add("active");
      searchForm?.classList.remove("active");
      navMenu?.classList.remove("active");
    });
  });
}

wireAddToCart(".products .add-to-cart", {
  card: ".product-card",
  title: "h3",
  price: ".product-price"
});

wireAddToCart(".menu .add-to-cart", {
  card: ".menu-card",
  title: ".menu-card-title",
  price: ".menu-card-price"
});

// ==================================================
// MODAL DETAIL PRODUK
// ==================================================
(function() {
  'use strict';

  const modalDetail = $('#modal-detail-produk');
  const modalOverlay = modalDetail?.querySelector('.modal-detail-overlay');
  const modalClose = modalDetail?.querySelector('.modal-detail-close');
  
  let currentProductData = null;

  function openModalDetail(productData) {
    if (!modalDetail) return;
    
    currentProductData = productData;
    
    const modalImg = $('#modal-img');
    const modalTitle = $('#modal-title');
    const modalStars = $('#modal-stars');
    const modalPrice = $('#modal-price');
    
    if (modalImg) {
      modalImg.src = productData.img;
      modalImg.alt = productData.title;
    }
    
    if (modalTitle) {
      modalTitle.textContent = productData.title;
    }
    
    if (modalStars && productData.stars) {
      modalStars.innerHTML = productData.stars;
      if (window.feather) feather.replace();
    }
    
    if (modalPrice) {
      const priceCurrentEl = modalPrice.querySelector('.price-current');
      const priceOldEl = modalPrice.querySelector('.price-old');
      
      if (priceCurrentEl) {
        priceCurrentEl.textContent = productData.price;
      }
      
      if (priceOldEl && productData.priceOld) {
        priceOldEl.textContent = productData.priceOld;
        priceOldEl.style.display = 'inline';
      } else if (priceOldEl) {
        priceOldEl.style.display = 'none';
      }
    }
    
    modalDetail.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (window.feather) feather.replace();
  }

  window.closeModalDetail = function() {
    if (!modalDetail) return;
    modalDetail.classList.remove('active');
    document.body.style.overflow = '';
    currentProductData = null;
  };

  if (modalClose) {
    modalClose.addEventListener('click', function(e) {
      e.preventDefault();
      window.closeModalDetail();
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function() {
      window.closeModalDetail();
    });
  }

  function wireDetailButtons() {
    const detailButtons = $('.item-detail-button', true);
    
    detailButtons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const card = btn.closest('.product-card') || btn.closest('.menu-card');
        if (!card) return;
        
        const img = card.querySelector('img')?.src || '';
        const title = card.querySelector('h3')?.textContent?.trim() || 'Produk';
        
        const priceElement = card.querySelector('.product-price, .menu-card-price');
        const priceText = priceElement?.textContent?.trim() || '0';
        
        let price = priceText;
        let priceOld = '';
        
        if (priceElement) {
          const priceSpan = priceElement.querySelector('span');
          if (priceSpan) {
            priceOld = priceSpan.textContent.trim();
            price = priceText.replace(priceOld, '').trim();
          }
        }
        
        const starsContainer = card.querySelector('.product-stars');
        let starsHTML = '';
        if (starsContainer) {
          starsHTML = starsContainer.innerHTML;
        }
        
        openModalDetail({
          img: img,
          title: title,
          price: price,
          priceOld: priceOld,
          stars: starsHTML
        });
      });
    });
  }

  const modalAddToCart = $('#modal-add-to-cart');
  if (modalAddToCart) {
    modalAddToCart.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (!currentProductData) return;
      
      const qty = $('#modal-qty')?.value || 1;
      
      if (typeof addToCart === 'function') {
        addToCart(
          currentProductData.img,
          currentProductData.title,
          currentProductData.price,
          qty
        );
        
        window.closeModalDetail();
        
        const cartPanel = $('.shopping-cart');
        if (cartPanel) {
          cartPanel.classList.add('active');
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireDetailButtons);
  } else {
    wireDetailButtons();
  }

})();

// ==================================================
// MODAL CHECKOUT (FITUR BARU)
// ==================================================
const modalCheckout = $('#modal-checkout');
const modalCheckoutOverlay = modalCheckout?.querySelector('.modal-checkout-overlay');
const modalCheckoutClose = modalCheckout?.querySelector('.modal-checkout-close');

function openCheckoutModal() {
  if (!modalCheckout || cartItems.length === 0) {
    showToast('❌ Keranjang masih kosong!');
    return;
  }

  // Render checkout items
  const checkoutItemsEl = $('#checkout-items');
  if (checkoutItemsEl) {
    checkoutItemsEl.innerHTML = '';
    
    let total = 0;
    cartItems.forEach(item => {
      const lineTotal = item.priceRaw * item.qty;
      total += lineTotal;
      
      const itemDiv = document.createElement('div');
      itemDiv.className = 'checkout-item';
      itemDiv.innerHTML = `
        <div>
          <div class="checkout-item-name">${item.title}</div>
          <div class="checkout-item-details">${item.qty} × ${formatIDR(item.priceRaw)}</div>
        </div>
        <div class="checkout-item-price">${formatIDR(lineTotal)}</div>
      `;
      checkoutItemsEl.appendChild(itemDiv);
    });
    
    const totalEl = $('#checkout-total-price');
    if (totalEl) totalEl.textContent = formatIDR(total);
  }

  modalCheckout.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Tutup cart panel
  cartPanel?.classList.remove('active');
  
  if (window.feather) feather.replace();
}

function closeCheckoutModal() {
  if (!modalCheckout) return;
  modalCheckout.classList.remove('active');
  document.body.style.overflow = '';
}

if (modalCheckoutClose) {
  modalCheckoutClose.addEventListener('click', (e) => {
    e.preventDefault();
    closeCheckoutModal();
  });
}

if (modalCheckoutOverlay) {
  modalCheckoutOverlay.addEventListener('click', closeCheckoutModal);
}

// Handle form checkout
const checkoutForm = $('#checkout-form');
if (checkoutForm) {
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Ambil data form
    const name = $('#customer-name')?.value || '';
    const phone = $('#customer-phone')?.value || '';
    const email = $('#customer-email')?.value || '';
    const address = $('#customer-address')?.value || '';
    const city = $('#customer-city')?.value || '';
    const postal = $('#customer-postal')?.value || '';
    const notes = $('#customer-notes')?.value || '';
    const payment = document.querySelector('input[name="payment"]:checked')?.value || 'whatsapp';
    
    // Validasi
    if (!name || !phone || !address || !city) {
      showToast('❌ Mohon lengkapi data yang wajib diisi!');
      return;
    }
    
    // Format pesan untuk WhatsApp
    let message = `*PESANAN BARU - BATIK NAELA*\n\n`;
    message += `*Data Pembeli:*\n`;
    message += `Nama: ${name}\n`;
    message += `WhatsApp: ${phone}\n`;
    if (email) message += `Email: ${email}\n`;
    message += `Alamat: ${address}\n`;
    message += `Kota: ${city}\n`;
    if (postal) message += `Kode Pos: ${postal}\n`;
    message += `\n*Detail Pesanan:*\n`;
    
    let total = 0;
    cartItems.forEach((item, idx) => {
      const lineTotal = item.priceRaw * item.qty;
      total += lineTotal;
      message += `${idx + 1}. ${item.title}\n`;
      message += `   ${item.qty} × ${formatIDR(item.priceRaw)} = ${formatIDR(lineTotal)}\n`;
    });
    
    message += `\n*Total: ${formatIDR(total)}*\n`;
    message += `\n*Metode: ${payment === 'whatsapp' ? 'WhatsApp' : payment === 'transfer' ? 'Transfer Bank' : 'COD'}*\n`;
    
    if (notes) {
      message += `\n*Catatan:*\n${notes}`;
    }
    
    // Redirect ke WhatsApp
    const waPhone = "087845178824"; // Ganti dengan nomor Anda
    const waURL = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    
    // Buka WhatsApp
    window.open(waURL, '_blank');
    
    // Tutup modal & reset
    setTimeout(() => {
      closeCheckoutModal();
      cartItems = [];
      renderCart();
      checkoutForm.reset();
      showToast('✓ Pesanan dikirim ke WhatsApp!');
    }, 500);
  });
}

// ==================================================
// SMOOTH SCROLL
// ==================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    
    if (href === '#' || this.classList.contains('add-to-cart')) {
      return;
    }
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      navMenu?.classList.remove('active');
    }
  });
});

// ==================================================
// NEWSLETTER FORM
// ==================================================
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
      showToast('✓ Terima kasih! Email Anda telah terdaftar.');
      emailInput.value = '';
    }
  });
}

// ==================================================
// DOM CONTENT LOADED
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
  if (window.feather) {
    feather.replace();
  }

  observeElements();

  console.log('🎉 Batik Naela - Website Loaded Successfully!');
});

// ==================================================
// DEBUG MODE (Development Only)
// ==================================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugCart = () => {
    console.log('🛒 Cart Items:', cartItems);
    console.log('📊 Total Items:', cartItems.length);
    console.log('🔢 Total Quantity:', cartItems.reduce((a, b) => a + Number(b.qty || 0), 0));
  };
  
  console.log('💡 Debug Mode: Type "debugCart()" in console');
}

// ==================================================
// END OF SCRIPT
// ==================================================