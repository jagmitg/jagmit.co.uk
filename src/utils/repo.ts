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

export function parseTags(tags: string) {
  return tags.split(",").map((v) => v.trim());
}

export function getAllRepoTags(collections: Collections) {
  return [
    ...new Set(
      collections
        .map((post) => parseTags(post.data.tags))
        .flat()
        .sort((a, b) => a.length - b.length)
    ),
  ];
}
