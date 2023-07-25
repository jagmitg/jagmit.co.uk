import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  schema: z.object({
    date: z.date(),
    title: z.string(),
    description: z.string(),
    image: z.string(),
    tags: z.string(),
  }),
});

const repoCollection = defineCollection({
  schema: z.object({
    date: z.date(),
    title: z.string(),
    repo: z.string(),
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
