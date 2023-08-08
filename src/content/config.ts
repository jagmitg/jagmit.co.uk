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
    repo: z.string(),
    tags: z.string(),
    isDraft: z.boolean().default(true),
  }),
});

const todayCollection = defineCollection({
  schema: z.object({
    date: z.date(),
    title: z.string(),
    description: z.string(),
    tags: z.string(),
  }),
});

export const collections = <const>{
  blog: blogCollection,
  repo: repoCollection,
  today: todayCollection,
};
