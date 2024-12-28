// @ts-nocheck

import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'
import { TAGS_DEFINITION } from '@const'

export interface FlexibleBlogPost
	extends Omit<CollectionEntry<'blog'>, 'slug'> {
	slug: string
}

function normalizeSlug(slug: string): string {
	const normalized = slug.replace(/^(content|repo)\//, '')
	return normalized
}

export async function getSortedPosts(): Promise<FlexibleBlogPost[]> {
	const isProd = import.meta.env.ENVS === 'production'
	const allBlogPosts: CollectionEntry<'blog'>[] = await getCollection(
		'blog',
		({ data }) => {
			return isProd ? !data.draft : true
		}
	)

	if (!allBlogPosts.length) {
		console.log('No posts found')
	}

	const sorted: FlexibleBlogPost[] = allBlogPosts
		.map((post) => ({
			...post,
			slug: normalizeSlug(post.slug)
		}))
		.sort((a, b) => {
			const dateA = new Date(a.data.date)
			const dateB = new Date(b.data.date)
			return dateA > dateB ? -1 : 1
		})

	sorted.forEach((post, index, array) => {
		if (index > 0) {
			post.data.nextSlug = array[index - 1].slug
			post.data.nextTitle = array[index - 1].data.title
		}
		if (index < array.length - 1) {
			post.data.prevSlug = array[index + 1].slug
			post.data.prevTitle = array[index + 1].data.title
		}
	})

	return sorted
}

export type Tag = {
	name: string
	count: number
}

export async function getTagList(): Promise<Tag[]> {
	const isProd = import.meta.env.ENVS === 'production'
	const allBlogPosts = await getCollection('blog', ({ data }) => {
		return isProd ? !data.draft : true
	})

	const countMap: { [key: string]: number } = {}

	allBlogPosts.forEach((post) => {
		post.data.tags.forEach((tag: string) => {
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

export function generateUniqueTags(questions: Question[]): string[] {
	let allTags = new Set<string>()

	questions.forEach((question) => {
		question.tags.forEach((tag: any) => {
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
	a: any,
	b: any,
	isDesc: boolean = true
): number {
	const dateA = a.creation_date
	const dateB = b.creation_date
	return isDesc ? dateB - dateA : dateA - dateB
}

export function sortByLastEditDate(
	a: any,
	b: any,
	isDesc: boolean = true
): number {
	const dateA = a.last_edit_date || a.creation_date
	const dateB = b.last_edit_date || b.creation_date
	return isDesc ? dateB - dateA : dateA - dateB
}

export function sortByViewCount(
	a: any,
	b: any,
	isDesc: boolean = true
): number {
	return isDesc ? b.view_count - a.view_count : a.view_count - b.view_count
}

export function getSortFunction(sortType: string): (a: any, b: any) => number {
	switch (sortType) {
		case 'creation_date_desc':
			return (a, b) => sortByCreationDate(a, b, true)
		case 'creation_date_asc':
			return (a, b) => sortByCreationDate(a, b, false)
		case 'last_edit_date_desc':
			return (a, b) => sortByLastEditDate(a, b, true)
		case 'last_edit_date_asc':
			return (a, b) => sortByLastEditDate(a, b, false)
		case 'view_count_desc':
			return (a, b) => sortByViewCount(a, b, true)
		case 'view_count_asc':
			return (a, b) => sortByViewCount(a, b, false)
		default:
			return (a, b) => sortByCreationDate(a, b, true)
	}
}
