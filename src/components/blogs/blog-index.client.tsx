import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/sanity/blogs';
export function BlogIndex({ posts, category, page, hasNext }: { posts: BlogPost[]; category?: 'News' | 'Op-Ed'; page: number; hasNext: boolean }) {
  const [featured, ...rest] = posts;
  const pageUrl = (number: number) => {
    const query = new URLSearchParams(); if (category) query.set('category', category.toLowerCase()); if (number > 1) query.set('page', String(number));
    return `/blogs${query.size ? `?${query}` : ''}`;
  };
  return <main id="main" className="blog-index">
    <header className="blog-intro"><h1>BLOG</h1><p>At our design agency, we believe in the power of storytelling through design.<br className="blog-desktop-break" /> Fluid animations enhance the user experience, while our sleek, minimal<br className="blog-desktop-break" /> design ensures that the products take center stage.</p></header>
    <nav className="blog-filters" aria-label="Filter blogs">{(['News', 'Op-Ed'] as const).map(item => <Link key={item} aria-current={category === item ? 'page' : undefined} href={category === item ? '/blogs' : `/blogs?category=${item.toLowerCase()}`}>{item}</Link>)}</nav>
    {featured ? <>
      <article className="blog-feature"><Link href={`/blogs/${featured.slug}`} className="blog-feature-image" aria-label={featured.title}><BlogCover post={featured} priority /></Link><div className="blog-feature-copy"><div><h2><Link href={`/blogs/${featured.slug}`}>{featured.title}</Link></h2><Byline author={featured.author} /></div><div><p>{featured.excerpt}</p><Link className="blog-read-more" href={`/blogs/${featured.slug}`}>Read More <span aria-hidden="true">→</span></Link></div></div></article>
      <div className="blog-grid">{rest.map(post => <article className="blog-card" key={post.slug}><Link href={`/blogs/${post.slug}`}><h2>{post.title}</h2><Byline author={post.author} /><BlogCover post={post} /></Link></article>)}</div>
      {(hasNext || page > 1) && <nav className="blog-load" aria-label="Blog pagination">{page > 1 && <Link href={pageUrl(page - 1)} rel="prev">Previous Blogs</Link>}{hasNext && <Link href={pageUrl(page + 1)} rel="next">Load More Blogs</Link>}</nav>}
    </> : <p className="blog-empty" role="status">No {category?.toLowerCase() || "blog"} articles yet. Check back soon.</p>}
  </main>;
}
function BlogCover({ post, priority = false }: { post: BlogPost; priority?: boolean }) { return <div className="blog-cover"><Image src={post.image || '/assets/services/example.png'} alt={post.imageAlt || post.title} fill sizes="(max-width: 700px) 100vw, 50vw" priority={priority} /></div>; }
function Byline({ author }: { author: string }) { return <p className="blog-byline"><span>Written by / </span>{author}</p>; }
