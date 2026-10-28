import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const source = await fs.readFile(new URL('../src/lib/crawler-policy.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { crawlerRules, aiSearchAgents, aiTrainingAgents } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
for (const indexable of [true, false]) for (const training of [true, false]) for (const google of [true, false]) {
  const rules = crawlerRules(indexable, training, google);
  const ruleFor = agent => rules.find(r => Array.isArray(r.userAgent) ? r.userAgent.includes(agent) : r.userAgent === agent);
  for (const agent of aiSearchAgents) assert.equal(ruleFor(agent).allow === '/', indexable, agent);
  for (const agent of aiTrainingAgents) assert.equal(ruleFor(agent).allow === '/', indexable && training, agent);
  assert.equal(ruleFor('Google-Extended').allow === '/', indexable && google);
  assert.equal(ruleFor('*').allow, '/'); // let ordinary crawlers read preview noindex
  for (const rule of rules.filter(r => r.allow === '/')) assert(rule.disallow.includes('/api/'));
}
console.log('Crawler policy: all 8 production/preview/training/grounding combinations passed.');
