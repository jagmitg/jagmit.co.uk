import fetch from "node-fetch";
import { writeFile, readdir, unlink } from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import type { RepoFetchSettings, GithubRepo } from "../types";

dotenv.config();

if (
  !process.env.USERNAME ||
  !process.env.TARGET_FOLDER ||
  !process.env.EXCLUDED_REPOS
) {
  throw new Error(
    "Environment variables USERNAME, TARGET_FOLDER, and EXCLUDED_REPOS must be set.",
  );
}

const REPO_FETCH_SETTINGS: RepoFetchSettings = {
  username: process.env.USERNAME,
  targetFolder: process.env.TARGET_FOLDER,
  excludedRepos: process.env.EXCLUDED_REPOS.split(","),
};

async function deleteAllMDFiles(): Promise<void[]> {
  const files = await readdir(REPO_FETCH_SETTINGS.targetFolder);
  const deletePromises = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => unlink(path.join(REPO_FETCH_SETTINGS.targetFolder, file)));
  return Promise.all(deletePromises);
}

async function createMDFiles(): Promise<void> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${REPO_FETCH_SETTINGS.username}/repos`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch repos: ${response.statusText}`);
    }

    const data = (await response.json()) as GithubRepo[];

    const writePromises = data
      .filter(
        (repo) =>
          !repo.fork && !REPO_FETCH_SETTINGS.excludedRepos.includes(repo.name),
      )
      .map(async (repo) => {
        const langResponse = await fetch(
          `https://api.github.com/repos/${REPO_FETCH_SETTINGS.username}/${repo.name}/languages`,
        );
        if (!langResponse.ok) {
          throw new Error(
            `Failed to fetch languages for repo ${repo.name}: ${langResponse.statusText}`,
          );
        }

        const languages = await langResponse.json();
        if (typeof languages === 'object' && languages !== null) {

          const repoDate = new Date(repo.created_at).toISOString().slice(0, 10);
          const languageKeys = Object.keys(languages).join(", ");
          const content = `---
  title: "${repo.name}"
  date: "${repoDate}"
  description: "${repo.description ? repo.description.replace(/"/g, '\\"') : 'No description'}"
  repo: "${repo.html_url}"
  tags: [${languageKeys.split(", ").map(key => `${key}`).join(", ")}]
  draft: false
  ---`;

          return writeFile(
            path.join(REPO_FETCH_SETTINGS.targetFolder, `${repo.name}.mdx`),
            content,
          );
        } else {
          console.error("Fetched languages data is not an object:", languages);
        }
      });

    await Promise.all(writePromises);
    console.log("All markdown files have been created successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

deleteAllMDFiles()
  .then(createMDFiles)
  .catch((error) => console.error("An error occurred:", error));
