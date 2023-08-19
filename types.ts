export interface Config {
  userId: number;
  pageSize: number;
  endpoints: {
    answers: string;
    question: string;
  };
}

export interface AnswerResponseItem {
  question_id: number;
  is_accepted: boolean;
  score: number;
}

export interface QuestionDetail {
  question_id: number;
  accepted_answer_id?: number;
  creation_date: number;
  tags: string[];
  link: string;
  title: string;
}

export interface RepoFetchSettings {
  username: string;
  targetFolder: string;
  excludedRepos: string[];
}
export type GithubRepo = {
  name: string;
  fork: boolean;
  created_at: string;
  description: string;
  html_url: string;
};
