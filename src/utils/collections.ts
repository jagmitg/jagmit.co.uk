import { getCollection } from 'astro:content';

export async function getSortedPosts() {
  const allBlogPosts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true
  })
  const sorted = allBlogPosts.sort((a, b) => {
    const dateA = new Date(a.data.date)
    const dateB = new Date(b.data.date)
    return dateA > dateB ? -1 : 1
  })

  for (let i = 1; i < sorted.length; i++) {
    sorted[i].data.nextSlug = sorted[i - 1].slug
    sorted[i].data.nextTitle = sorted[i - 1].data.title
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    sorted[i].data.prevSlug = sorted[i + 1].slug
    sorted[i].data.prevTitle = sorted[i + 1].data.title
  }

  return sorted
}

export type Tag = {
  name: string
  count: number
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
