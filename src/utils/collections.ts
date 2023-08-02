import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type BlogEntry = CollectionEntry<"blog">;
export type RepoEntry = CollectionEntry<"repo">;

export async function getBlogsAndRepos() {
  const blogs: BlogEntry[] = await getCollection("blog");
  const repos: RepoEntry[] = await getCollection("repo");

  const sortedBlogs = sortByDate(blogs);
  const sortedRepos = sortByDate(repos);

  return {
    sortedBlogs,
    sortedRepos,
    allCollections: [...sortedBlogs, ...sortedRepos],
  };
}

export function sortByDate<T extends BlogEntry | RepoEntry>(collections: T[]) {
  return collections.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
}

export function parseTags(tags: string) {
  return tags.split(",").map((v) => v.trim());
}

export function getAllTags<T extends BlogEntry | RepoEntry>(collections: T[]) {
  return [
    ...new Set(
      collections
        .map((post) => parseTags(post.data.tags))
        .flat()
        .map((tag) => tag.toLowerCase()) // Make each tag lowercase
        .sort((a, b) => a.length - b.length)
    ),
  ];
}
