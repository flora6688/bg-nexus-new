"""Build the BG Nexus static export for GitHub Pages, without changing site/.

Only Python's standard library is needed. The default output is _site/.
The workflow supplies the actual Pages base path, including custom-domain roots.
"""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
from urllib.parse import unquote, urlsplit


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError(f'Source changed; review Pages integration: {old[:100]}')
    return text.replace(old, new, 1)


def build(source, output, base):
    if not (source / 'index.html').is_file():
        raise ValueError(f'Missing website source: {source}/index.html')
    if source == output or source in output.parents or output in source.parents:
        raise ValueError('The output must be separate from the source directory.')
    if output.exists():
        raise ValueError(f'Output already exists: {output}. Choose a fresh directory.')
    shutil.copytree(source, output)

    def prefix(path):
        return base + path if path.startswith('/') and not path.startswith('//') else path

    # These editable components contain only website paths, not API endpoints.
    component_paths = ('site-nav.js', 'product-capabilities.js', 'docs/product-docs.js')
    quoted_path = re.compile(r'''(["'])(/(?!/)[^\s'"<>]*)(\1)''')
    for name in component_paths:
        path = output / name
        data = quoted_path.sub(lambda m: m[1] + prefix(m[2]) + m[3], path.read_text())
        path.write_text(data)

    attribute = re.compile(r'''((?:href|src|poster|action)\s*=\s*)(["'])(/(?!/)[^"']*)(\2)''', re.I)
    css_url = re.compile(r'''(url\(\s*["']?)(/(?!/)[^\s)'"<>]+)''')
    redirect = re.compile(r'''(location\.replace\(\s*)(["'])(/(?!/)[^"']*)(\2)''')
    for path in output.rglob('*.html'):
        data = path.read_text()
        data = attribute.sub(lambda m: m[1] + m[2] + prefix(m[3]) + m[4], data)
        data = redirect.sub(lambda m: m[1] + m[2] + prefix(m[3]) + m[4], data)
        data = css_url.sub(lambda m: m[1] + prefix(m[2]), data)
        path.write_text(data)
    for path in output.rglob('*.css'):
        data = css_url.sub(lambda m: m[1] + prefix(m[2]), path.read_text())
        path.write_text(data)

    # Normalize legacy/root URLs and already-prefixed URLs exactly once.
    # The docs router's internal pathname is relative to its basename.
    routes_path = output / 'site-routes.js'
    routes = routes_path.read_text()
    routes = replace_once(routes, '  const destination = value => {',
        '  const basePath = ' + json.dumps(base) + ';\n'
        '  const localPath = path => basePath && (path === basePath || path.startsWith(basePath + "/"))\n'
        '    ? path.slice(basePath.length) || "/" : path;\n'
        '  const resolveLocal = value => {')
    routes = replace_once(routes, 'const path = url.pathname.replace(', 'const path = localPath(url.pathname).replace(')
    routes = replace_once(routes, '  window.BGSiteRoutes = { destination };',
        '  const destination = value => {\n'
        '    const result = resolveLocal(value);\n'
        '    return result === null ? null : basePath + result;\n'
        '  };\n'
        '  window.BGSiteRoutes = { destination };')
    routes = replace_once(routes,
        "location.pathname.startsWith('/docs') && next.startsWith('/docs/')",
        "localPath(location.pathname).startsWith('/docs') && localPath(next).startsWith('/docs/')")
    routes_path.write_text(routes)

    # Keep /api/... request examples intact; scope only the docs' browser router.
    bundle_path = output / 'static/js/index.product-docs.js'
    bundle = bundle_path.read_text()
    bundle = replace_once(bundle, ']),dA=lx.themeTokens.token.colorPrimary',
        '],{basename:' + json.dumps(base or '/') + '}),dA=lx.themeTokens.token.colorPrimary')
    bundle_path.write_text(bundle)
    (output / '.nojekyll').touch()
    validate(output, base, component_paths)


def validate(output, base, components):
    errors = []
    references = 0

    def check_url(value, source):
        nonlocal references
        url = urlsplit(value.strip().strip('\"\''))
        if url.scheme or url.netloc or not url.path:
            return
        path = unquote(url.path)
        if path.startswith('/'):
            if base and not (path == base or path.startswith(base + '/')):
                errors.append(f'{source.name}: URL escapes project: {value}')
                return
            target = output / path[len(base):].lstrip('/')
        else:
            target = source.parent / path
        target = target.resolve()
        if output not in (target, *target.parents):
            errors.append(f'{source.name}: URL escapes output: {value}')
            return
        if target.is_dir():
            target = target / 'index.html'
        references += 1
        if not target.is_file():
            errors.append(f'{source.name}: missing {value}')

    class Links(HTMLParser):
        def handle_starttag(self, tag, attrs):
            for name, value in attrs:
                if value and name in ('href', 'src', 'poster', 'xlink:href'):
                    check_url(value, self.source)
        handle_startendtag = handle_starttag

    for source in output.rglob('*.html'):
        parser = Links()
        parser.source = source
        parser.feed(source.read_text())
    for source in output.rglob('*.css'):
        for value in re.findall(r'url\(([^)]+)\)', source.read_text()):
            check_url(value, source)
    for name in components:
        source = output / name
        for match in re.finditer(r'''(["'])(/(?!/)[^\s'"<>]*)(\1)''', source.read_text()):
            check_url(match[2], source)
    if errors:
        raise ValueError('\n'.join(errors))
    print(f'PASS: {references} website references; base path {base or "/"}; output {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', default='site', type=Path)
    parser.add_argument('--output', default='_site', type=Path)
    parser.add_argument('--base', default='/BG-Nexus')
    args = parser.parse_args()
    base = args.base.rstrip('/')
    if base and not re.fullmatch(r'/[A-Za-z0-9._~-]+(?:/[A-Za-z0-9._~-]+)*', base):
        parser.error('Base must be an absolute website path, for example /BG-Nexus, or empty.')
    if any(part in ('.', '..') for part in base.split('/')):
        parser.error('Base must not contain dot segments.')
    build(args.source.resolve(), args.output.resolve(), base)
