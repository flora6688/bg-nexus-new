"""Reproducible small adapter for the original, unmodified public docs bundle."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
bundle = (root / 'source/vendor/docs-app.original.js').read_text()

def replace_once(old, new):
    global bundle
    assert bundle.count(old) == 1, f'Upstream docs changed; review integration: {old[:90]}'
    bundle = bundle.replace(old, new, 1)

replace_once('let iX=[{id:"getting-started"', 'let iX=[{id:"product-services",title:"产品 API",sections:[{id:"fx-api",title:"外汇服务 API"},{id:"payments-api",title:"跨境支付运营 API"}]},{id:"getting-started"')
replace_once('i8={"flow-overview":', 'i8={"fx-api":[{id:"fx-documentation",title:"接口文档"},{id:"fx-integration",title:"通用接入规范"}],"payments-api":[{id:"product-pay-sender",title:"付款主体与资料"},{id:"product-pay-funding",title:"入金"},{id:"product-pay-payee",title:"收款人"},{id:"product-pay-payout",title:"代付与状态查询"},{id:"payment-integration",title:"通用接入规范"}],"flow-overview":')
replace_once('se={"learning-path":ia.A,', 'se={"product-services":ic.A,"learning-path":ia.A,')
replace_once('children:h}),"flow-overview"===m?', 'children:h}),window.BGProductDocs.render(c,m,i,e=>(0,l.jsx)(iO,{rows:e,copiedKey:j,onCopy:P})),"flow-overview"===m?')
# Give all document selections a stable, shareable URL and normal back navigation.
replace_once('u(e),d&&o({hash:e},{replace:!0}),w(!1)', 'u(e),o({hash:e}),w(!1)')
# Only mount the public documentation. The upstream application also contained
# an obsolete homepage, login, demo catalog and console; those routes must never
# be entered from this site's documentation, even through imperative navigation.
router_start = 'dk=(0,tT.Ys)([{path:"/",children:'
router_end = ',dA=lx.themeTokens.token.colorPrimary'
assert bundle.count(router_start) == bundle.count(router_end) == 1
start, end = bundle.index(router_start), bundle.index(router_end)
assert start < end
docs_router = '''dk=(0,tT.Ys)([
 {path:"/docs/*",element:(0,l.jsx)("div",{className:"site-root is-docs-mode",children:(0,l.jsx)("div",{className:"site-docs-page",children:(0,l.jsx)(si,{groups:is([],[]),variant:"site"})})})},
 {path:"*",element:(0,l.jsx)(function(){let route=(0,tT.zy)();(0,c.useEffect)(()=>{location.replace(window.BGSiteRoutes.destination(route.pathname+route.search+route.hash)||"/")},[route.pathname,route.search,route.hash]);return null},{})}
])'''
bundle = bundle[:start] + docs_router + bundle[end:]
# Public docs do not inspect or clear an existing account's authentication.
replace_once('let dP=T.getState().token;if(dP){let e=nS(nq(dP),"iss");e&&"puc"!==e&&T.getState().logout()}', '')
# Apply the current site brand while retaining the original import as a backup.
bundle = bundle.replace('BG OPEN', 'BG Nexus')
(root / 'site/static/js/index.product-docs.js').write_text(bundle)
for source, target in [('docs-product-pages.js','product-docs.js'),('docs-product-pages.css','product-docs.css')]:
    (root / 'site/docs' / target).write_bytes((root / 'source' / source).read_bytes())
print('Built docs product integration from untouched import.')
