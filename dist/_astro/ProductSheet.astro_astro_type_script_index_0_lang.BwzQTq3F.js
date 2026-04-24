import{f as g,M as m}from"./menu.C1mhG9KL.js";const t={prod:null,qty:1,sels:{},notes:""};function d(e){return e.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s])}function v(){if(!t.prod)return 0;let e=t.prod.price;return Object.entries(t.sels).forEach(([s,a])=>{const n=m[s];n&&a.forEach(o=>{const i=n.items.find(c=>c.id===o);i&&(e+=i.price)})}),e*t.qty}function f(){return t.prod?(t.prod.mods??[]).every(e=>{const s=m[e];return!s||!s.req?!0:(t.sels[e]?.size??0)>0}):!1}function $(e){const s=g(e);if(!s)return;t.prod=s,t.qty=1,t.sels={},t.notes="",(s.mods??[]).forEach(o=>{t.sels[o]=new Set}),y();const a=document.getElementById("psheet"),n=document.getElementById("psheet-scrim");a&&n&&(a.hidden=!1,n.hidden=!1,requestAnimationFrame(()=>{a.classList.add("open"),n.classList.add("open")}),a.setAttribute("aria-hidden","false"),document.body.style.overflow="hidden")}function p(){const e=document.getElementById("psheet"),s=document.getElementById("psheet-scrim");if(!e||!s)return;e.classList.remove("open"),s.classList.remove("open"),e.setAttribute("aria-hidden","true"),setTimeout(()=>{e.hidden=!0,s.hidden=!0},340);const a=document.getElementById("menu-overlay")?.classList.contains("open"),n=document.getElementById("cart-overlay")?.classList.contains("open");!a&&!n&&(document.body.style.overflow="")}function y(){if(!t.prod)return;const e=t.prod,s=document.getElementById("psh-hero");s.innerHTML=`
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
  `;const n=document.getElementById("psh-body");let o="";(e.mods??[]).forEach(i=>{const c=m[i];if(!c)return;const l=c.type==="radio";o+=`<div class="mod-group">
      <div class="mod-head">
        <span class="mod-label">${d(c.lbl)}</span>
        <span class="mod-hint">${c.req?"Requerido":"Opcional"}</span>
      </div>
      <div class="mod-list">`,c.items.forEach(r=>{const b=t.sels[i]?.has(r.id)??!1;o+=`<button class="mod-item${b?" sel":""}" type="button" data-gid="${d(i)}" data-item="${d(r.id)}" data-radio="${l?"1":"0"}">
        <span class="mod-box ${l?"radio":"check"}"><span class="inner"></span></span>
        <span class="mod-name">${d(r.name)}${r.sub?` <span class="mod-sub">· ${d(r.sub)}</span>`:""}</span>
        <span class="mod-plus${r.price===0?" free":""}">${r.price>0?`+$${r.price}`:"Incluido"}</span>
      </button>`}),o+="</div></div>"}),o+=`<div class="mod-group">
    <div class="mod-head"><span class="mod-label">Notas especiales</span><span class="mod-hint">Opcional</span></div>
    <textarea class="sh-notes" id="psh-notes" rows="2" placeholder="Ej: Sin alga, extra picante, alergia a…">${d(t.notes)}</textarea>
  </div>`,n.innerHTML=o,u()}function u(){const e=document.getElementById("psh-foot"),s=v(),a=f();e.innerHTML=`
    <div class="qty">
      <button class="qty-btn" id="psh-dec" type="button" ${t.qty<=1?"disabled":""}>−</button>
      <span class="qty-val">${t.qty}</span>
      <button class="qty-btn" id="psh-inc" type="button">+</button>
    </div>
    <button class="add-btn" id="psh-add" type="button" ${a?"":"disabled"}>
      <span class="label">Agregar al pedido</span>
      <span class="price"><span class="currency">$</span>${s}</span>
    </button>
  `}function E(e,s,a){if(t.sels[e]||(t.sels[e]=new Set),a)t.sels[e]=new Set([s]);else{const n=t.sels[e];n.has(s)?n.delete(s):n.add(s)}y()}function q(){if(!t.prod||!f())return;const s=document.getElementById("psh-notes")?.value??t.notes;window.dispatchEvent(new CustomEvent("temaky:add-cart",{detail:{product:t.prod,qty:t.qty,sels:t.sels,notes:s}})),p()}function h(){const e=document.getElementById("psheet"),s=document.getElementById("psheet-scrim");!e||!s||(window.addEventListener("temaky:open-sheet",a=>{const n=a.detail;typeof n=="string"&&$(n)}),s.addEventListener("click",p),e.addEventListener("click",a=>{const n=a.target;if(n.closest("#psh-close")){p();return}const o=n.closest(".mod-item");if(o){const i=o.dataset.gid??"",c=o.dataset.item??"",l=o.dataset.radio==="1";E(i,c,l);return}if(n.closest("#psh-dec")){t.qty=Math.max(1,t.qty-1),u();return}if(n.closest("#psh-inc")){t.qty+=1,u();return}n.closest("#psh-add")&&q()}),e.addEventListener("input",a=>{const n=a.target;n.id==="psh-notes"&&(t.notes=n.value)}),document.addEventListener("keydown",a=>{a.key==="Escape"&&!e.hidden&&p()}))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",h):h();
