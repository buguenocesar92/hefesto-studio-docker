import urllib.request,re,base64
from pathlib import Path
url='https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..800&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap'
req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
css=urllib.request.urlopen(req,timeout=30).read().decode()
blocks=re.findall(r'/\* latin \*/\s*(@font-face\s*\{[^}]+\})',css)
if not blocks: blocks=[b for b in re.findall(r'@font-face\s*\{[^}]+\}',css) if 'font-weight: 400;' in b or 'font-weight: 700;' in b]
assert blocks,'No font faces returned'
output=[]
for block in blocks:
 u=re.search(r'url\(([^)]+)\)',block).group(1)
 data=urllib.request.urlopen(u,timeout=30).read()
 block=block.replace(u,('data:font/ttf;base64,' if "format('truetype')" in block else 'data:font/woff2;base64,')+base64.b64encode(data).decode())
 output.append(block)
notices=[]
for family in ['dmsans','cormorantgaramond']:
 notices.append(urllib.request.urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/'+family+'/OFL.txt',timeout=30).read().decode())
Path('dist/assets/fonts.css').write_text('/*\n'+('\n\n'.join(notices)).replace('*/','* /')+'\n*/\n'+'\n'.join(output))
print('Self-hosted font faces:',len(output))
