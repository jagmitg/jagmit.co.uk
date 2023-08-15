export const SITE_TITLE = "Jagmit Gabba";
export const SITE_DESCRIPTION =
  "Principle Full-Stack Engineer with 12+ years of experience specialising in open-source technologies. A passionate accessibility advocate, Jag is dedicated to an inclusive web, showcasing expertise in web, TypeScript, JavaScript, Node.js, Python etc... As a DevOps enthusiast & proponent of test-driven development.";
export const BLOG_DESCRIPTION =
  "Dive into TypeScript, JavaScript, Node.js, Python, and TDD insights. DevOps enthusiast. Join the journey!";
export const REPO_PINNED = <const>["Wordpress-Select-Pagination"];
export const PAGINATE_CONTENT = 5;
export const STACKOVERFLOW_CONFIG = {
  userId: 2244383,
  endpoints: {
    answers: "https://api.stackexchange.com/2.3/users",
    question: "https://api.stackexchange.com/2.3/questions",
  },
  pageSize: 20,
};

export const PAGE_LINKS = <const>[
  {
    icon: "😵‍💫",
    title: "about",
    href: "/",
  },
  {
    icon: "🗒",
    title: "blog",
    href: "/blog",
  },
  {
    icon: "🗒",
    title: "stackoverflow",
    href: "/stackoverflow",
  },
];

export type PAGE_PATH = (typeof PAGE_LINKS)[number]["href"];
export type MediaType = "article" | "podcast" | "achievement" | "talk";
