export const SITE_TITLE = "Jagmit Gabba";
export const SITE_DESCRIPTION =
  "Jagmit is a JavaScript engineer and working on some OSS projects and Japanese communities.";
export const BLOG_DESCRIPTION =
  "This blog posts my life topic and tech topics mainly JavaScript.";
export const PAGE_LINKS = <const>[
  {
    icon: "😵‍💫",
    title: "about",
    href: "/",
  },
  {
    icon: "👨‍💻",
    title: "jobs",
    href: "/jobs",
  },
  {
    icon: "🗒",
    title: "blog",
    href: "/blog",
  },
  {
    icon: "🗒",
    title: "contact",
    href: "/contact",
  },
];
export type PAGE_PATH = (typeof PAGE_LINKS)[number]["href"];
export type MediaType = "article" | "podcast" | "achievement" | "talk";
