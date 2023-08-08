import rss from "@astrojs/rss";
import { extname } from "node:path";
import { getBlogsAndRepos } from "@utils/collections";

const { allCollections } = await getBlogsAndRepos();

const site = new URL("blog", import.meta.env.SITE).toString();

export const get = () => generateRss(site, allCollections);

function generateRss(site: string, collections: any[]) {
  return rss({
    title: "Jagmit's Blog",
    description: "a blog for programming",
    site,
    items: collections.map((post) => {
      const image = post.data.image ? post.data.image.replace(/^\//, "") : "";
      const imageType = image
        ? `image/${extname(image).replace(/^\./, "")}`
        : "";

      return {
        link: `${site}/${post.slug}`,
        title: post.data.title,
        description: post.data.description || "",
        pubDate: new Date(post.data.date),
        customData: image
          ? `
            <enclosure url="${site}${image}" length="0" type="${imageType}" />
          `.trim()
          : "",
      };
    }),
  });
}
