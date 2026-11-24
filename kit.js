/* Kit de interfaz del sitio: tema (Sistema / Claro / Oscuro) bajo un engranaje,
   descripción al pasar el mouse en botones de solo símbolo y enlace para saltar al contenido. */
(function(){
  "use strict";
  var d=document, r=d.documentElement, ID=d.title||location.pathname;
  var TCLAVE="pz-tema:"+ID;
  if(!r.lang) r.lang="es";

  /* Tema: se aplica antes de pintar para no parpadear */
  var metaTema=d.querySelector('meta[name="pz-tema"]'), temaActual="system";
  function normal(v){ v=String(v||"").toLowerCase(); return (v==="light"||v==="claro")?"light":(v==="dark"||v==="oscuro")?"dark":"system"; }
  function tema(t,guardar){
    temaActual=normal(t);
    if(temaActual==="system") r.removeAttribute("data-theme"); else r.setAttribute("data-theme",temaActual);
    if(guardar) try{ localStorage.setItem(TCLAVE,temaActual); }catch(_){}
    d.querySelectorAll(".pz-tema [data-pz-tema]").forEach(function(b){ b.setAttribute("aria-pressed",String(b.getAttribute("data-pz-tema")===temaActual)); });
  }
  if(metaTema){
    var guardado=null;
    try{ guardado=localStorage.getItem(TCLAVE); if(guardado==null&&metaTema.content) guardado=localStorage.getItem(metaTema.content); }catch(_){}
    tema(guardado);
  }
  d.addEventListener("click",function(e){
    var t=e.target.closest&&e.target.closest(".pz-tema [data-pz-tema]");
    if(t) tema(t.getAttribute("data-pz-tema"),true);
  });

  /* Opciones bajo engranaje: un .pz-tema visible pasa a un menú */
  var GEAR='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/><circle cx="12" cy="12" r="6.6"/></svg>';
  var nAj=0;
  function cerrarAj(salvo){ d.querySelectorAll(".pz-aj-btn").forEach(function(b){ if(b===salvo) return; b.setAttribute("aria-expanded","false"); var p=d.getElementById(b.getAttribute("aria-controls")); if(p) p.hidden=true; }); }
  function engranar(){
    d.querySelectorAll(".pz-tema").forEach(function(t){
      if(t.closest(".pz-aj,[hidden],dialog,[popover],.gear-pop,[role='menu']")) return;
      var w=d.createElement("div"); w.className="pz-aj";
      var b=d.createElement("button"); b.type="button"; b.className="pz-aj-btn"; b.innerHTML=GEAR;
      b.setAttribute("aria-label","Opciones de vista"); b.setAttribute("data-pz-tip","Opciones de vista"); b.setAttribute("aria-expanded","false");
      var p=d.createElement("div"); p.className="pz-aj-pop"; p.id="pz-aj-"+(nAj++); p.hidden=true; b.setAttribute("aria-controls",p.id);
      var tt=d.createElement("span"); tt.className="pz-aj-t"; tt.textContent="Tema";
      t.parentNode.insertBefore(w,t); p.appendChild(tt); p.appendChild(t); w.appendChild(b); w.appendChild(p);
      b.addEventListener("click",function(e){ e.stopPropagation(); var abrir=p.hidden; cerrarAj(b); p.hidden=!abrir; b.setAttribute("aria-expanded",String(abrir)); if(abrir){ var rb=b.getBoundingClientRect(); p.classList.toggle("izq",rb.left+rb.width/2<innerWidth/2); var on=p.querySelector('[aria-pressed="true"]')||p.querySelector("button"); if(on) on.focus(); } });
    });
    d.addEventListener("click",function(e){ if(!(e.target.closest&&e.target.closest(".pz-aj"))) cerrarAj(); });
    d.addEventListener("keydown",function(e){ if(e.key!=="Escape") return; var ab=d.querySelector('.pz-aj-btn[aria-expanded="true"]'); if(ab){ cerrarAj(); ab.focus(); } });
  }

  /* Descripción al pasar el mouse en los botones de solo símbolo */
  var tip=null, tipDe=null;
  function soloSimbolo(el){
    if(el.matches(".pz-ibtn,[data-tip]")) return false;
    var t=(el.textContent||"").replace(/\s+/g,"");
    return !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2}/.test(t);
  }
  function textoTip(el){
    if(el.hasAttribute("title")){ if(!el.hasAttribute("data-pz-tip")) el.setAttribute("data-pz-tip",el.getAttribute("title")); el.removeAttribute("title"); }
    return el.getAttribute("data-pz-tip")||el.getAttribute("aria-label")||"";
  }
  function mostrarTip(el){
    var txt=textoTip(el); if(!txt) return;
    if(!tip){ tip=d.createElement("div"); tip.className="pz-tip"; tip.setAttribute("role","tooltip"); tip.id="pz-tip"; d.body.appendChild(tip); }
    tip.textContent=txt; tip.hidden=false; tipDe=el;
    var b=el.getBoundingClientRect(), w=tip.offsetWidth, h=tip.offsetHeight;
    var x=Math.max(8,Math.min(innerWidth-w-8,b.left+b.width/2-w/2)), y=b.top-h-8; if(y<8) y=b.bottom+8;
    tip.style.left=x+"px"; tip.style.top=y+"px";
  }
  function ocultarTip(){ if(tip) tip.hidden=true; tipDe=null; }
  function candidato(t){ var el=t&&t.closest&&t.closest("button,a[href],[role='button']"); return el&&soloSimbolo(el)?el:null; }
  d.addEventListener("pointerover",function(e){ if(e.pointerType==="touch") return; var el=candidato(e.target); if(el&&el!==tipDe) mostrarTip(el); else if(!el) ocultarTip(); });
  d.addEventListener("pointerout",function(e){ if(tipDe&&!(e.relatedTarget&&tipDe.contains(e.relatedTarget))) ocultarTip(); });
  d.addEventListener("focusin",function(e){ var el=candidato(e.target); if(el&&el.matches(":focus-visible")) mostrarTip(el); else ocultarTip(); });
  d.addEventListener("focusout",ocultarTip);
  addEventListener("scroll",ocultarTip,{passive:true,capture:true});
  d.addEventListener("pointerdown",ocultarTip);

  function listo(){
    engranar();
    if(metaTema) tema(temaActual);
    /* Enlace para saltar al contenido (teclado); no cambia el hash */
    if(!d.querySelector(".pz-saltar")){
      var g=d.querySelector(".pz-greca"), dest=d.querySelector("main")||(g&&(g.nextElementSibling||(g.parentElement&&g.parentElement.nextElementSibling)));
      if(dest){
        if(!dest.id) dest.id="pz-contenido";
        if(!dest.hasAttribute("tabindex")) dest.setAttribute("tabindex","-1");
        var sl=d.createElement("a"); sl.className="pz-saltar"; sl.href="#"+dest.id; sl.textContent="Saltar al contenido";
        sl.addEventListener("click",function(e){ e.preventDefault(); dest.focus({preventScroll:true}); dest.scrollIntoView({block:"start"}); });
        d.body.insertBefore(sl,d.body.firstChild);
      }
    }
  }
  if(d.readyState==="loading") d.addEventListener("DOMContentLoaded",listo); else listo();
})();
