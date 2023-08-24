import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { TAGS_DEFINITION } from "@const";

export type BlogEntry = CollectionEntry<"blog">;
export type RepoEntry = CollectionEntry<"repo">;
export type BlogOrRepoEntry = BlogEntry | RepoEntry;
type Question = {
  tags: string[];
};

export async function getBlogsAndRepos(): Promise<{
  sortedBlogs: BlogEntry[];
  sortedRepos: RepoEntry[];
  allCollections: BlogOrRepoEntry[];
}> {
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

export function sortByDate<T extends BlogOrRepoEntry>(collections: T[]): T[] {
  return collections.sort((a, b) => {
    const dateA = new Date(a.data.date);
    const dateB = new Date(b.data.date);
    return dateB.getTime() - dateA.getTime();
  });
}

export function parseTags(tags: string): string[] {
  return tags.split(",").map((v) => v.trim());
}

export function getAllTags<T extends BlogOrRepoEntry>(
  collections: T[],
): string[] {
  return [
    ...new Set(
      collections
        .map((post) => parseTags(post.data.tags))
        .flat()
        .map((tag) => tag.toLowerCase())
        .sort(),
    ),
  ];
}

export function generateUniqueTags(questions: Question[]): string[] {
  let allTags = new Set<string>();

  questions.forEach((question: Question) => {
    question.tags.forEach((tag: string) => {
      for (let overarchingTag in TAGS_DEFINITION) {
        if (matchesTagDefinition(tag, TAGS_DEFINITION[overarchingTag])) {
          allTags.add(overarchingTag);
          break;
        }
      }
    });
  });

  return [...allTags];
}

export function matchesTagDefinition(
  tag: string,
  definitions: (string | RegExp)[],
): boolean {
  for (let definition of definitions) {
    if (typeof definition === "string" && tag === definition) {
      return true;
    } else if (definition instanceof RegExp && definition.test(tag)) {
      return true;
    }
  }
  return false;
}
