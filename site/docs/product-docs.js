/* Product landing pages use the imported API catalog and its existing endpoint renderer. */
window.BGProductDocs = {
  render(React, page, groups, renderEndpoints) {
    if (!['fx-api', 'payments-api'].includes(page)) return null;
    const h = React.createElement;
    const link = (text, hash) => h('a', { className: 'site-docs-btn', href: '/docs/#' + hash }, text);
    const guides = () => h('div', { className: 'site-docs-actions bg-product-doc-actions' },
      link('签名规范', 'spec-signature'), link('请求头规范', 'spec-headers'), link('沙箱联调', 'tools-diagnostics'));
    const back = h('div', { className: 'site-docs-actions bg-product-doc-actions' },
      h('a', { className: 'site-docs-btn', href: '/#capabilities' }, '返回产品能力'));
    if (page === 'fx-api') {
      return h('div', { className: 'bg-product-docs' },
        h('h1', null, '外汇服务 API'),
        h('p', null, '企业换汇、汇率询价、交易指令与结算相关的产品接口文档。'),
        h('h2', { id: 'fx-documentation' }, '接口文档'),
        h('div', { className: 'bg-doc-pending' },
          h('strong', null, '接口文档待补充'),
          h('p', null, '外汇服务的接口地址、参数与调用示例尚未发布。文档补充后将在此页面提供。')),
        h('h2', { id: 'fx-integration' }, '通用接入规范'),
        h('p', null, '可先了解平台的签名规范、请求头与沙箱联调方式。'),
        guides(), back);
    }
    const labels = {
      'pay.sender': '付款主体与资料', 'pay.funding': '入金',
      'pay.payee': '收款人', 'pay.payout': '代付与状态查询'
    };
    const paymentGroups = groups.filter(group => group.product_code === 'payment');
    return h('div', { className: 'bg-product-docs' },
      h('h1', null, '跨境支付运营 API'),
      h('p', null, '按业务环节查看付款主体、入金、收款人与代付接口。展开接口可查看请求参数、响应字段和调用示例。'),
      h('div', { className: 'site-docs-actions bg-product-doc-actions' },
        link('支付接入流程', 'pay-flow'), link('Webhook 与回调', 'pay-webhooks'), link('错误码说明', 'pay-errors')),
      ...paymentGroups.map(group => h('section', { key: group.id, className: 'bg-product-api-group' },
        h('h2', { id: 'product-' + group.scope.replaceAll('.', '-') }, labels[group.scope] || group.label),
        h('p', { className: 'site-docs-meta' }, 'Scope: ', h('code', null, group.scope), ' · ', group.rows.length, ' 个接口'),
        renderEndpoints(group.rows))),
      paymentGroups.length ? null : h('p', null, '接口清单暂不可用，请稍后重试。'),
      h('h2', { id: 'payment-integration' }, '通用接入规范'), guides(), back);
  }
};
