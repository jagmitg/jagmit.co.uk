// @ts-nocheck
import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.string().transform((str) => new Date(str)),
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    repo: z.string().optional(),
    draft: z.boolean()
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

export type BlogFrontmatter = z.infer<typeof blogCollection>;

export const collections = <const>{
  blog: blogCollection,
  tool: toolsCollection,
};
