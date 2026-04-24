import{M as T}from"./menu.C1mhG9KL.js";const h="temaky-v6-cart";function P(){try{const t=localStorage.getItem(h);if(!t)return[];const a=JSON.parse(t);return Array.isArray(a)?a:[]}catch{return[]}}let i=[];function v(){try{localStorage.setItem(h,JSON.stringify(i))}catch{}}function I(){let t=0;i.forEach(n=>{t+=n.lineTotal});const a=i.filter(n=>n.bundle==="clasico").reduce((n,d)=>n+d.qty,0),e=i.filter(n=>n.bundle==="signature").reduce((n,d)=>n+d.qty,0),s=Math.floor(a/2),o=Math.floor(e/2),c=s*51+o*41;return{subtotal:t,bundleSaving:c,total:t-c,cPairs:s,sPairs:o}}function l(t){return t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function k(t){const{product:a,qty:e,sels:s,notes:o}=t,c=[];let n=0;Object.entries(s).forEach(([f,B])=>{const b=T[f];b&&B.forEach(y=>{const u=b.items.find(C=>C.id===y);u&&(c.push({id:y,name:u.name,price:u.price,group:f}),n+=u.price)})});const d=a.price,L=(d+n)*e,w=`${a.id}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;i.push({cartId:w,id:a.id,name:a.name,price:d,modsTotal:n,mods:c,notes:o,qty:e,lineTotal:L,bundle:a.bundle??null}),v(),m(),p(),q()}function g(t,a){const e=i.find(s=>s.cartId===t);e&&(e.qty=Math.max(0,e.qty+a),e.qty===0?i=i.filter(s=>s.cartId!==t):e.lineTotal=(e.price+e.modsTotal)*e.qty,v(),m(),p())}function S(t){i=i.filter(a=>a.cartId!==t),v(),m(),p()}function m(){const t=document.getElementById("cart-body"),a=document.getElementById("cart-foot");if(!t||!a)return;if(!i.length){t.innerHTML=`<div class="ce">
      <div class="ce-ico">🛒</div>
      <div class="ce-t">Tu pedido está vacío</div>
      <div class="ce-s">Explora el menú y agrega tus platillos favoritos</div>
      <button class="ce-btn" type="button" id="ce-open-menu">Ver Menú</button>
    </div>`,a.hidden=!0;return}const e=I();let s=i.map(c=>`
    <div class="ci">
      <div class="ci-inf">
        <div class="ci-name">${l(c.name)}</div>
        ${c.mods.length?`<div class="ci-mods">${c.mods.map(n=>l(n.name)+(n.price>0?` +$${n.price}`:"")).join(" · ")}</div>`:""}
        ${c.notes?`<div class="ci-notes">📝 ${l(c.notes)}</div>`:""}
      </div>
      <div class="ci-r">
        <span class="ci-price"><span class="currency">$</span>${c.lineTotal}</span>
        <div class="ci-ctrl">
          <button class="cib" type="button" data-action="dec" data-id="${l(c.cartId)}">−</button>
          <span class="cin">${c.qty}</span>
          <button class="cib" type="button" data-action="inc" data-id="${l(c.cartId)}">+</button>
          <button class="cib del" type="button" data-action="rm" data-id="${l(c.cartId)}" aria-label="Eliminar">✕</button>
        </div>
      </div>
    </div>`).join("");e.cPairs>0&&(s+=`<div class="bundle-tip">
      <div class="bt-lbl">🎉 Promo 2×$199 aplicada</div>
      <div class="bt-txt">${e.cPairs} par${e.cPairs>1?"es":""} de Rollos Clásicos — <span class="bt-save">ahorro $${e.cPairs*51}</span></div>
    </div>`),e.sPairs>0&&(s+=`<div class="bundle-tip">
      <div class="bt-lbl">🎉 Promo 2×$229 aplicada</div>
      <div class="bt-txt">${e.sPairs} par${e.sPairs>1?"es":""} de Signature Rolls — <span class="bt-save">ahorro $${e.sPairs*41}</span></div>
    </div>`),t.innerHTML=s;let o=`<div class="cart-lines">
    <div class="cl"><span class="cl-lbl">Subtotal</span><span class="cl-val">$${e.subtotal}</span></div>`;e.bundleSaving>0&&(o+=`<div class="cl saving"><span class="cl-lbl">Promo aplicada</span><span class="cl-val">−$${e.bundleSaving}</span></div>`),o+=`<div class="cl total"><span class="cl-lbl">Total del pedido</span><span class="cl-val">$${e.total}</span></div>
  </div>
  <button class="cart-wa" type="button" id="cart-checkout" disabled>
    Enviar pedido (próximo paso)
  </button>
  <p class="cart-note">Checkout por WhatsApp se conecta en F3-5.</p>`,a.innerHTML=o,a.hidden=!1}function p(){const t=i.reduce((c,n)=>c+n.qty,0),{total:a}=I(),e=document.getElementById("cart-fab"),s=document.getElementById("cart-fab-total"),o=document.getElementById("cart-fab-count");s&&(s.textContent=`$${a}`),o&&(o.textContent=`${t} item${t!==1?"s":""}`),e&&e.classList.toggle("show",t>0)}function q(){const t=document.getElementById("cart-fab");t&&(t.classList.add("pulse"),setTimeout(()=>t.classList.remove("pulse"),600))}function E(){const t=document.getElementById("cart-overlay");t&&(t.hidden=!1,m(),requestAnimationFrame(()=>t.classList.add("open")),t.setAttribute("aria-hidden","false"),document.body.style.overflow="hidden")}function r(){const t=document.getElementById("cart-overlay");if(!t)return;t.classList.remove("open"),t.setAttribute("aria-hidden","true"),setTimeout(()=>{t.hidden=!0},300);const a=document.getElementById("menu-overlay")?.classList.contains("open"),e=document.getElementById("psheet")?.classList.contains("open");!a&&!e&&(document.body.style.overflow="")}function $(){i=P();const t=document.getElementById("cart-overlay");if(!t)return;p(),window.addEventListener("temaky:add-cart",e=>{const s=e.detail;s&&s.product&&k(s)}),window.addEventListener("temaky:open-cart",E),window.addEventListener("temaky:close-cart",r),document.getElementById("cart-fab")?.addEventListener("click",E),document.getElementById("cart-close")?.addEventListener("click",r),document.getElementById("cart-scrim")?.addEventListener("click",r),document.getElementById("cart-body")?.addEventListener("click",e=>{const s=e.target,o=s.closest("[data-action]");if(o){const c=o.dataset.id??"",n=o.dataset.action;n==="inc"?g(c,1):n==="dec"?g(c,-1):n==="rm"&&S(c);return}s.closest("#ce-open-menu")&&(r(),window.dispatchEvent(new CustomEvent("temaky:open-menu")))}),document.addEventListener("keydown",e=>{e.key==="Escape"&&!t.hidden&&r()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",$):$();
