import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import externalLinks from 'rehype-external-links'
import robotsTxt from 'astro-robots-txt'

export default defineConfig({
	site: 'https://jagmit.co.uk',
	output: 'static',
	trailingSlash: 'always',
	compressHTML: true,
	vite: {
		build: {
			rollupOptions: {
				output: {
					assetFileNames: 'assets/[name][extname]'
				}
			}
		}
	},
	integrations: [tailwind(), sitemap(), mdx(), robotsTxt()],
	markdown: {
		syntaxHighlight: 'prism',
		rehypePlugins: [
			[externalLinks, { rel: ['noopener', 'noreferrer'], target: '_blank' }]
		],
		shikiConfig: {
			theme: 'nord'
		}
	}
})
