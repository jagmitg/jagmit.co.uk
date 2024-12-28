export interface Config {
	userId: number
	pageSize: number
	endpoints: {
		answers: string
		question: string
	}
}

export interface AnswerResponseItem {
	question_id: number
	is_accepted: boolean
	score: number
}

export interface QuestionDetail {
	tags: string[]
	owner: {
		account_id: number
		reputation: number
		user_id: number
		user_type: string
		profile_image: string
		display_name: string
		link: string
	}
	is_answered: boolean
	view_count: number
	answer_count: number
	score: number
	last_activity_date: number
	creation_date: number
	last_edit_date?: number
	question_id: number
	content_license: string
	link: string
	title: string
	key?: number
}

export interface ProcessedQuestionDetail
	extends Omit<QuestionDetail, 'owner' | 'content_license' | 'key'> {
	key: number
}

export interface StackOverflowData {
	fetched_data: {
		date_stamp: string
	}
	data: ProcessedQuestionDetail[]
}

export interface RepoFetchSettings {
	username: string
	targetFolder: string
	excludedRepos: string[]
}

export type GithubRepo = {
	name: string
	fork: boolean
	created_at: string
	description: string
	html_url: string
}
