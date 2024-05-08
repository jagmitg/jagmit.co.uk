import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

interface FlexibleBlogPost extends Omit<CollectionEntry<'blog'>, 'slug'> {
  slug: string;
}

function normalizeSlug(slug: string): string {
  const normalized = slug.replace(/^(content|repo)\//, '');
  return normalized;
}


export async function getSortedPosts(): Promise<FlexibleBlogPost[]> {
  const allBlogPosts: CollectionEntry<'blog'>[] = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });

  if (!allBlogPosts.length) {
    console.log("No posts found");
  }

  const sorted: FlexibleBlogPost[] = allBlogPosts.map(post => ({
    ...post,
    slug: normalizeSlug(post.slug)
  })).sort((a, b) => {
    const dateA = new Date(a.data.date);
    const dateB = new Date(b.data.date);
    return dateA > dateB ? -1 : 1;
  });

  sorted.forEach((post, index, array) => {
    if (index > 0) {
      array[index].data.nextSlug = array[index - 1].slug;
      array[index].data.nextTitle = array[index - 1].data.title;
    }
    if (index < array.length - 1) {
      array[index].data.prevSlug = array[index + 1].slug;
      array[index].data.prevTitle = array[index + 1].data.title;
    }
  });

  return sorted;
}



export type Tag = {
  name: string;
  count: number;
}

export async function getTagList(): Promise<Tag[]> {
  const allBlogPosts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const countMap: { [key: string]: number } = {};

  allBlogPosts.forEach(post => {
    post.data.tags.forEach((tag: string) => {
      const normalizedTag = tag.toLowerCase();
      if (!countMap[normalizedTag]) {
        countMap[normalizedTag] = 0;
      }
      countMap[normalizedTag]++;
    });
  });

  // Convert the countMap into a sorted array of Tag objects
  const tagsArray: Tag[] = Object.entries(countMap).map(([name, count]) => ({
    name,
    count
  }));

  // Sort the tags array alphabetically by tag name
  return tagsArray.sort((a, b) => a.name.localeCompare(b.name));
}
