import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type Collections = CollectionEntry<"repo">[];

export async function getRepos() {
  const posts = await getCollection("repo");

  return sortByDate(posts);
}

export function sortByDate(collections: Collections) {
  return collections.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
}
