"""Check the exported static website without third-party dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
import sys

root=Path(__file__).resolve().parents[1]
site=root/'site'
errors=[]
references=0


def check_url(value, source):
    global references
    value=value.strip().strip('\"\'')
    if not value or value.startswith(('#','data:','mailto:','javascript:','tel:')):
        return
    url=urlsplit(value)
    if url.scheme or url.netloc:
        return
    path=unquote(url.path)
    if not path:
        return
    target=(site/path.lstrip('/') if path.startswith('/') else source.parent/path).resolve()
    if site.resolve() not in (target,*target.parents):
        errors.append(f'{source.relative_to(site)}: URL escapes site: {value}')
        return
    if target.is_dir():
        target=target/'index.html'
    references+=1
    if not target.is_file():
        errors.append(f'{source.relative_to(site)}: missing {value}')


class Links(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source=source
    def handle_starttag(self, tag, attrs):
        for name,value in attrs:
            if value and name in ('href','src','poster','xlink:href'):
                check_url(value,self.source)
    handle_startendtag=handle_starttag


for source in site.rglob('*.html'):
    data=source.read_text(encoding='utf-8')
    Links(source).feed(data)
    if 'bg-open-app-icon-512.png' in data:
        errors.append(f'{source.relative_to(site)}: obsolete logo')
for source in site.rglob('*.css'):
    for url in re.findall(r'url\(([^)]+)\)',source.read_text(encoding='utf-8')):
        check_url(url,source)
# Check dynamic images used by editable page components (not API request examples).
for name in ('site-nav.js','product-capabilities.js'):
    source=site/name
    for url in re.findall(r'[\"\']([^\"\'\s<>]+\.(?:png|svg|jpe?g|webp|mp4)(?:\?[^\"\']*)?)[\"\']',source.read_text(encoding='utf-8')):
        check_url(url,source)
for name in ('index.html','login/index.html','register/index.html','docs/index.html'):
    if not (site/name).is_file():
        errors.append(f'Missing entry page: {name}')
login=(site/'login/index.html').read_text(encoding='utf-8')
registration=login.replace('data-auth-page="login"','data-auth-page="register"').replace('<title>登录 · BG Nexus</title>','<title>注册 · BG Nexus</title>')
if registration!=(site/'register/index.html').read_text(encoding='utf-8'):
    errors.append('Registration is out of sync; run python3 tools/rebuild.py')
bundle=(site/'static/js/index.product-docs.js').read_text(encoding='utf-8')
for obsolete in ('验证码填 000000','path:"login",element:','site-header-liquid'):
    if obsolete in bundle:errors.append(f'Legacy documentation route returned: {obsolete}')
if 'path:"/docs/*"' not in bundle:errors.append('Missing docs-only router')
if (site/'original.html').exists():errors.append('Legacy original.html must not be published')
for path in site.rglob('*'):
    if path.is_file() and (path.name in ('.env','.DS_Store') or path.suffix in ('.pem','.key')):
        errors.append(f'Unexpected private/development file: {path.relative_to(site)}')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {references} local references; four entry pages; current logo; registration synchronization; docs-only routing.')
