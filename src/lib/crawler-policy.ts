// Search/discovery and model-training are separate choices. User-directed fetchers
// may not honor robots.txt; these rules are preferences, not access control.
export const aiSearchAgents = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
export const aiTrainingAgents = ['GPTBot', 'ClaudeBot'];
export function crawlerRules(indexable: boolean, trainingAllowed: boolean, googleExtendedAllowed: boolean) {
  const privatePaths = ['/api/', '/cgi-bin/'];
  return [
    { userAgent: '*', allow: '/', disallow: privatePaths },
    { userAgent: aiSearchAgents, ...(indexable ? { allow: '/', disallow: privatePaths } : { disallow: '/' }) },
    { userAgent: aiTrainingAgents, ...(indexable && trainingAllowed ? { allow: '/', disallow: privatePaths } : { disallow: '/' }) },
    // Google-Extended governs both Gemini training and grounding, unlike Googlebot.
    { userAgent: 'Google-Extended', ...(indexable && googleExtendedAllowed ? { allow: '/', disallow: privatePaths } : { disallow: '/' }) },
  ];
}
