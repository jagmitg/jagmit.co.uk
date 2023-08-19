import { getUrls } from "./utils.mjs";

async function processUrls(): Promise<void> {
  const urls: string[] = await getUrls();

  await Promise.allSettled(
    urls.map(async (url: string) => {
      await fetch(url);
      console.log("done", url);
    }),
  );
}

processUrls().catch((error) => {
  console.error("Error processing URLs:", error);
});
