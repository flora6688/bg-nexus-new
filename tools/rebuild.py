"""Regenerate registration and documentation after editing their source files."""
from pathlib import Path
import subprocess
import sys
root = Path(__file__).resolve().parents[1]
login = (root / 'site/login/index.html').read_text(encoding='utf-8')
assert login.count('data-auth-page="login"') == 1
register = login.replace('data-auth-page="login"', 'data-auth-page="register"')
register = register.replace('<title>登录 · BG Nexus</title>', '<title>注册 · BG Nexus</title>')
(root / 'site/register/index.html').write_text(register, encoding='utf-8')
subprocess.run([sys.executable, str(root / 'tools/rebuild-docs.py')], check=True)
print('Updated registration and documentation. site/ is ready to deploy.')
