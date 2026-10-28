'use client';
import Image from 'next/image';
import { useState } from 'react';
export function ShareArticle({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  function share(network: 'x' | 'linkedin') {
    const url = encodeURIComponent(location.href);
    window.open(network === 'x' ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${url}` : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  }
  return <div className="article-share"><p>Share This Article</p><div><button className="site-button" aria-label="Share on X" onClick={() => share('x')}>𝕏</button><button className="site-button" aria-label="Share on LinkedIn" onClick={() => share('linkedin')}>in</button><button className="site-button" aria-label="Copy article link" onClick={async () => { try { await navigator.clipboard.writeText(location.href); setCopied(true); } catch { setCopied(false); } }}>↗</button></div><span role="status">{copied ? 'Link copied' : ''}</span></div>;
}
export function ArticleSummaries({ title, url }: { title: string; url: string }) {
  const prompt = encodeURIComponent(`Read and summarize this article: ${title}. ${url}`);
  const tools = [['chatgpt', 'ChatGPT', `https://chatgpt.com/?q=${prompt}`], ['gemini', 'Gemini', `https://gemini.google.com/`], ['claude', 'Claude', `https://claude.ai/new?q=${prompt}`], ['perplexity', 'Perplexity', `https://www.perplexity.ai/search?q=${prompt}`]];
  return <div className="article-summaries"><p>Read Summarized Version with</p><div>{tools.map(([icon, label, href]) => <a className="site-button" key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label} to summarize this article`}><Image className="article-summary-logo" src={`/assets/blogs/logos/${icon}.svg`} alt={label} width={icon === 'chatgpt' ? 88 : icon === 'gemini' ? 74 : icon === 'claude' ? 75 : 94} height={20} /></a>)}</div></div>;
}
