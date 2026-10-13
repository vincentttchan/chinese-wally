"""Package the built original game for opening public/index.html locally.

No browser, server, DOM or game execution. The local entry reuses the site's
compiled React bundle and stylesheet; it is not a separate cover design.
"""
from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
release=root/'dist'
html=(release/'index.html').read_text()
scripts=re.findall(r'<script\b[^>]*\bsrc="([^"]+)"[^>]*></script>',html)
styles=re.findall(r'<link\b[^>]*\bhref="([^"]+)"[^>]*>',html)
if len(scripts)!=1:
    raise RuntimeError('Local packaging expects one built entry bundle.')
js=(release/'assets'/Path(scripts[0]).name).read_text()
if re.search(r'\bimport\s*\(|\bimport\.meta|\bexport\s*\{',js):
    raise RuntimeError('The built bundle needs external modules; local packaging must be updated.')
css='\n'.join((release/'assets'/Path(name).name).read_text() for name in styles if name.endswith('.css'))
# Root-relative web paths must be relative to the public directory for file use.
js=js.replace('/chinese-wally/','./')
js=re.sub(r'([\x22\x27`])/(art|audio|fonts|chapters)/',r'\1./\2/',js)
css=css.replace('/chinese-wally/','./')
css=re.sub(r'url\(([\x22\x27]?)/(art|audio|fonts|chapters)/',r'url(\1./\2/',css)
html=re.sub(r'<script\b[^>]*\bsrc="[^"]+"[^>]*></script>','',html)
html=re.sub(r'<link\b[^>]*\bhref="[^"]+\.css"[^>]*>',lambda _: '<style>'+css+'</style>',html)
html=html.replace('</body>','<script>'+js.replace('</script','<\\/script')+'</script></body>')
(root/'public/index.html').write_text(html)
print('Saved public/index.html: original game bundle with local asset paths.')
