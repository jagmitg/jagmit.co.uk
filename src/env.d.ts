/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/image/client" />

interface Window {
  algolia: {
    applicationId: string;
    searchOnlyKey: string;
  };
}

interface ImportMetaEnv {
  readonly GITHUB_TOKEN: string;
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type DataItem = {
  siteName?: string;
  siteUrl?: string;
  url: string;
  title: string;
  description?: string;
  image?: string;
  publishedAt: string;
  category?: string;
  icon: string;
  hot?: boolean;
  prefixForTitle: string;
  appendixes?: Record<string, string | undefined>;
};

type OGPJson = Record<
  string,
  {
    title: string;
    description: string;
    image: string;
  }
>;
