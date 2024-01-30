import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  schema: z.object({
    date: z.string().transform((str) => new Date(str)),
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    tags: z.string(),
    isDraft: z.boolean().default(false),
  }),
});

const repoCollection = defineCollection({
  schema: z.object({
    date: z.date(),
    title: z.string(),
    description: z.string().optional(),
    repo: z.string(),
    tags: z.string(),
    isDraft: z.boolean().default(true),
  }),
});

const toolsCollection = defineCollection({
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
  repo: repoCollection,
  tool: toolsCollection,
};
