import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'
import { TAGS_DEFINITION } from '@const'

export type Tag = {
	name: string
	count: number
}

export type BlogPost = Omit<CollectionEntry<'blog'>, 'slug'> & {
	id: string
	slug: string
	collection: 'blog'
	data: CollectionEntry<'blog'>['data'] & {
		nextSlug?: string
		nextTitle?: string
		prevSlug?: string
		prevTitle?: string
	}
}

export type RepoPost = Omit<CollectionEntry<'repo'>, 'slug'> & {
	id: string
	slug: string
	collection: 'repo'
	data: CollectionEntry<'repo'>['data']
}

export type Post = BlogPost | RepoPost

function normalizeSlug(id: string): string {
	const normalized = id
		.replace(/^(content|repo)\//, '')
		.replace(/\.(mdx|md|astro)$/, '')
		.replace(/\/index$/, '')
	return normalized
}

export async function getSortedPosts(): Promise<Post[]> {
	const isProd = import.meta.env.ENVS === 'production'

	const allBlogPosts = await getCollection('blog', ({ data }) => {
		return isProd ? !data.draft : true
	})

	const allRepoPosts = await getCollection('repo')

	if (!allBlogPosts.length && !allRepoPosts.length) {
		console.log('No posts found')
	}

	const blogPosts: BlogPost[] = allBlogPosts.map((post) => ({
		...post,
		slug: normalizeSlug(post.id)
	}))

	const repoPosts: RepoPost[] = allRepoPosts.map((post) => ({
		...post,
		slug: normalizeSlug(post.id)
	}))

	const allPosts = [...blogPosts, ...repoPosts].sort((a, b) => {
		const dateA = new Date(a.data.date)
		const dateB = new Date(b.data.date)
		return dateA > dateB ? -1 : 1
	})

	allPosts.forEach((post, index, array) => {
		if (post.collection === 'blog') {
			if (index > 0) {
				post.data.nextSlug = array[index - 1].slug
				post.data.nextTitle = array[index - 1].data.title
			}
			if (index < array.length - 1) {
				post.data.prevSlug = array[index + 1].slug
				post.data.prevTitle = array[index + 1].data.title
			}
		}
	})

	return allPosts
}

export async function getTagList(): Promise<Tag[]> {
	const isProd = import.meta.env.ENVS === 'production'
	const allBlogPosts = await getCollection('blog', ({ data }) => {
		return isProd ? !data.draft : true
	})

	const countMap: { [key: string]: number } = {}

	allBlogPosts.forEach((post) => {
		post.data.tags?.forEach((tag: string) => {
			const normalizedTag = tag.toLowerCase()
			if (!countMap[normalizedTag]) {
				countMap[normalizedTag] = 0
			}
			countMap[normalizedTag]++
		})
	})

	const tagsArray: Tag[] = Object.entries(countMap).map(([name, count]) => ({
		name,
		count
	}))

	return tagsArray.sort((a, b) => a.name.localeCompare(b.name))
}

export function generateUniqueTags(posts: Post[]): string[] {
	let allTags = new Set<string>()

	posts.forEach((post) => {
		post.data.tags?.forEach((tag: string) => {
			for (let overarchingTag in TAGS_DEFINITION) {
				if (matchesTagDefinition(tag, TAGS_DEFINITION[overarchingTag])) {
					allTags.add(overarchingTag)
				}
			}
		})
	})

	return [...allTags]
}

export function matchesTagDefinition(
	tag: string,
	definitions: (string | RegExp)[]
): boolean {
	for (let definition of definitions) {
		if (typeof definition === 'string' && tag === definition) {
			return true
		} else if (definition instanceof RegExp && definition.test(tag)) {
			return true
		}
	}
	return false
}

export function sortByCreationDate(
	a: CollectionEntry<'stackoverflow'>,
	b: CollectionEntry<'stackoverflow'>,
	isDesc: boolean = true
): number {
	const dateA = new Date(a.data.creation_date).getTime()
	const dateB = new Date(b.data.creation_date).getTime()
	return isDesc ? dateB - dateA : dateA - dateB
}

export function sortByLastEditDate(
	a: CollectionEntry<'stackoverflow'>,
	b: CollectionEntry<'stackoverflow'>,
	isDesc: boolean = true
): number {
	const dateA = new Date(
		a.data.last_edit_date || a.data.creation_date
	).getTime()
	const dateB = new Date(
		b.data.last_edit_date || b.data.creation_date
	).getTime()
	return isDesc ? dateB - dateA : dateA - dateB
}

export function sortByViewCount(
	a: CollectionEntry<'stackoverflow'>,
	b: CollectionEntry<'stackoverflow'>,
	isDesc: boolean = true
): number {
	return isDesc
		? b.data.view_count - a.data.view_count
		: a.data.view_count - b.data.view_count
}

export function getSortFunction(sortType: string) {
	return (
		a: CollectionEntry<'stackoverflow'>,
		b: CollectionEntry<'stackoverflow'>
	): number => {
		switch (sortType) {
			case 'creation_date_desc':
				return sortByCreationDate(a, b, true)
			case 'creation_date_asc':
				return sortByCreationDate(a, b, false)
			case 'last_edit_date_desc':
				return sortByLastEditDate(a, b, true)
			case 'last_edit_date_asc':
				return sortByLastEditDate(a, b, false)
			case 'view_count_desc':
				return sortByViewCount(a, b, true)
			case 'view_count_asc':
				return sortByViewCount(a, b, false)
			default:
				return sortByCreationDate(a, b, true)
		}
	}
}
