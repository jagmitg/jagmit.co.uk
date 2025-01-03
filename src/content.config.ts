// @ts-nocheck
import { file } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.string().transform((str) => new Date(str)),
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean()
  }),
});

const repoCollection = defineCollection({
  loader: file("src/data/repos.json"),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string().transform((str) => new Date(str)),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    repo: z.string().optional(),
    draft: z.boolean()
  }),
});

const stackOverFlowCollection = defineCollection({
  loader: file("src/data/stackoverflow.json"),
  schema: z.object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    link: z.string().optional(),
    view_count: z.number(),
    creation_date: z.number().transform((timestamp) => new Date(timestamp * 1000)),
    last_edit_date: z.number().optional().transform((timestamp) => new Date(timestamp * 1000)),
    is_answered: z.boolean(),
    tags: z.array(z.string()).optional(),
  }),
});

const toolsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.date(),
    title: z.string(),
    url: z.string(),
    backgroundImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});


export const collections = <const>{
  blog: blogCollection,
  repo: repoCollection,
  tool: toolsCollection,
  stackoverflow: stackOverFlowCollection
};
