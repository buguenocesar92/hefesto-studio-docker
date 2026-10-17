import urllib.request,concurrent.futures
from pathlib import Path
photos={'coffee':'1577590835286-1cdd24c08fd7','bread':'1560643123-9157226100d2','forest':'1511884642898-4c92249e20b6','architecture':'1586871608630-9c995c2f68d3','fashion':'1553682200-c3250538a4a9','cabin':'1726094780461-276b1d870474','portrait':'1781271573424-2cf70e4875cd','skin':'1790574318883-a7136bae1847'}
def get(k,v):
 p=Path('dist/assets/photos')/(k+'.webp')
 try:
  data=urllib.request.urlopen('https://images.unsplash.com/photo-'+v+'?w=1100&q=68&fit=crop&fm=webp',timeout=30).read();p.write_bytes(data);print(k,len(data))
 except Exception as e:print(k,str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(lambda x:get(*x),photos.items()))
