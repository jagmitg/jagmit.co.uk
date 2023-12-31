import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import externalLinks from "rehype-external-links";

export default defineConfig({
  site: "https://jagmit.co.uk",
  output: "static",
  trailingSlash: "always",
  compressHTML: true,
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name][extname]",
        },
      },
    },
  },
  integrations: [
    tailwind(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    sitemap(),
    mdx(),
  ],
  markdown: {
    syntaxHighlight: "prism",
    rehypePlugins: [
      [externalLinks, { rel: ["noopener", "noreferrer"], target: "_blank" }],
    ],
    shikiConfig: {
      theme: "nord",
    },
  },
});
