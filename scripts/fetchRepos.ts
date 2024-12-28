import { mkdir } from 'fs/promises'
import { writeFile, readdir, unlink } from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'
import type { RepoFetchSettings, GithubRepo } from '../types'

dotenv.config()

if (!process.env.USERNAME || !process.env.TARGET_FOLDER || !process.env.EXCLUDED_REPOS) {
  throw new Error('Environment variables USERNAME, TARGET_FOLDER, and EXCLUDED_REPOS must be set.')
}

const REPO_FETCH_SETTINGS: RepoFetchSettings = {
  username: process.env.USERNAME,
  targetFolder: process.env.TARGET_FOLDER,
  excludedRepos: process.env.EXCLUDED_REPOS.split(',')
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

async function getExistingRepos(targetFolder: string): Promise<Set<string>> {
  try {
    const files = await readdir(targetFolder)
    return new Set(files.map(file => file.replace('.mdx', '')))
  } catch {
    return new Set()
  }
}

async function createMDFiles(): Promise<void> {
  await ensureDirectoryExists(REPO_FETCH_SETTINGS.targetFolder)
  const existingRepos = await getExistingRepos(REPO_FETCH_SETTINGS.targetFolder)

  try {
    const response = await fetchWithRetry(
      `https://api.github.com/users/${REPO_FETCH_SETTINGS.username}/repos`
    )
    const data = (await response.json()) as GithubRepo[]

    for (const repo of data) {
      if (repo.fork ||
          REPO_FETCH_SETTINGS.excludedRepos.includes(repo.name) ||
          existingRepos.has(repo.name)) {
        continue
      }

      try {
        const langResponse = await fetchWithRetry(
          `https://api.github.com/repos/${REPO_FETCH_SETTINGS.username}/${repo.name}/languages`
        )
        const languages = await langResponse.json()

        if (typeof languages === 'object' && languages !== null) {
          const repoDate = new Date(repo.created_at).toISOString().slice(0, 10)
          const languageKeys = Object.keys(languages).join(', ')
          const content = `---
title: "${repo.name}"
date: "${repoDate}"
description: "${repo.description ? repo.description.replace(/"/g, '\\"') : 'No description'}"
repo: "${repo.html_url}"
tags: [${languageKeys.split(', ').map((key) => `${key}`).join(', ')}]
draft: false
---`

          await writeFile(
            path.join(REPO_FETCH_SETTINGS.targetFolder, `${repo.name}.mdx`),
            content
          )
          console.log(`Created file for ${repo.name}`)
          await delay(1000)
        }
      } catch (error) {
        console.error(`Error processing repo ${repo.name}:`, error)
      }
    }

    console.log('All markdown files have been created successfully.')
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

createMDFiles().catch((error) => console.error('An error occurred:', error))
