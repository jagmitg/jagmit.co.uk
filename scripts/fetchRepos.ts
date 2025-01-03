import { mkdir, access, writeFile } from 'fs/promises'
import path from 'path'
import 'dotenv/config'
import type { RepoFetchSettings, GithubRepo } from '../types'

if (!process.env.USERNAME || !process.env.TARGET_FOLDER || !process.env.EXCLUDED_REPOS || !process.env.ENVS) {
  throw new Error('Environment variables USERNAME, TARGET_FOLDER, EXCLUDED_REPOS, and ENVS must be set.')
}

const REPO_FETCH_SETTINGS: RepoFetchSettings = {
  username: process.env.USERNAME,
  targetFolder: process.env.TARGET_FOLDER,
  excludedRepos: process.env.EXCLUDED_REPOS.split(',')
}

async function fileExists(filepath: string): Promise<boolean> {
  try {
    await access(filepath)
    return true
  } catch {
    return false
  }
}

async function ensureDirectoryExists(dir: string) {
  try {
    await mkdir(dir, { recursive: true })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string, retries = 3, delayMs = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (response.status === 403) {
        const resetTime = response.headers.get('x-ratelimit-reset')
        if (resetTime) {
          const waitTime = (parseInt(resetTime) * 1000) - Date.now()
          if (waitTime > 0) {
            console.log(`Rate limited. Waiting ${Math.ceil(waitTime / 1000)} seconds...`)
            await delay(waitTime)
            continue
          }
        }
      }
      if (response.ok) return response
      throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
      if (i === retries - 1) throw error
      await delay(delayMs * (i + 1))
    }
  }
  throw new Error('Max retries reached')
}

interface RepoData {
  title: string;
  date: string;
  slug: string;
  description: string;
  repo: string;
  tags: string[];
  draft: boolean;
}

async function updateReposJson(): Promise<void> {
  // Check if we're in development environment and if repos.json exists
  if (process.env.ENVS === 'development') {
    const jsonFilePath = path.join(REPO_FETCH_SETTINGS.targetFolder, 'repos.json')
    const reposFileExists = await fileExists(jsonFilePath)

    if (reposFileExists) {
      console.log('repos.json already exists in development environment. Skipping update.')
      return
    }
  }

  // Only ensure the directory exists if it doesn't already
  await ensureDirectoryExists(REPO_FETCH_SETTINGS.targetFolder)
  const repoList: RepoData[] = [];

  try {
    const response = await fetchWithRetry(
      `https://api.github.com/users/${REPO_FETCH_SETTINGS.username}/repos`
    )
    const data = (await response.json()) as GithubRepo[]

    for (const repo of data) {
      if (repo.fork || REPO_FETCH_SETTINGS.excludedRepos.includes(repo.name)) {
        continue
      }

      try {
        const langResponse = await fetchWithRetry(
          `https://api.github.com/repos/${REPO_FETCH_SETTINGS.username}/${repo.name}/languages`
        )
        const languages = await langResponse.json()

        if (typeof languages === 'object' && languages !== null) {
          const repoDate = new Date(repo.created_at).toISOString().slice(0, 10)
          const languageKeys = Object.keys(languages)

          const repoData: RepoData = {
            title: repo.name,
            slug: repo.name,
            date: repoDate,
            description: repo.description || 'No description',
            repo: repo.html_url,
            tags: languageKeys,
            draft: false
          }

          repoList.push(repoData)
          console.log(`Processed repo ${repo.name}`)
          await delay(1000)
        }
      } catch (error) {
        console.error(`Error processing repo ${repo.name}:`, error)
      }
    }

    // Write/update only the repos.json file
    const jsonFilePath = path.join(REPO_FETCH_SETTINGS.targetFolder, 'repos.json')
    await writeFile(jsonFilePath, JSON.stringify(repoList, null, 2))
    console.log('repos.json has been updated successfully.')
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

updateReposJson().catch((error) => console.error('An error occurred:', error))
