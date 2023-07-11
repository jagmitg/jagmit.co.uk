import fetch from "node-fetch";
import { writeFile, readdir, unlink } from "fs/promises";
import path from "path";

const targetFolder = "./src/content/repo"; // Define the target folder here
const excludedRepos = ["jagmitg"]; // Define the repos you want to exclude here

function deleteAllMDFiles() {
  return readdir(targetFolder).then((files) => {
    const deletePromises = files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => unlink(path.join(targetFolder, file)));
    return Promise.all(deletePromises);
  });
}

function createMDFiles() {
  fetch("https://api.github.com/users/jagmitg/repos")
    .then((response) => response.json())
    .then((data) => {
      const writePromises = data
        .filter((repo) => !repo.fork && !excludedRepos.includes(repo.name))
        .map((repo) => {
          let content = `---
title: ${repo.name}
date: ${new Date().toISOString().slice(0, 10)}
repo: ${repo.html_url}
---`;
          return writeFile(
            path.join(targetFolder, `${repo.name}.mdx`),
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
