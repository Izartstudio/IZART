#!/usr/bin/env python3
"""Read-only public SEO crawl. Requires Python beautifulsoup4; uses system curl TLS."""
import concurrent.futures, csv, datetime, gzip, json, pathlib, subprocess, urllib.parse, xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
ROOT=pathlib.Path(__file__).resolve().parents[1]; OUT=ROOT/'docs/seo-audit'; OUT.mkdir(parents=True,exist_ok=True)
BASE='https://www.izart.in'
def fetch(url):
 result=subprocess.run(['curl','-L','-sS','--retry','2','--max-time','90','-w','\n%{http_code}\n%{url_effective}',url],capture_output=True)
 parts=result.stdout.decode('utf-8',errors='replace').rsplit('\n',2)
 if len(parts)<3: raise RuntimeError(result.stderr.decode())
 return parts[0],int(parts[1]),parts[2]
xml,_,_=fetch(BASE+'/sitemap.xml');(OUT/'live-sitemap.xml').write_text(xml)
robots,_,_=fetch(BASE+'/robots.txt');(OUT/'live-robots.txt').write_text(robots)
root=ET.fromstring(xml); sitemap={urllib.parse.urlsplit(e.find('{*}loc').text).path or '/':e.findtext('{*}lastmod') for e in root.findall('{*}url')}
(OUT/'html').mkdir(exist_ok=True)
def crawl(path):
 html,status,final=fetch(BASE+path); soup=BeautifulSoup(html,'html.parser');head=soup.head or soup
 def meta(key):
  el=head.find('meta',attrs={'name':key}) or head.find('meta',attrs={'property':key});return el.get('content','') if el else ''
 canonical=head.find('link',rel='canonical')
 jsonld=[]
 for el in soup.select('script[type="application/ld+json"]'):
  try:jsonld.append(json.loads(el.get_text()))
  except ValueError:jsonld.append({'invalidRaw':el.get_text()})
 links=sorted({(urllib.parse.urlsplit(urllib.parse.urljoin(BASE+path,a.get('href',''))).path or '/') for a in soup.select('a[href]') if urllib.parse.urlsplit(urllib.parse.urljoin(BASE+path,a.get('href',''))).netloc in ('www.izart.in','izart.in')})
 name=path.strip('/').replace('/','__') or 'home'
 with gzip.open(OUT/'html'/f'{name}.html.gz','wt') as f:f.write(html)
 return {'path':path,'url':BASE+path,'status':status,'finalUrl':final,'inSitemap':path in sitemap,'lastModified':sitemap.get(path),'title':head.title.get_text(strip=True) if head.title else '', 'description':meta('description'),'canonical':canonical.get('href') if canonical else '', 'robots':meta('robots'),'googlebot':meta('googlebot'),'openGraph':{m.get('property'):m.get('content') for m in head.select('meta[property^="og:"]')},'twitter':{m.get('name') or m.get('property'):m.get('content') for m in head.select('meta[name^="twitter:"],meta[property^="twitter:"]')},'headings':[{'level':int(h.name[1]),'text':h.get_text(' ',strip=True),'id':h.get('id')} for h in soup.select('h1,h2,h3,h4,h5,h6')], 'hreflang':[dict(l.attrs) for l in head.select('link[hreflang]')], 'verification':{m.get('name'):m.get('content') for m in head.select('meta[name$="site-verification"]')},'jsonLd':jsonld,'internalLinks':links,'images':[{'src':i.get('src'),'alt':i.get('alt'),'width':i.get('width'),'height':i.get('height')} for i in soup.select('img')], 'wordCount':len(soup.get_text(' ',strip=True).split())}
results=[];pending=set(sitemap);seen=set()
for wave in range(3):
 pending={p for p in pending if p not in seen and not pathlib.Path(p).suffix and ':' not in p}
 if not pending:break
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for row in pool.map(crawl,sorted(pending)):
   results.append(row);seen.add(row['path'])
 pending={p for row in results for p in row['internalLinks']}-seen
results.sort(key=lambda r:r['path'])
(OUT/'live-metadata.json').write_text(json.dumps({'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sitemapCount':len(sitemap),'pages':results},ensure_ascii=False,indent=2))
with (OUT/'live-metadata.csv').open('w') as f:
 fields=['path','status','inSitemap','title','description','canonical','robots','lastModified','wordCount'];writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader();writer.writerows(results)
print('Sitemap:',len(sitemap),'Crawled:',len(results),'HTTP errors:',[(r['path'],r['status']) for r in results if r['status']!=200])
