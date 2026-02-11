document.getElementById("year").textContent = new Date().getFullYear();

// ✅ GANTI NOMOR WA KAMU (tanpa +)
const WA_NUMBER = "6283121214520";

// ====== DATA PRODUK (ubah sesuai toko kamu) ======
const PRODUCTS = [
  { id: "p1", name: "Panel Store (Template)", price: 49000, cat: "digital", desc: "Template store statis + cart + checkout WA." },
  { id: "p2", name: "Jasa Setup Domain Vercel", price: 25000, cat: "tools", desc: "Bantu pasang domain ke Vercel + DNS." },
  { id: "p3", name: "Sticker Zeta Pack", price: 15000, cat: "fashion", desc: "Sticker lucu buat laptop/HP (contoh produk fisik)." },
  { id: "p4", name: "Source Code Bot Addon", price: 99000, cat: "digital", desc: "Addon fitur tambahan untuk bot kamu." },
  { id: "p5", name: "Kaos Zeta", price: 125000, cat: "fashion", desc: "Kaos premium (contoh)." },
  { id: "p6", name: "Tooling Pack", price: 79000, cat: "tools", desc: "Kumpulan script utilitas dev (contoh)." },
];

// ====== HELPERS ======
const rupiah = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

const els = {
  products: document.getElementById("products"),
  q: document.getElementById("q"),
  sort: document.getElementById("sort"),
  resultInfo: document.getElementById("resultInfo"),
  cartCount: document.getElementById("cartCount"),
  openCart: document.getElementById("openCart"),
  closeCart: document.getElementById("closeCart"),
  drawer: document.getElementById("drawer"),
  backdrop: document.getElementById("backdrop"),
  cartItems: document.getElementById("cartItems"),
  cartEmpty: document.getElementById("cartEmpty"),
  subtotal: document.getElementById("subtotal"),
  checkout: document.getElementById("checkout"),
  clearCart: document.getElementById("clearCart"),
  note: document.getElementById("note"),
  buyerName: document.getElementById("buyerName"),
  buyerAddress: document.getElementById("buyerAddress"),
  cartMsg: document.getElementById("cartMsg"),
};

let state = {
  cat: "all",
  q: "",
  sort: "reco",
  cart: loadCart(),
};

function loadCart(){
  try { return JSON.parse(localStorage.getItem("zeta_cart") || "{}"); }
  catch { return {}; }
}
function saveCart(){
  localStorage.setItem("zeta_cart", JSON.stringify(state.cart));
  renderCartBadge();
}
function cartCount(){
  return Object.values(state.cart).reduce((a,b)=>a+b,0);
}
function cartSubtotal(){
  let sum = 0;
  for (const [id, qty] of Object.entries(state.cart)) {
    const p = PRODUCTS.find(x => x.id === id);
    if (p) sum += p.price * qty;
  }
  return sum;
}

// ====== PRODUCTS RENDER ======
function getFiltered(){
  let list = [...PRODUCTS];

  if (state.cat !== "all") list = list.filter(p => p.cat === state.cat);

  const q = state.q.trim().toLowerCase();
  if (q) list = list.filter(p =>
    (p.name + " " + p.desc + " " + p.cat).toLowerCase().includes(q)
  );

  switch(state.sort){
    case "low": list.sort((a,b)=>a.price-b.price); break;
    case "high": list.sort((a,b)=>b.price-a.price); break;
    case "az": list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    default: /* reco */ break;
  }
  return list;
}

function renderProducts(){
  const list = getFiltered();
  els.products.innerHTML = list.map(p => `
    <article class="product">
      <div class="thumb"></div>
      <div class="pbody">
        <div class="ptop">
          <div>
            <div class="pname">${p.name}</div>
            <div class="cat">${p.cat.toUpperCase()}</div>
          </div>
          <div class="price">${rupiah(p.price)}</div>
        </div>
        <div class="pdesc">${p.desc}</div>
        <div class="pactions">
          <button class="btn small" data-add="${p.id}">Tambah</button>
          <button class="btn ghost small" data-buy="${p.id}">Beli cepat</button>
        </div>
      </div>
    </article>
  `).join("");

  els.resultInfo.textContent = list.length
    ? `Menampilkan ${list.length} produk`
    : `Tidak ada produk yang cocok`;
}

function addToCart(id, qty=1){
  state.cart[id] = (state.cart[id] || 0) + qty;
  if (state.cart[id] <= 0) delete state.cart[id];
  saveCart();
  renderCart();
}

function renderCartBadge(){
  els.cartCount.textContent = String(cartCount());
}

// ====== CART DRAWER ======
function openDrawer(){
  els.drawer.classList.add("open");
  els.drawer.setAttribute("aria-hidden", "false");
  els.backdrop.hidden = false;
}
function closeDrawer(){
  els.drawer.classList.remove("open");
  els.drawer.setAttribute("aria-hidden", "true");
  els.backdrop.hidden = true;
  els.cartMsg.textContent = "";
}

function renderCart(){
  const entries = Object.entries(state.cart);
  const isEmpty = entries.length === 0;

  els.cartEmpty.style.display = isEmpty ? "block" : "none";
  els.cartItems.style.display = isEmpty ? "none" : "grid";

  els.cartItems.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return "";
    const total = p.price * qty;
    return `
      <div class="citem">
        <div class="crow">
          <b>${p.name}</b>
          <span>${rupiah(total)}</span>
        </div>
        <div class="crow">
          <span class="muted">${rupiah(p.price)} / item</span>
          <div class="qty">
            <button data-dec="${id}">−</button>
            <b>${qty}</b>
            <button data-inc="${id}">+</button>
          </div>
        </div>
        <button class="btn ghost" data-remove="${id}">Hapus</button>
      </div>
    `;
  }).join("");

  els.subtotal.textContent = rupiah(cartSubtotal());
  renderCartBadge();
}

// ====== CHECKOUT WA ======
function checkoutWA(){
  const entries = Object.entries(state.cart);
  if (!entries.length){
    els.cartMsg.textContent = "Keranjang masih kosong.";
    return;
  }

  const name = (els.buyerName.value || "").trim();
  const addr = (els.buyerAddress.value || "").trim();
  const note = (els.note.value || "").trim();

  let text = `Halo Zeta Store! Saya mau order:\n\n`;
  entries.forEach(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    text += `• ${p.name} x${qty} = ${rupiah(p.price * qty)}\n`;
  });

  text += `\nSubtotal: ${rupiah(cartSubtotal())}\n`;
  if (name) text += `Nama: ${name}\n`;
  if (addr) text += `Alamat: ${addr}\n`;
  if (note) text += `Catatan: ${note}\n`;
  text += `\nTerima kasih!`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

// ====== EVENTS ======
els.q.addEventListener("input", (e) => {
  state.q = e.target.value;
  renderProducts();
});

els.sort.addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderProducts();
});

document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    state.cat = btn.dataset.cat;
    renderProducts();
  });
});

els.products.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]")?.dataset.add;
  const buy = e.target.closest("[data-buy]")?.dataset.buy;

  if (add) addToCart(add, 1);

  if (buy){
    addToCart(buy, 1);
    openDrawer();
  }
});

els.openCart.addEventListener("click", () => { renderCart(); openDrawer(); });
els.closeCart.addEventListener("click", closeDrawer);
els.backdrop.addEventListener("click", closeDrawer);

els.cartItems.addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]")?.dataset.inc;
  const dec = e.target.closest("[data-dec]")?.dataset.dec;
  const rem = e.target.closest("[data-remove]")?.dataset.remove;

  if (inc) addToCart(inc, 1);
  if (dec) addToCart(dec, -1);
  if (rem) { delete state.cart[rem]; saveCart(); renderCart(); }
});

els.checkout.addEventListener("click", checkoutWA);
els.clearCart.addEventListener("click", () => {
  state.cart = {};
  saveCart();
  renderCart();
  els.cartMsg.textContent = "Keranjang dikosongkan.";
});

// ====== INIT ======
renderProducts();
renderCartBadge();
