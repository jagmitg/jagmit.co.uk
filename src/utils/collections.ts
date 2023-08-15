import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type BlogEntry = CollectionEntry<"blog">;
export type RepoEntry = CollectionEntry<"repo">;
export type BlogOrRepoEntry = BlogEntry | RepoEntry;

export async function getBlogsAndRepos() {
  const allBlogs: BlogEntry[] = await getCollection("blog");
  const repos: RepoEntry[] = await getCollection("repo");

  const blogs = allBlogs.filter((blog) => blog.data.isDraft !== true);

  const sortedBlogs = sortByDate(blogs);
  const sortedRepos = sortByDate(repos);

  return {
    sortedBlogs,
    sortedRepos,
    allCollections: [...sortedBlogs, ...sortedRepos],
  };
}

export function sortByDate<T extends BlogEntry | RepoEntry>(collections: T[]) {
  return collections.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date) : new Date(a.data.date);
    const dateB = b.data.date ? new Date(b.data.date) : new Date(b.data.date);
    return dateB.getTime() - dateA.getTime();
  });
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
        .map((tag) => tag.toLowerCase())
        .sort((a, b) => a.length - b.length)
    ),
  ];
}
