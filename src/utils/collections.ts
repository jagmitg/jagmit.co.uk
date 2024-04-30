import { getCollection } from 'astro:content';

export async function getSortedPosts() {
  const allBlogPosts = (await getCollection("blog")).filter(post => post.data.isDraft !== true);

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
