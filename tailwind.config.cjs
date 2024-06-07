/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			body: [
				'system-ui',
				'Arial',
				'Helvetica',
				"'Hiragino Sans'",
				"'Hiragino Kaku Gothic ProN'",
				"'Meiryo,sans-serif'",
				'sans-serif'
			]
		},
		listStyleType: {
			none: 'none',
			hyphen: "'-  '"
		},
		extend: {
			width: {
				custom: '52rem'
			},
			colors: {
				profile_blue: '#6bd3ff'
			},
			animation: {
				'fade-in': 'fadeIn 0.3s ease-in-out'
			},
			keyframes: {
				fadeIn: {
					'0%': {
						opacity: 0
					},
					'100%': {
						opacity: 1
					}
				}
			}
		}
	},
	plugins: []
}
