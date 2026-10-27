/* ============================================================
   Delfos · kit de diseño compartido · v3 (2026-10-21) · comportamiento
   Va con delfos-kit.css; cada artefacto lo carga justo después de la hoja:
     <link rel="stylesheet" href="delfos-kit.css"><script src="delfos-kit.js"></script>
   · Idioma del documento: español.
   · Entrada ([data-pz-entrada]): la pintura aparece una vez por sesión y se salta
     con enlaces profundos (#… o ?…). Esc siempre entra. El texto dice «toca» o
     «haz clic» según el dispositivo. Mientras está abierta, el resto de la página
     queda inerte. Con data-pz-entrada="breve" (piezas públicas) la pintura se va
     sola en un momento: no hay que hacer nada para llegar al dato.
   · Enlaces .pz-volver y [data-pz-ir]: se abren en la misma pestaña; si el entorno
     no lo permite, en una nueva. Cmd/Ctrl-clic sigue abriendo pestaña nueva.
   · En pantallas táctiles, el botón de volver se aparta al bajar o al quedarse quieto
     a mitad de página, y vuelve al subir, arriba del todo y al final.
   · Tema (.pz-tema con botones [data-pz-tema="system|light|dark"]): opt-in con
     <meta name="pz-tema" content="clave-antigua"> antes de este script; la clave
     antigua (opcional) conserva la elección que la persona ya tenía guardada.
   API: PZ.entradaInicial() · PZ.marcarEntrada() · PZ.abrirEntrada() · PZ.ir(url) · PZ.tema(t)
   ============================================================ */
(function(){
  "use strict";
  var d=document, r=d.documentElement, ID=d.title||location.pathname;
  /* Las marcas van por artefacto: varias obras pueden compartir origen y almacenamiento */
  var CLAVE="pz-entro:"+ID, TCLAVE="pz-tema:"+ID;
  if(!r.lang) r.lang="es";
  var TOQUE=false; try{ TOQUE=matchMedia("(hover:none) and (pointer:coarse)").matches; }catch(_){}
  var CALMA=false; try{ CALMA=matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(_){}
  function yaEntro(){ try{ return sessionStorage.getItem(CLAVE)==="1"; }catch(_){ return false; } }
  var profundo=location.hash.length>1||location.search.length>1;
  var saltar=yaEntro()||profundo;
  if(saltar) r.classList.add("pz-sin-entrada");

  function marcarEntrada(){ try{ sessionStorage.setItem(CLAVE,"1"); }catch(_){} }

  /* Tema: Sistema / Claro / Oscuro. Se aplica antes de pintar para no parpadear. */
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

  /* Ir a otra página en la misma pestaña. Si el marco no puede mover la pestaña,
     se abre una nueva; si la navegación no arranca en 3 s, también. */
  function ir(url){
    var salio=false;
    addEventListener("pagehide",function(){ salio=true; },{once:true});
    try{ window.top.location.href=url; }
    catch(_){ window.open(url,"_blank","noopener"); return; }
    setTimeout(function(){ if(!salio&&d.visibilityState==="visible") window.open(url,"_blank","noopener"); },3000);
  }
  d.addEventListener("click",function(e){
    var t=e.target.closest&&e.target.closest(".pz-tema [data-pz-tema]");
    if(t){ tema(t.getAttribute("data-pz-tema"),true); return; }
    var a=e.target.closest&&e.target.closest("a.pz-volver,a[data-pz-ir]");
    if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    e.preventDefault(); ir(a.href);
  });

  /* Mientras una entrada está a la vista, el resto de la página queda inerte (el foco no se escapa) */
  function entradaAbierta(){
    if(r.classList.contains("pz-sin-entrada")) return null;
    var l=d.querySelectorAll("[data-pz-entrada]");
    for(var i=0;i<l.length;i++) if(!l[i].hidden&&!l[i].classList.contains("ent-out")) return l[i];
    return null;
  }
  function aislar(){
    var e=entradaAbierta();
    [].forEach.call(d.body.children,function(c){
      if(/^(SCRIPT|STYLE|LINK|META|TITLE)$/.test(c.tagName)) return;
      if(e&&!c.contains(e)){ if(!c.inert){ c.inert=true; c.setAttribute("data-pz-inerte",""); } }
      else if(c.hasAttribute("data-pz-inerte")){ c.inert=false; c.removeAttribute("data-pz-inerte"); }
    });
  }

  /* Entrada del kit (.ent con .ent-cuadro). Caronte y Backlog tienen la suya y usan la API. */
  var ent=null, salida=0, sola=0;
  function abrirEntrada(){
    if(!ent) return;
    clearTimeout(salida); r.classList.remove("pz-sin-entrada");
    ent.hidden=false; ent.classList.remove("ent-out"); r.style.overflow="hidden";
    var b=ent.querySelector(".ent-cuadro"); if(b) try{ b.focus({preventScroll:true}); }catch(_){}
  }
  function entrar(){
    clearTimeout(sola);
    if(!ent||ent.hidden||ent.classList.contains("ent-out")) return;
    marcarEntrada(); ent.classList.add("ent-out"); r.style.overflow="";
    salida=setTimeout(function(){ ent.hidden=true; },360);
  }
  function listo(){
    d.querySelectorAll(".ent-h,.sp-h").forEach(function(p){
      if(/^(Haz clic|Toca)\b/.test(p.textContent.trim())) p.textContent=TOQUE?"Toca la pintura para entrar":"Haz clic en la pintura para entrar";
    });
    ent=d.querySelector(".ent[data-pz-entrada]");
    if(ent){
      var b=ent.querySelector(".ent-cuadro"); if(b) b.addEventListener("click",entrar);
      addEventListener("keydown",function(k){ if(k.key==="Escape"&&ent&&!ent.hidden) entrar(); });
      if(saltar) ent.hidden=true;
      else{
        abrirEntrada();
        if(ent.getAttribute("data-pz-entrada")==="breve"){
          ent.classList.add("ent-breve");
          sola=setTimeout(entrar,CALMA?700:1700);
        }
      }
    }
    var mo=new MutationObserver(aislar);
    mo.observe(r,{attributes:true,attributeFilter:["class"]});
    d.querySelectorAll("[data-pz-entrada]").forEach(function(e){ mo.observe(e,{attributes:true,attributeFilter:["hidden","class"]}); });
    aislar();
    if(metaTema) tema(temaActual);

    /* Botón de volver en táctil: se aparta al bajar y cuando la página se queda quieta a
       mitad de camino; vuelve al subir, arriba del todo y al llegar al final. */
    var v=d.querySelector(".pz-volver");
    if(v&&TOQUE){
      var y0=scrollY, quieto=0;
      function cerca(y){ return y<120||y+innerHeight>=r.scrollHeight-140; }
      addEventListener("scroll",function(){
        var y=scrollY, dy=y-y0;
        clearTimeout(quieto);
        quieto=setTimeout(function(){ if(!cerca(scrollY)) v.classList.add("pz-volver--fuera"); },2500);
        if(Math.abs(dy)<8) return;
        v.classList.toggle("pz-volver--fuera",dy>0&&!cerca(y)); y0=y;
      },{passive:true});
      /* Al escribir en un campo el teclado sube: el botón no estorba */
      d.addEventListener("focusin",function(e){ if(e.target.matches&&e.target.matches("input,textarea,select,[contenteditable]")) v.classList.add("pz-volver--fuera"); });
    }
  }
  if(d.readyState==="loading") d.addEventListener("DOMContentLoaded",listo); else listo();

  window.PZ={ entradaInicial:function(){ return !saltar; }, marcarEntrada:marcarEntrada, abrirEntrada:abrirEntrada, ir:ir, tema:function(t){ tema(t,true); }, toque:TOQUE };
})();
