#!/usr/bin/env python3
"""Derive application metadata and legacy content from the saved, reviewed public crawl."""
import gzip,json,pathlib
from bs4 import BeautifulSoup
ROOT=pathlib.Path(__file__).resolve().parents[1];audit=json.loads((ROOT/'docs/seo-audit/live-metadata.json').read_text())
seo={}; preserved=[]
missing={'/authors','/authors/akash-kalra','/authors/nipun-kondal','/manifesto','/projects/gsf','/projects/manjn','/projects/mystiqare','/projects/plattr','/projects/soak-studio','/projects/third-align'}
for page in audit['pages']:
 path=page['path'];seo[path]={'title':page['title'].strip(),'description':page['description'],'image':page['openGraph'].get('og:image'),'lastModified':page['lastModified']}
 if path not in missing:continue
 name=path.strip('/').replace('/','__') or 'home';soup=BeautifulSoup(gzip.open(ROOT/f'docs/seo-audit/html/{name}.html.gz').read(),'html.parser')
 main=soup.find('main')
 if not main:raise ValueError(f'No main content at {path}')
 for section in list(main.find_all('section')):
  heading=section.find(['h1','h2'])
  if heading and ('Latest Work' in heading.get_text() or 'Collaborate' in heading.get_text()):section.decompose()
 for el in main.select('script, style, form, nav, footer, button, iframe, svg, noscript'):el.decompose()
 heading=main.find('h1');title=heading.get_text(' ',strip=True) if heading else path.split('/')[-1].replace('-',' ').title()
 if heading:heading.decompose()
 for el in main.find_all('h1'):el.name='h2'
 allowed={'h2','h3','h4','h5','h6','p','a','ul','ol','li','strong','b','em','i','blockquote','br','img','figure','figcaption','hr'}
 for el in list(main.find_all(True)):
  if not el.parent:continue
  if el.name not in allowed:el.unwrap();continue
  attrs={}
  if el.name=='a':
   href=el.get('href','')
   if href.startswith('https://www.izart.in'):href=href.removeprefix('https://www.izart.in') or '/'
   if href.startswith(('/','https://','http://','mailto:','tel:','#')):attrs['href']=href
  if el.name=='img':
   url=el.get('src','')
   if url.startswith(('https://','/')):attrs={'src':url,'alt':el.get('alt',''),'loading':'lazy','decoding':'async'}
   else:el.decompose();continue
  if el.get('id'):attrs['id']=el['id']
  el.attrs=attrs
 html=main.decode_contents()
 preserved.append({'path':path,'heading':title,'html':html})
(ROOT/'src/content/legacy-seo.json').write_text(json.dumps(seo,ensure_ascii=False,indent=2))
(ROOT/'src/content/preserved-pages.json').write_text(json.dumps(preserved,ensure_ascii=False,indent=2))
print('Metadata:',len(seo),'Preserved content:',len(preserved))
