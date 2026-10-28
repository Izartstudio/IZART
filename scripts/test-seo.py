#!/usr/bin/env python3
"""HTTP/SSR migration gate; run against a production build, never next dev."""
import concurrent.futures,json,os,pathlib,subprocess,xml.etree.ElementTree as ET
from urllib.robotparser import RobotFileParser
from bs4 import BeautifulSoup
ROOT=pathlib.Path(__file__).resolve().parents[1];BASE=os.environ.get('SEO_BASE_URL','http://127.0.0.1:3100');production=os.environ.get('SEO_EXPECT_INDEXABLE')=='true'
audit=json.loads((ROOT/'docs/seo-audit/live-metadata.json').read_text());errors=[];results=[]
def get(path,follow=True):
 args=['curl','-sS','--max-time','60','-w','\n%{http_code}']
 if follow:args+=['-L']
 p=subprocess.run(args+[BASE+path],capture_output=True,text=True);
 if p.returncode:raise RuntimeError(p.stderr or f'Failed to fetch {path}')
 body,code=p.stdout.rsplit('\n',1);return body,int(code)
def check(row):
 path=row['path'];body,status=get(path);s=BeautifulSoup(body,'html.parser');fail=[]
 if status!=200:fail.append(f'HTTP {status}')
 title=s.title.get_text(strip=True) if s.title else '';desc=s.find('meta',attrs={'name':'description'});canon=s.find('link',rel='canonical');robots=s.find('meta',attrs={'name':'robots'})
 if not title:fail.append('missing title')
 if not desc or not desc.get('content'):fail.append('missing description')
 if not canon or canon.get('href')!='https://www.izart.in'+('' if path=='/' else path):
  if not(path=='/' and canon and canon.get('href')=='https://www.izart.in/'):fail.append('incorrect canonical')
 if len(s.find_all('h1'))!=1:fail.append(f'{len(s.find_all("h1"))} H1s')
 if production and robots and 'noindex' in robots.get('content',''):fail.append('production noindex')
 if not production and (not robots or 'noindex' not in robots.get('content','')):fail.append('preview missing noindex')
 if row['title'].strip() and title!=row['title'].strip():fail.append('established title changed')
 if row['description'] and (not desc or desc.get('content')!=row['description']):fail.append('established description changed')
 for script in s.select('script[type="application/ld+json"]'):
  try:json.loads(script.get_text())
  except ValueError:fail.append('invalid JSON-LD')
 return {'path':path,'status':status,'title':title,'failures':fail}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(check,audit['pages']))
for row in results:
 errors.extend(f"{row['path']}: {f}" for f in row['failures'])
for source,target in [('/services/brand-identity','/brand-identity'),('/services/digital-ecosystem','/website-design-and-development'),('/digital-ecosystem','/website-design-and-development')]:
 p=subprocess.run(['curl','-sS','-D','-','-o','/dev/null',BASE+source],capture_output=True,text=True)
 if '308' not in p.stdout or target not in p.stdout:errors.append(f'{source}: expected direct 308 to {target}')
body,status=get('/sitemap.xml');urls={e.text for e in ET.fromstring(body).findall('.//{*}loc')}
if production:
 for row in audit['pages']:
  expected='https://www.izart.in'+('' if row['path']=='/' else row['path'])
  if expected not in urls and not(row['path']=='/' and expected+'/' in urls):errors.append('sitemap missing '+row['path'])
elif urls:errors.append('preview sitemap should be empty')
for query in ['?page=2','?page=3']:
 body,status=get('/blogs'+query);s=BeautifulSoup(body,'html.parser')
 if status!=200 or not s.select('a[href^="/blogs/"]'):errors.append('uncrawlable archive '+query)
 if not s.find('link',rel='canonical') or query not in s.find('link',rel='canonical')['href']:errors.append('pagination canonical '+query)
body,_=get('/blogs');s=BeautifulSoup(body,'html.parser')
if not s.select('a[rel="next"]'):errors.append('archive missing next link in SSR')
body,status=get('/this-url-does-not-exist-seo-test',False)
if status!=404 and not ('noindex' in body and status==200):errors.append(f'unknown URL returned {status} without noindex')
robotsBody,_=get('/robots.txt');policy=RobotFileParser();policy.parse(robotsBody.splitlines())
def can_fetch(agent, url):
 # RFC 9309 longest matching path wins; urllib's default first-match behavior
 # incorrectly treats Allow: / as overriding a longer Disallow: /api/.
 from urllib.parse import urlsplit
 entry=next((entry for entry in policy.entries if entry.applies_to(agent)),policy.default_entry)
 if entry is None:return True
 matches=[rule for rule in entry.rulelines if urlsplit(url).path.startswith(rule.path)]
 return max(matches,key=lambda rule:(len(rule.path),rule.allowance)).allowance if matches else True
for agent in ['OAI-SearchBot','Claude-SearchBot','PerplexityBot','ChatGPT-User','Claude-User','Perplexity-User']:
 if can_fetch(agent,BASE+'/blogs')!=production:errors.append(f'{agent}: incorrect public crawl policy')
 if can_fetch(agent,BASE+'/api/contact'):errors.append(f'{agent}: API crawling should be disallowed')
for agent in ['GPTBot','ClaudeBot']:
 if can_fetch(agent,BASE+'/blogs')!=(production and os.environ.get('AI_TRAINING_ALLOWED')=='true'):errors.append(f'{agent}: incorrect training policy')
if can_fetch('Google-Extended',BASE+'/blogs')!=(production and os.environ.get('GOOGLE_EXTENDED_ALLOWED')!='false'):errors.append('Google-Extended: incorrect grounding policy')
report={'baseUrl':BASE,'expectedIndexable':production,'pagesChecked':len(results),'results':results,'failures':errors}
(ROOT/'docs/seo-audit/local-verification.json').write_text(json.dumps(report,indent=2))
print(f"Checked {len(results)} legacy pages; {len(errors)} failures")
print('\n'.join(errors));raise SystemExit(bool(errors))
