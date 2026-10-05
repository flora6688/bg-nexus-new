(() => {
 const host=document.querySelector('[data-bgx-navigation]');if(!host)return;
 const isDocs=location.pathname.startsWith('/docs');
 const isHome=location.pathname==='/'||location.pathname==='/index.html';
 const sectionHref=id=>isHome?'#'+id:'/#'+id;
 host.className='bgx-shell';
 host.innerHTML=`<div class="bgx-shell-inner"><a class="bgx-shell-logo" href="/" aria-label="BG Nexus｜一站式金融服务开放平台 首页"><img src="/bg-nexus-logo.png" width="1067" height="1067" alt=""><strong>BG Nexus</strong><span>一站式金融服务开放平台</span></a><nav class="bgx-shell-nav" id="bgx-main-navigation" aria-label="主导航"><a href="/" ${isHome?'aria-current="page"':''}>首页</a><a href="${sectionHref('capabilities')}">产品能力</a><a href="${sectionHref('operations')}">运营管理</a><a href="${sectionHref('onboarding')}">接入流程</a><a href="${sectionHref('compliance')}">公司与登记信息</a></nav><div class="bgx-shell-actions"><a class="bgx-shell-action" href="/docs/" ${isDocs?'aria-current="page"':''}>API 文档</a><a class="bgx-shell-action bgx-shell-primary" href="/login/"><span class="bgx-console-prefix">商户</span>控制台</a><button class="bgx-shell-menu" type="button" aria-controls="bgx-main-navigation" aria-expanded="false">菜单</button></div></div>`;
 const toggle=host.querySelector('button'),nav=host.querySelector('.bgx-shell-nav');
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});
 host.addEventListener('click',e=>{if(e.target.closest('a')){toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open')}});
 host.addEventListener('keydown',e=>{if(e.key==='Escape'){toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');toggle.focus()}});
 if(isDocs){
  const docsTitle='API 文档 · BG Nexus 开放平台';
  document.title=docsTitle;
  new MutationObserver(()=>{if(document.title!==docsTitle)document.title=docsTitle}).observe(document.querySelector('title'),{childList:true,subtree:true,characterData:true});
 }
})();
