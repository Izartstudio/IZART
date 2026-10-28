import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl, breadcrumbData, pageMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site/site-footer';
import { ArticleToc } from '@/components/blogs/article-toc.client';
import { ArticleSummaries, ShareArticle } from '@/components/blogs/article-tools.client';
import { blogHeadingId, getBlog, getBlogs } from '@/sanity/blogs';
import { site } from '@/lib/site';
import '../blogs.css';
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { return (await getBlogs()).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlog((await params).slug); if (!post) notFound();
  return pageMetadata(`/blogs/${post.slug}`, { title: post.seoTitle || `${post.title} | Izart Studio`, description: post.seoDescription || post.excerpt, image: post.image, imageAlt: post.imageAlt, type: 'article', publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined, modifiedAt: post.updatedAt });
}
export const revalidate = 60;
export default async function BlogArticle({ params }: Props) {
  const post = await getBlog((await params).slug); if (!post) notFound();
  const headings = post.body.flatMap((block, index) => block.kind === 'heading' && block.text ? [{ text: block.text, id: blogHeadingId(block.text, index), level: block.level || 2 }] : []);
  const authorPath = post.author === 'Akash Kalra' ? '/authors/akash-kalra' : post.author === 'Nipun Kondal' ? '/authors/nipun-kondal' : undefined;
  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': absoluteUrl(`/blogs/${post.slug}#article`),
    headline: post.title, description: post.seoDescription || post.excerpt, image: absoluteUrl(post.image),
    mainEntityOfPage: absoluteUrl(`/blogs/${post.slug}`), url: absoluteUrl(`/blogs/${post.slug}`),
    author: { '@type': 'Person', name: post.author, ...(authorPath ? { url: absoluteUrl(authorPath) } : {}) },
    publisher: { '@type': 'Organization', '@id': absoluteUrl('/#organization'), name: site.name, url: site.url.href },
    ...(post.publishedAt ? { datePublished: new Date(post.publishedAt).toISOString() } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
  };
  return <><JsonLd data={articleSchema} /><JsonLd data={breadcrumbData([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blogs' }, { name: post.title, path: `/blogs/${post.slug}` }])} /><main id="main" className="blog-article"><header className="article-hero"><div><span className="article-category">{post.category}</span><h1>{post.title}</h1><p className="article-author">Written by / <strong>{authorPath ? <Link href={authorPath}>{post.author}</Link> : post.author}</strong></p>{post.publishedAt && <p className="article-date">{"// "}{new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>}</div><div className="article-hero-image"><Image src={post.image} alt={post.imageAlt || post.title} fill sizes="(max-width: 700px) 100vw, 50vw" priority /></div></header>
    <div className="article-layout"><aside className="article-sidebar"><div className="article-sidebar-sticky"><ArticleToc items={[...headings, ...(post.faqs?.length ? [{ id: 'article-faqs', text: 'Frequently Asked Questions', level: 2 }] : [])]} /><ShareArticle title={post.title} /></div></aside>
    <article className="article-body"><ArticleSummaries title={post.title} url={new URL(`/blogs/${post.slug}`, site.url).href} />{post.body.map((block, index) => {
      if (block.kind === 'heading') { const Tag = block.level === 3 ? 'h3' : block.level === 4 ? 'h4' : 'h2'; return <Tag id={blogHeadingId(block.text || '', index)} key={index}>{block.text}</Tag>; }
      if (block.kind === 'quote') return <blockquote key={index}>{block.text}</blockquote>;
      if (block.kind === 'list') return <ul key={index}>{block.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>;
      if (block.kind === 'image' && block.url) return <figure key={index}><Image src={block.url} alt={block.text || ''} width={1000} height={700} sizes="(max-width: 700px) 100vw, 55vw" style={{ width: '100%', height: 'auto' }} /></figure>;
      return <p key={index}>{block.text}</p>;
    })}{post.faqs?.length > 0 && <section id="article-faqs" className="article-faqs"><h2>Frequently Asked Questions</h2>{post.faqs.map((faq, i) => <details key={faq.question} open={i === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</section>}<nav className="article-related" aria-label="Related articles"><h2>More from Izart Studio</h2><ul>{(await getBlogs()).filter(item => item.slug !== post.slug && item.author === post.author).slice(0, 3).map(item => <li key={item.slug}><Link href={`/blogs/${item.slug}`}>{item.title}</Link></li>)}</ul><Link href="/blogs">All articles →</Link></nav></article></div></main><SiteFooter /></>;
}
