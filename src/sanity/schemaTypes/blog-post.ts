import { defineArrayMember, defineField, defineType } from 'sanity';
export const blogPost = defineType({
  name: 'blogPost', title: 'Blog articles', type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'seoTitle', title: 'SEO title override', type: 'string', description: 'Optional. Preserve the established title when updating an existing article.' }),
    defineField({ name: 'seoDescription', title: 'SEO description override', type: 'text', rows: 3 }),
    defineField({ name: 'author', type: 'string', validation: r => r.required() }),
    defineField({ name: 'category', type: 'string', options: { list: ['News', 'Op-Ed'] }, initialValue: 'Op-Ed', validation: r => r.required() }),
    defineField({ name: 'topic', type: 'string' }),
    defineField({ name: 'excerpt', type: 'text', rows: 4, validation: r => r.required() }),
    defineField({ name: 'cover', type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', type: 'string' })], validation: r => r.required() }),
    defineField({ name: 'publishedAt', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'body', type: 'array', of: [defineArrayMember({ type: 'object', name: 'contentBlock', fields: [
      defineField({ name: 'kind', type: 'string', options: { list: ['paragraph', 'heading', 'quote', 'image', 'list'] }, initialValue: 'paragraph', validation: r => r.required() }),
      defineField({ name: 'text', title: 'Text / image alt text', type: 'text', rows: 5 }),
      defineField({ name: 'level', title: 'Heading level', type: 'number', options: { list: [2, 3, 4] }, hidden: ({ parent }) => parent?.kind !== 'heading' }),
      defineField({ name: 'image', type: 'image', options: { hotspot: true }, hidden: ({ parent }) => parent?.kind !== 'image' }),
      defineField({ name: 'items', type: 'array', of: [defineArrayMember({ type: 'string' })], hidden: ({ parent }) => parent?.kind !== 'list' }),
    ], preview: { select: { title: 'text', subtitle: 'kind', media: 'image' } } })], validation: r => r.required().min(1) }),
    defineField({ name: 'faqs', title: 'Frequently asked questions', type: 'array', of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'question', type: 'string', validation: r => r.required() }), defineField({ name: 'answer', type: 'text', validation: r => r.required() })] })] }),
  ], preview: { select: { title: 'title', subtitle: 'author', media: 'cover' } },
});
