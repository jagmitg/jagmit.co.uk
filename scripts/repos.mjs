import fetch from "node-fetch";
import { writeFile, readdir, unlink } from "fs/promises";
import path from "path";

const REPO_FETCH_SETTINGS = {
  username: "jagmitg",
  targetFolder: "./src/content/repo",
  excludedRepos: ["jagmitg"],
};

function deleteAllMDFiles() {
  return readdir(REPO_FETCH_SETTINGS.targetFolder).then((files) => {
    const deletePromises = files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => unlink(path.join(REPO_FETCH_SETTINGS.targetFolder, file)));
    return Promise.all(deletePromises);
  });
}

function createMDFiles() {
  fetch(`https://api.github.com/users/${REPO_FETCH_SETTINGS.username}/repos`)
    .then((response) => response.json())
    .then((data) => {
      const writePromises = data
        .filter(
          (repo) =>
            !repo.fork && !REPO_FETCH_SETTINGS.excludedRepos.includes(repo.name)
        )
        .map((repo) => {
          return fetch(
            `https://api.github.com/repos/${REPO_FETCH_SETTINGS.username}/${repo.name}/languages`
          )
            .then((langResponse) => langResponse.json())
            .then((languages) => {
              let repoDate = new Date(repo.created_at)
                .toISOString()
                .slice(0, 10);
              let languageKeys = Object.keys(languages).join(", ");
              let content = `---
title: ${repo.name}
date: ${repoDate}
repo: ${repo.html_url}
tags: ${languageKeys}
---`;
              return writeFile(
                path.join(REPO_FETCH_SETTINGS.targetFolder, `${repo.name}.mdx`),
                content
              );
            });
        });
      return Promise.all(writePromises);
    })
    .then(() =>
      console.log("All markdown files have been created successfully.")
    )
    .catch((error) => console.error("An error occurred:", error));
}

deleteAllMDFiles()
  .then(createMDFiles)
  .catch((error) => console.error("An error occurred:", error));
