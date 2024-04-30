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
    isDraft: z.boolean().default(false),
  }),
});

const toolsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.date(),
    title: z.string(),
    url: z.string(),
    backgroundImage: z.string().optional(),
    isDraft: z.boolean().default(true),
  }),
});

export const collections = <const>{
  blog: blogCollection,
  tool: toolsCollection,
};
