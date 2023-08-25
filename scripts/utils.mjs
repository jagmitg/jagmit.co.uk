import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";
import { load } from "cheerio";

export const baseDataPath = join(fileURLToPath(import.meta.url), "../../data");
export const generatedDataPath = join(
  fileURLToPath(import.meta.url),
  "../../generated",
);
export const baseImageOutputPath = join(
  fileURLToPath(import.meta.url),
  "../../public/images/external",
);
export const blogPath = join(
  fileURLToPath(import.meta.url),
  "../../src/content/blog",
);

export async function readData(filename, original = true) {
  const data = await readFile(
    join(original ? baseDataPath : generatedDataPath, `${filename}.json`),
    "utf-8",
  );

  return JSON.parse(data);
}

export async function generateData(filename, data) {
  await writeFile(
    join(generatedDataPath, `${filename}.json`),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

export function sortItems(items) {
  return items.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getUrls() {
  const xml = await readFile(
    join(fileURLToPath(import.meta.url), "../../dist/sitemap-0.xml"),
    "utf-8",
  );

  const $ = load(xml);
  const urls = $("url loc")
    .toArray()
    .map((el) => el.children[0].data);

  return urls;
}
