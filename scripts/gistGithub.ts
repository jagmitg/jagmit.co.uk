import * as fs from 'fs/promises'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

interface GistResponse {
	id: string
	files: {
		[key: string]: {
			filename: string
			content: string
		}
	}
}

interface CodeBlock {
	filename: string
	content: string
	fullMatch: string
}

async function findMdxFiles(directory: string): Promise<string[]> {
	const mdxFiles: string[] = []

	async function scan(dir: string) {
		const entries = await fs.readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name)

			if (entry.isDirectory()) {
				await scan(fullPath)
			} else if (entry.isFile() && entry.name.endsWith('.mdx')) {
				mdxFiles.push(fullPath)
			}
		}
	}

	await scan(directory)
	return mdxFiles
}

function extractCodeBlocks(content: string): CodeBlock[] {
	const codeBlockRegex = /```([\w.-]+(?:\.[a-zA-Z]+)?)\n([\s\S]*?)```/g
	const matches: CodeBlock[] = []
	let match

	while ((match = codeBlockRegex.exec(content)) !== null) {
		matches.push({
			filename: match[1],
			content: match[2].trim(),
			fullMatch: match[0]
		})
	}

	return matches
}

async function createGistWithMultipleFiles(
	files: { [filename: string]: { content: string } },
	token: string
): Promise<string> {
	const response = await fetch('https://api.github.com/gists', {
		method: 'POST',
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			description: 'Code blocks from MDX file',
			public: false,
			files
		})
	})

	if (!response.ok) {
		throw new Error(`Failed to create gist: ${await response.text()}`)
	}

	const data: GistResponse = await response.json()
	return data.id
}

async function processFile(filePath: string, token: string): Promise<void> {
	const content = await fs.readFile(filePath, 'utf-8')
	const codeBlocks = extractCodeBlocks(content)
	let modifiedContent = content

	// Group all code blocks into a single gist
	const gistFiles: { [filename: string]: { content: string } } = {}
	codeBlocks.forEach((block) => {
		gistFiles[block.filename] = { content: block.content }
	})

	try {
		if (Object.keys(gistFiles).length > 0) {
			const gistId = await createGistWithMultipleFiles(gistFiles, token)

			for (const block of codeBlocks) {
				const replacement = `<code
  data-gist-id="${gistId}"
  data-gist-file="${block.filename}"
></code>`

				modifiedContent = modifiedContent.replace(block.fullMatch, replacement)
			}
			console.log(
				`Created gist ${gistId} with ${Object.keys(gistFiles).length} files in ${filePath}`
			)
		}
	} catch (error) {
		console.error(`Failed to process code blocks in ${filePath}:`, error)
	}

	await fs.writeFile(filePath, modifiedContent, 'utf-8')
}

async function main() {
	const token = process.env.GITHUB_PAT
	const directory = process.env.MDX_DIRECTORY

	if (!token) {
		throw new Error('GITHUB_PAT not found in environment variables')
	}

	if (!directory) {
		throw new Error('MDX_DIRECTORY not found in environment variables')
	}

	const mdxFiles = await findMdxFiles(directory)
	console.log(`Found ${mdxFiles.length} MDX files`)

	for (const file of mdxFiles) {
		try {
			await processFile(file, token)
			console.log(`Processed ${file}`)
		} catch (error) {
			console.error(`Failed to process ${file}:`, error)
		}
	}
}

main().catch(console.error)
