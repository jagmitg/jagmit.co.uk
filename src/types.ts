export interface Question {
  key?: number;  // Optional because you are adding it dynamically
  title: string;
  link: string;
  tags: string[];
  creation_date: number;
}

// Define the structure for pagination details
export interface Pagination {
  lastPage: number;
  currentPage: number;
  url: {
    prev: string | null;
    next: string | null;
  };
}

// Define the structure for the props passed to each page
export interface PageProps {
  questions: Question[];
  page: Pagination;
}
