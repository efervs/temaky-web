import{t as q}from"./focus-trap.BybY3HOm.js";import{f as L,M as f}from"./menu.C1mhG9KL.js";const t={prod:null,qty:1,sels:{},notes:""};let m=null,u=null;function d(e){return e.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s])}function B(){if(!t.prod)return 0;let e=t.prod.price;return Object.entries(t.sels).forEach(([s,a])=>{const n=f[s];n&&a.forEach(o=>{const c=n.items.find(r=>r.id===o);c&&(e+=c.price)})}),e*t.qty}function v(){return t.prod?(t.prod.mods??[]).every(e=>{const s=f[e];return!s||!s.req?!0:(t.sels[e]?.size??0)>0}):!1}function I(e){const s=L(e);if(!s)return;t.prod=s,t.qty=1,t.sels={},t.notes="",(s.mods??[]).forEach(o=>{t.sels[o]=new Set}),$();const a=document.getElementById("psheet"),n=document.getElementById("psheet-scrim");a&&n&&(m=document.activeElement,a.hidden=!1,n.hidden=!1,requestAnimationFrame(()=>{a.classList.add("open"),n.classList.add("open"),requestAnimationFrame(()=>{document.getElementById("psh-close")?.focus(),u?.(),u=q(a)})}),a.setAttribute("aria-hidden","false"),document.body.style.overflow="hidden")}function p(){const e=document.getElementById("psheet"),s=document.getElementById("psheet-scrim");if(!e||!s)return;e.classList.remove("open"),s.classList.remove("open"),e.setAttribute("aria-hidden","true"),u?.(),u=null;const a=m;m=null,setTimeout(()=>{e.hidden=!0,s.hidden=!0,a?.focus()},340);const n=document.getElementById("menu-overlay")?.classList.contains("open"),o=document.getElementById("cart-overlay")?.classList.contains("open");!n&&!o&&(document.body.style.overflow="")}function $(){if(!t.prod)return;const e=t.prod,s=document.getElementById("psh-hero");s.innerHTML=`
    <img src="${d(e.img)}" alt="${d(e.name)}" />
    <button class="sheet-close" id="psh-close" type="button" aria-label="Cerrar">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
  `;const a=document.getElementById("psh-head");a.innerHTML=`
    <div class="sh-head">
      <span class="sh-name">${d(e.name)}</span>
      <span class="sh-price"><span class="currency">$</span>${e.price}</span>
    </div>
    ${e.deal||e.badge?`<div class="sh-tags">
      ${e.badge?`<span class="sh-tag cat">${d(e.badge)}</span>`:""}
      ${e.deal?`<span class="sh-tag promo">Promo ${d(e.deal)}</span>`:""}
    </div>`:""}
    <p class="sh-desc">${d(e.desc)}</p>
  `;const n=document.getElementById("psh-body");let o="";(e.mods??[]).forEach(c=>{const r=f[c];if(!r)return;const i=r.type==="radio",E=i?"radiogroup":"group",y=`mod-lbl-${d(c)}`;o+=`<div class="mod-group">
      <div class="mod-head">
        <span class="mod-label" id="${y}">${d(r.lbl)}</span>
        <span class="mod-hint">${r.req?"Requerido":"Opcional"}</span>
      </div>
      <div class="mod-list" role="${E}" aria-labelledby="${y}">`,r.items.forEach(l=>{const b=t.sels[c]?.has(l.id)??!1;o+=`<button class="mod-item${b?" sel":""}" type="button"
        role="${i?"radio":"checkbox"}" aria-checked="${b?"true":"false"}"
        data-gid="${d(c)}" data-item="${d(l.id)}" data-radio="${i?"1":"0"}">
        <span class="mod-box ${i?"radio":"check"}"><span class="inner"></span></span>
        <span class="mod-name">${d(l.name)}${l.sub?` <span class="mod-sub">· ${d(l.sub)}</span>`:""}</span>
        <span class="mod-plus${l.price===0?" free":""}">${l.price>0?`+$${l.price}`:"Incluido"}</span>
      </button>`}),o+="</div></div>"}),o+=`<div class="mod-group">
    <div class="mod-head"><label class="mod-label" for="psh-notes">Notas especiales</label><span class="mod-hint">Opcional</span></div>
    <textarea class="sh-notes" id="psh-notes" rows="2" placeholder="Ej: Sin alga, extra picante, alergia a…">${d(t.notes)}</textarea>
  </div>`,n.innerHTML=o,h()}function h(){const e=document.getElementById("psh-foot"),s=B(),a=v();e.innerHTML=`
    <div class="qty">
      <button class="qty-btn" id="psh-dec" type="button" aria-label="Disminuir cantidad" ${t.qty<=1?"disabled":""}>−</button>
      <span class="qty-val" aria-hidden="true">${t.qty}</span>
      <button class="qty-btn" id="psh-inc" type="button" aria-label="Aumentar cantidad">+</button>
    </div>
    <button class="add-btn" id="psh-add" type="button" ${a?"":"disabled"}>
      <span class="label">Agregar al pedido</span>
      <span class="price"><span class="currency">$</span>${s}</span>
    </button>
  `}function w(e,s,a){if(t.sels[e]||(t.sels[e]=new Set),a)t.sels[e]=new Set([s]);else{const n=t.sels[e];n.has(s)?n.delete(s):n.add(s)}$()}function M(){if(!t.prod||!v())return;const s=document.getElementById("psh-notes")?.value??t.notes;window.dispatchEvent(new CustomEvent("temaky:add-cart",{detail:{product:t.prod,qty:t.qty,sels:t.sels,notes:s}})),p()}function g(){const e=document.getElementById("psheet"),s=document.getElementById("psheet-scrim");!e||!s||(window.addEventListener("temaky:open-sheet",a=>{const n=a.detail;typeof n=="string"&&I(n)}),s.addEventListener("click",p),e.addEventListener("click",a=>{const n=a.target;if(n.closest("#psh-close")){p();return}const o=n.closest(".mod-item");if(o){const c=o.dataset.gid??"",r=o.dataset.item??"",i=o.dataset.radio==="1";w(c,r,i);return}if(n.closest("#psh-dec")){t.qty=Math.max(1,t.qty-1),h();return}if(n.closest("#psh-inc")){t.qty+=1,h();return}n.closest("#psh-add")&&M()}),e.addEventListener("input",a=>{const n=a.target;n.id==="psh-notes"&&(t.notes=n.value)}),document.addEventListener("keydown",a=>{a.key==="Escape"&&!e.hidden&&p()}))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",g):g();
