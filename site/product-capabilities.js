(() => {
  // Only published entries appear. Fill the three reserved entries when ready.
  // To add a video, set video.src; poster and captions are optional asset URLs.
  const products = [
    {
      id: 'fx', published: true, name: '外汇服务', headline: '企业换汇与资金调度', apiHref: '/docs/#fx-api', apiLabel: '外汇服务 API', status: '审核后开通',
      description: '支持企业换汇、汇率询价与交易指令管理，衔接资金调度和结算流程。',
      features: ['企业换汇', '汇率询价', '交易指令', '资金调度', '结算支持'],
      preview: '汇率询价 · 交易指令 · 结算支持',
      artworkAlt: '美元、欧元与人民币通过紫蓝和薄荷绿玻璃通道连接，展示企业换汇与资金调度。',
      video: { src: '', poster: '/bg-nexus-product-fx.png', captions: '' }
    },
    {
      id: 'payments', published: true, name: '跨境支付运营', headline: '付款处理与运营协同', apiHref: '/docs/#payments-api', apiLabel: '跨境支付 API', status: '审核后开通',
      description: '统一管理收付款信息与付款指令，持续追踪处理状态，支持对账与日常运营。',
      features: ['支付服务接入', '收付款信息', '付款指令', '状态追踪', '对账支持'],
      preview: '付款指令 · 状态追踪 · 对账支持',
      artworkAlt: '银行与结算凭证由玻璃支付通道连接，展示付款指令、状态追踪与对账。',
      video: { src: '', poster: '/bg-nexus-product-payments.png', captions: '' }
    },
    { id: 'reserved-3', published: false, name: '', headline: '', apiHref: '', apiLabel: '', description: '', features: [], preview: '', video: { src: '', poster: '', captions: '' } },
    { id: 'reserved-4', published: false, name: '', headline: '', apiHref: '', apiLabel: '', description: '', features: [], preview: '', video: { src: '', poster: '', captions: '' } },
    { id: 'reserved-5', published: false, name: '', headline: '', apiHref: '', apiLabel: '', description: '', features: [], preview: '', video: { src: '', poster: '', captions: '' } }
  ];
  const section = document.getElementById('capabilities');
  if (!section) return;
  const tablist = section.querySelector('[role="tablist"]');
  const panels = section.querySelector('[data-product-panels]');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const published = products.filter(product => product.published && product.name.trim());
  const tabIcon = id => id === 'fx'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';
  tablist.innerHTML = published.map((product, index) => `<button class="product-tab" type="button" role="tab" id="product-tab-${product.id}" aria-controls="product-panel-${product.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}"><span class="product-tab-symbol">${tabIcon(product.id)}</span><span>${escape(product.name)}</span></button>`).join('');
  panels.innerHTML = published.map((product, index) => {
    const hasVideo = Boolean(product.video.src);
    return `<div class="product-panel" role="tabpanel" id="product-panel-${product.id}" aria-labelledby="product-tab-${product.id}" tabindex="0" ${index ? 'hidden' : ''}>
      <div class="product-copy">
        <span class="product-status">${escape(product.status || '审核后开通')}</span>
        <h3>${escape(product.headline || product.name)}</h3>
        <p>${escape(product.description)}</p>
        <ul class="product-features" aria-label="${escape(product.name)}功能">${product.features.map(feature => `<li>${escape(feature)}</li>`).join('')}</ul>
        <div class="product-actions">${product.apiHref ? `<a class="button primary" href="${escape(product.apiHref)}">${escape(product.apiLabel || product.name + ' API')}</a>` : ''}<a class="button secondary" href="/login/">进入商户控制台</a></div>
      </div>
      <figure class="product-media">
        <div class="product-video-stage ${hasVideo ? 'has-video' : ''}">
          <video controls playsinline preload="none" aria-label="${escape(product.name)}功能演示" ${hasVideo ? `src="${escape(product.video.src)}"` : 'hidden'} ${product.video.poster ? `poster="${escape(product.video.poster)}"` : ''}>${product.video.captions ? `<track kind="captions" src="${escape(product.video.captions)}" srclang="zh-CN" label="简体中文" default>` : ''}</video>
          <div class="product-video-placeholder" ${hasVideo ? 'hidden' : ''}>
            ${product.video.poster ? `<img class="product-poster" src="${escape(product.video.poster)}" alt="${escape(product.artworkAlt || product.name + '功能演示封面')}" width="1536" height="1024" loading="lazy" decoding="async">` : '<div class="product-poster-fallback"><img src="/bg-nexus-logo.png" width="64" height="64" alt="BG Nexus"></div>'}
            <div class="product-video-caption">
              <span class="product-video-label"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="12" height="12" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="m15 10 6-3v10l-6-3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>功能演示</span>
              <span data-video-status>视频即将上线</span>
            </div>
          </div>
        </div>
        ${hasVideo ? `<figcaption>${escape(product.name)}功能介绍与操作流程</figcaption>` : ''}
      </figure>
    </div>`;
  }).join('');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  section.dataset.product = published[0]?.id || '';
  function activate(tab, keyboard = false) {
    section.dataset.product = tab.id.replace('product-tab-', '');
    try { sessionStorage.setItem('bg-open-active-product', tab.id); } catch {}
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      if (!active) panel.querySelectorAll('video').forEach(video => video.pause());
      panel.hidden = !active;
    });
    if (keyboard) {
      tab.focus({ preventScroll: true });
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next], true);
    });
  });
  try {
    const selected = tabs.find(tab => tab.id === sessionStorage.getItem('bg-open-active-product'));
    if (selected) activate(selected);
  } catch {}
  section.querySelectorAll('video').forEach(video => {
    video.addEventListener('error', () => {
      video.hidden = true;
      video.parentElement.classList.remove('has-video');
      const placeholder = video.nextElementSibling;
      placeholder.hidden = false;
      placeholder.querySelector('[data-video-status]').textContent = '视频暂时无法播放，请稍后再试';
    });
  });
})();
