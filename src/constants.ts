export const SITE_TITLE = 'Jagmit Gabba'
export const SITE_DESCRIPTION =
	'Principle Full-Stack Engineer with 12+ years of experience specialising in open-source technologies. A passionate accessibility advocate, Jag is dedicated to an inclusive web, showcasing expertise in web, TypeScript, JavaScript, Node.js, Python etc... As a DevOps enthusiast & proponent of test-driven development.'
export const BLOG_DESCRIPTION =
	'Dive into TypeScript, JavaScript, Node.js, Python, and TDD insights. DevOps enthusiast. Join the journey!'
export const REPO_PINNED = <const>['Wordpress-Select-Pagination']
export const PAGINATE_CONTENT = 10

export const TAGS_DEFINITION = {
	typescript: [/typescript/],
	javascript: [
		/javascript/,
		/next\.js/,
		/vue/,
		/react/,
		/svelte/,
		/angular/,
		/vuejs3/
	],
	python: [/python/],
	html: [/html/],
	fullstack: [/next\.js/, /express/, /node\.js/, /python/, /flask/],
	frameworks: [/vue/, /react/, /svelte/, /angular/, /reactjs/],
	nodejs: [/node\.js/, /nodejs/]
}

export const PAGE_LINKS = <const>[
	{
		icon: '😵‍💫',
		title: 'about',
		href: '/'
	},
	{
		icon: '🗒',
		title: 'blog',
		href: '/blog/'
	},
	{
		icon: '🗒',
		title: 'tools',
		href: '/tools/'
	},
	{
		icon: '🗒',
		title: 'stackoverflow',
		href: '/stackoverflow/'
	}
]

export type PAGE_PATH = (typeof PAGE_LINKS)[number]['href']
export type MediaType = 'article' | 'podcast' | 'achievement' | 'talk'
