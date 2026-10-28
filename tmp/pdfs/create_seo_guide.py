from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from xml.sax.saxutils import escape
from pypdf import PdfReader
P='output/pdf/Izart-On-Page-SEO-Guide.pdf'
styles=getSampleStyleSheet()
for name,size,leading,color in [('TitleX',31,35,'#171717'),('Sub',12,18,'#555555'),('H',16,20,'#171717'),('B',10,14,'#333333'),('SmallX',8,11,'#555555')]:
 styles.add(ParagraphStyle(name,fontName='Helvetica-Bold' if name in ['TitleX','H'] else 'Helvetica',fontSize=size,leading=leading,textColor=colors.HexColor(color),spaceAfter=8))
styles.add(ParagraphStyle('CodeX',fontName='Courier',fontSize=8,leading=12,textColor=colors.HexColor('#222222'),backColor=colors.HexColor('#F3F3F3'),borderPadding=10,spaceAfter=15))
story=[]
def p(s,style='B'):story.append(Paragraph(s,styles[style]))
def h(s):story.append(Spacer(1,8));p(s,'H')
def bullet(s):p('• '+s)
def table(rows,widths):
 data=[[Paragraph(escape(v),styles['SmallX']) for v in row] for row in rows]
 t=Table(data,colWidths=widths,hAlign='LEFT',repeatRows=1)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#EFEFEF')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),6),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#DDDDDD'))]))
 story.append(t);story.append(Spacer(1,10))
def page(k,title):p(k.upper(),'SmallX');p(title,'TitleX')
def footer(c,d):
 c.setStrokeColor(colors.HexColor('#DDDDDD'));c.line(44,43,551,43);c.setFont('Helvetica',8);c.setFillColor(colors.HexColor('#777777'));c.drawString(44,29,'IZART.STUDIO  /  ON-PAGE SEO');c.drawRightString(551,29,str(d.page))
page('Development reference / 28 October 2026','On-page SEO\nfor Izart Studio')
p('A practical guide to headings, content, metadata, images and internal links for the redesign.','Sub')
p('<b>Core principle:</b> Give every page one clear subject, a logical structure, useful content and relevant links. Keep the visual design expressive while making the underlying HTML understandable.')
h('01 / Heading tags')
table([['Tag','Purpose','Izart example'],['<h1>','Main page subject; use one per page as a project convention.','Brand Identity Development'],['<h2>','Major sections of the page.','Our Process / Selected Projects'],['<h3>','Subsections within an H2 section.','Brand Workshop / Visual Identity'],['<h4>','A further subsection, only when needed.','A specific workshop activity'],['<p>','Body copy, labels and supporting descriptions.','Written by Akash Kalra'],['<a href="...">','Navigate to a page, resource or section.','Explore our branding projects'],['<button>','Perform an action on the current page.','Open menu / Copy article link']],[85,220,202])
p('One H1 is a useful consistency rule, not a special ranking requirement. Nest headings logically; do not jump to H4 just to obtain a smaller font. Use CSS to control appearance.')
h('Avoid these common mistakes')
bullet('Do not turn every large label, statistic or CTA into a heading.')
bullet('Do not put the main heading only inside an image, video or canvas.')
bullet('Do not repeat keywords in every heading. Describe what each section actually contains.')
p('Google recommends making the main page title clear and distinctive. <link href="https://developers.google.com/search/docs/appearance/title-link" color="#333333"><u>Read its title guidance.</u></link>','SmallX')
story.append(PageBreak())
page('Page templates','Heading structures')
p('Suggested structures for the redesigned pages. Preserve established search intent and valuable existing copy; these examples are not a replacement for keyword research.','Sub')
table([['Page','Suggested H1','H2 sections'],['Homepage','A clear description of Izart\'s offering, or the existing headline with descriptive supporting copy','Selected Work; Our Services; About Izart; Client Testimonials'],['Brand identity','Brand Identity Development','What We Deliver; Our Process; Branding Projects; FAQs'],['Website services','Website Design and Development','Capabilities; Our Process; Website Projects; FAQs'],['Projects listing','Brand Identity and Digital Design Projects','Individual project titles'],['Project detail','Seraano: Luxury Real Estate Branding','The Brief; Strategy; Visual Identity; Applications; Outcome'],['Blog listing','Insights on Branding and Design','Individual article titles'],['Blog article','The full article title','Main topics; FAQs; Related Articles'],['Author profile','Akash Kalra','About Akash; Experience; Articles'],['Careers','Careers at Izart Studio','Working at Izart; Open Positions']],[83,207,217])
h('A service-page outline')
story.append(Preformatted('''H1  Brand Identity Development
    Intro: what the service is and who it helps
H2  What Your Brand Identity Includes
    H3  Visual Identity
    H3  Verbal Identity
H2  Our Brand Identity Process
    H3  Research and Brand Workshop
    H3  Creative Direction
    H3  Design and Implementation
H2  Selected Branding Projects
H2  Frequently Asked Questions''',styles['CodeX']))
p('Accordion questions can use accessible summary elements. They do not all need a heading tag. On a blog listing, article titles are H2s; inside an article, its title becomes the H1.','SmallX')
story.append(PageBreak())
page('Content and search presentation','Intent and metadata')
h('02 / One primary intent per page')
table([['URL','Reader intent'],['/brand-identity','Evaluate brand identity services.'],['/website-design-and-development','Evaluate website design and development services.'],['/projects/seraano','Assess evidence of Izart\'s work.'],['/blogs/[article-slug]','Research the article\'s specific question.']],[255,252])
p('Use the topic naturally in the title, H1, introduction and relevant sections. Avoid creating several pages with substantially identical content aimed at the same search need.')
p('Explain who the service helps, what you deliver, how you work and why the approach is useful. Support claims with real projects and verifiable outcomes. There is no universal word-count or keyword-density target.')
h('03 / Metadata for every indexable page')
bullet('Write a unique, descriptive title and an informative meta description.')
bullet('Set the correct canonical URL and appropriate indexing directives.')
bullet('Provide relevant Open Graph and Twitter titles, descriptions and images.')
story.append(Preformatted('''<title>
  Brand Identity Development Services | Izart Studio
</title>

<meta name="description" content="Build a distinctive
brand with Izart Studio's brand identity services,
combining strategy, visual identity, and verbal expression.">

<link rel="canonical"
  href="https://www.izart.in/brand-identity">''',styles['CodeX']))
p('Keep titles concise and descriptions useful. Character counts are editing guides, not hard Google limits. Google may choose different search-result titles or snippets.')
h('04 / Preserve SEO during the redesign')
bullet('Keep existing URLs and published slugs stable. A title edit should not automatically change a slug.')
bullet('Keep valuable text and contextual links. If a URL genuinely changes, use a direct permanent redirect to its relevant replacement.')
bullet('Do not leave production pages noindex. Keep staging and previews protected from indexing.')
story.append(PageBreak())
page('Implementation and publishing','Images, links and checks')
h('05 / Images and internal links')
bullet('Describe meaningful images in alt text: <i>Seraano wordmark applied to villa stationery</i>. Use empty alt text for decorative images.')
bullet('Reserve image dimensions, use responsive image sizes, prioritize the actual hero image and lazy-load images further down the page.')
bullet('Keep essential content in HTML. Artwork can support the explanation but should not be its only source.')
bullet('Link services to relevant projects and articles. Link articles back to useful service pages when the context fits.')
bullet('Use descriptive anchor text, such as <i>Explore our brand identity services</i>, and real anchor elements with href attributes.')
h('06 / Before publishing each page')
checks=['Clear subject and one meaningful H1.','Logical H2/H3 hierarchy and readable supporting copy.','Unique title and meta description.','Correct canonical and indexing settings.','Accurate content with real evidence for claims.','Relevant internal links with no broken destinations.','Meaningful image alt text and reserved dimensions.','Author and accurate dates on articles.','Structured data matches visible content.','Essential content and links available before JavaScript loads.','Mobile layout, accessibility and performance checked.','Existing URL, important copy and inbound-link destination preserved.']
for s in checks:p('[ ] '+s)
h('Sources and further reading')
for label,url in [('Google: title links','https://developers.google.com/search/docs/appearance/title-link'),('Google: meta descriptions','https://developers.google.com/search/docs/appearance/snippet'),('Google: helpful, people-first content','https://developers.google.com/search/docs/fundamentals/creating-helpful-content'),('Google: crawlable links','https://developers.google.com/search/docs/crawling-indexing/links-crawlable')]:p(f'<link href="{url}" color="#333333"><u>{label}</u></link>','SmallX')
p('Use this guide alongside the project\'s SEO migration checklist and URL inventory. It covers on-page implementation; it does not guarantee rankings.','SmallX')
doc=SimpleDocTemplate(P,pagesize=A4,rightMargin=44,leftMargin=44,topMargin=43,bottomMargin=57,title='Izart Studio | On-Page SEO Guide',author='Izart Studio')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
r=PdfReader(P);print('Pages:',len(r.pages));print('Output:',P)
