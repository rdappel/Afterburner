import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts live in src/content/blog/*.md — the file name becomes the URL:
// src/content/blog/spatial-partitioning-part-1.md  ->  /archive/spatial-partitioning-part-1/
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tag: z.string().default('General'),
    readTime: z.number().optional(),
    series: z.string().optional(),
    part: z.number().optional(),
    diagram: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
