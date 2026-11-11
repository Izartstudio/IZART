/** Extract the Vimeo player URL without rendering editor-supplied HTML. */
export function vimeoEmbedUrl(input?: string | null): string | undefined {
  if (!input?.trim()) return;
  const iframe = input.match(/<iframe\b[^>]*?\s+src\s*=\s*(["'])(.*?)\1/i);
  const source = (iframe?.[2] ?? input.trim()).replace(/&(?:amp|#38|#x26);/gi, "&");

  try {
    const url = new URL(source);
    if (url.origin !== "https://player.vimeo.com" || url.username || url.password || !/^\/video\/\d+\/?$/.test(url.pathname)) return;
    return url.href;
  } catch {
    return;
  }
}
