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
          let content = `---
title: Repo ${repo.name}
date: ${new Date().toISOString().slice(0, 10)}
description: Repo ${repo.name} details fetched from GitHub API
repo: ${repo.html_url}
---`;
          return writeFile(
            path.join(REPO_FETCH_SETTINGS.targetFolder, `${repo.name}.mdx`),
            content
          );
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
