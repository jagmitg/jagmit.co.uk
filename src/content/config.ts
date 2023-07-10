import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  schema: z.object({
    date: z.date(),
    title: z.string(),
    description: z.string(),
    image: z.string(),
    tags: z.string(),
    hatenaPath: z.string().optional(),
  }),
});

export const collections = <const>{
  blog: blogCollection,
};
