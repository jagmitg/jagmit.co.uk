import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { TAGS_DEFINITION } from "@const";

interface EntryData {
  date: string;
  isDraft?: boolean;
  tags: string;
}

type RenderFunction = () => Promise<string>;

export type BlogEntry = CollectionEntry<"blog"> & {
  data: EntryData;
  slug: string;
  render: RenderFunction;
};

export type RepoEntry = CollectionEntry<"repo"> & {
  data: EntryData & { repo: string };
  slug: string;
  render: RenderFunction;
};

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
  // Check if collections are defined and not null
  if (!collections || collections.length === 0) {
    return [];
  }

  return collections.sort((a, b) => {
    // Check for the existence of 'data' and 'date' properties
    const dateA = a.data && a.data.date ? new Date(a.data.date) : new Date(0);
    const dateB = b.data && b.data.date ? new Date(b.data.date) : new Date(0);

    return dateB.getTime() - dateA.getTime();
  });
}

export function parseTags(tags: string): string[] {
  return tags.split(",").map((v) => v.trim());
}

export function getAllTags<T extends { data: EntryData }>(
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

  questions.forEach((question) => {
    question.tags.forEach((tag) => {
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

// Correct the function signature
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
