// APNAFOODS - Client-side script (Urdu)
(function(){
  const WA_NUMBER = "923078879961"; // provided WhatsApp number
  // sample menu (used if localStorage empty)
  const sampleMenu = [
    { id: 1, name: "چکن بریانی", price: 450, desc: "خوشبودار اور مزیدار" },
    { id: 2, name: "کباب رول (2pcs)", price: 220, desc: "گرما گرم رولز" },
    { id: 3, name: "پلاو", price: 300, desc: "گھر جیسا ذائقہ" },
    { id: 4, name: "سبزی کڑھی", price: 200, desc: "سبزی خوروں کیلئے" }
  ];

  // helpers
  const qs = sel => document.querySelector(sel);
  const qsa = sel => document.querySelectorAll(sel);

  // state from localStorage
  let menu = JSON.parse(localStorage.getItem("apna_menu") || "null") || sampleMenu;
  let cart = JSON.parse(localStorage.getItem("apna_cart") || "[]");

  // DOM refs
  const menuEl = qs("#menu");
  const cartItemsEl = qs("#cart-items");
  const cartTotalEl = qs("#cart-total");
  const checkoutBtn = qs("#checkout-btn");
  const clearCartBtn = qs("#clear-cart");
  const checkoutForm = qs("#checkout-form");
  const nameInput = qs("#cust-name");
  const phoneInput = qs("#cust-phone");
  const addressInput = qs("#cust-address");
  const notesCheckbox = qs("#include-notes");
  const notesInput = qs("#cust-notes");

  // admin refs
  const adminLoginBtn = qs("#admin-login");
  const adminLogoutBtn = qs("#admin-logout");
  const adminPassInput = qs("#admin-pass");
  const adminPanel = qs("#admin-panel");
  const addItemForm = qs("#add-item-form");

  function saveState(){
    localStorage.setItem("apna_menu", JSON.stringify(menu));
    localStorage.setItem("apna_cart", JSON.stringify(cart));
  }

  function renderMenu(){
    menuEl.innerHTML = "";
    menu.forEach(item => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <div>
          <h4>${escapeHtml(item.name)}</h4>
          <p>${escapeHtml(item.desc || "")}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start;margin-top:8px">
          <div class="price">Rs ${item.price}</div>
          <div class="controls">
            <button class="btn" data-id="${item.id}" onclick="addToCart(${item.id})">شامل کریں</button>
          </div>
        </div>
      `;
      menuEl.appendChild(div);
    });
  }

  // expose addToCart globally so inline onclick can call it
  window.addToCart = function(id){
    const it = menu.find(m => m.id === id);
    if(!it) return;
    const found = cart.find(c => c.id === id);
    if(found) found.qty += 1;
    else cart.push({ id: it.id, name: it.name, price: it.price, qty: 1 });
    saveState();
    renderCart();
  }

  function renderCart(){
    cartItemsEl.innerHTML = "";
    if(cart.length === 0){
      cartItemsEl.innerHTML = "<div class='hint'>کارٹ خالی ہے</div>";
      checkoutBtn.disabled = true;
      cartTotalEl.textContent = "Rs 0";
      return;
    }
    cart.forEach(c => {
      const row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = `
        <div style="flex:1">
          <div><strong>${escapeHtml(c.name)}</strong> x ${c.qty}</div>
          <div class="muted">Rs ${c.price} ہر ایک</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <div>Rs ${c.price * c.qty}</div>
          <div style="display:flex;gap:6px">
            <button class="btn" onclick="changeQty(${c.id},-1)">-</button>
            <button class="btn" onclick="changeQty(${c.id},1)">+</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });
    checkoutBtn.disabled = false;
    const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
    cartTotalEl.textContent = "Rs " + total;
  }

  window.changeQty = function(id, delta){
    const it = cart.find(c=>c.id===id);
    if(!it) return;
    it.qty += delta;
    if(it.qty <= 0) cart = cart.filter(c => c.id !== id);
    saveState();
    renderCart();
  }

  clearCartBtn.addEventListener("click", ()=>{ cart = []; saveState(); renderCart(); });

  // build whatsapp message and open link
  checkoutBtn.addEventListener("click", ()=>{
    // show form area if hidden
    if(checkoutForm.style.display !== "block"){
      checkoutForm.style.display = "block";
      return;
    }
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    if(!name || !phone || !address){
      alert("براہِ کرم نام، فون اور پتہ درج کریں");
      return;
    }
    const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
    let parts = cart.map(i => `${i.name} x ${i.qty}`).join(", ");
    let msg = `السلام علیکم! میں آرڈر دینا چاہتا/چاہتی ہوں: %0A${parts}%0Aکل: Rs ${total}%0A%0Aنام: ${encodeURIComponent(name)}%0Aفون: ${encodeURIComponent(phone)}%0Aپتہ: ${encodeURIComponent(address)}`;
    if(notesCheckbox.checked && notesInput.value.trim()){
      msg += `%0Aنوٹس: ${encodeURIComponent(notesInput.value.trim())}`;
    }
    // ensure using wa.me link
    const waLink = `https://wa.me/${WA_NUMBER}?text=${msg}`;
    // open in new tab — on mobile this will open WhatsApp app
    window.open(waLink, "_blank");
  });

  // admin simple auth (local)
  adminLoginBtn.addEventListener("click", ()=>{
    const pass = adminPassInput.value;
    if(pass === "admin123"){
      adminPanel.style.display = "block";
      adminLoginBtn.style.display = "none";
      adminLogoutBtn.style.display = "inline-block";
      adminPassInput.style.display = "none";
    } else alert("غلط پاس ورڈ");
  });
  adminLogoutBtn.addEventListener("click", ()=>{
    adminPanel.style.display = "none";
    adminLoginBtn.style.display = "inline-block";
    adminLogoutBtn.style.display = "none";
    adminPassInput.style.display = "inline-block";
    adminPassInput.value = "";
  });

  addItemForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    const price = Number(f.price.value||0);
    const desc = f.desc.value.trim();
    if(!name || !price) { alert("نام اور قیمت لازمی ہیں"); return; }
    const newItem = { id: Date.now(), name, price, desc };
    menu.push(newItem);
    saveState();
    renderMenu();
    f.reset();
  });

  // utilities
  function escapeHtml(str){ if(!str) return ""; return String(str).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }
  // initial render
  renderMenu();
  renderCart();
})();