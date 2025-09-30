
(function(){
  const WA = '923078879961';
  const addForm = document.getElementById('addItemForm');
  const menuGrid = document.getElementById('menuGrid');

  function createMenuCard(name, serves, price, img){
    const el = document.createElement('article');
    el.className = 'menu-card';
    el.innerHTML = `<img src="${img}" alt="${name}"><h4>${name}</h4><div class="meta">Serves: ${serves}</div><div class="price">Rs ${price}</div><a class="order-small" href="https://wa.me/${WA}?text=${encodeURIComponent('I want to order '+name+' (Rs '+price+')')}" target="_blank">Order</a>`;
    return el;
  }

  // load saved menu from localStorage
  const saved = JSON.parse(localStorage.getItem('apna_menu')||'[]');
  saved.forEach(it => menuGrid.appendChild(createMenuCard(it.name, it.serves, it.price, it.img)));

  // handle add form
  addForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('itemName').value.trim();
    const price = document.getElementById('itemPrice').value.trim();
    const serves = document.getElementById('itemServes').value.trim();
    const img = document.getElementById('itemImage').value.trim();
    if(!name||!price||!img||!serves) return alert('Please fill all fields');
    const obj = {name,price,serves,img};
    const arr = JSON.parse(localStorage.getItem('apna_menu')||'[]');
    arr.push(obj);
    localStorage.setItem('apna_menu', JSON.stringify(arr));
    menuGrid.appendChild(createMenuCard(name, serves, price, img));
    addForm.reset();
  });

})();
