import fetch from 'node-fetch'
import { Agent } from 'https'
import { writeFileSync } from 'fs'
import type {
	Config,
	AnswerResponseItem,
	QuestionDetail,
	ProcessedQuestionDetail,
	StackOverflowData
} from '../types'
import dotenv from 'dotenv'

dotenv.config()

const config: Config = {
	userId: Number(process.env.USER_ID),
	pageSize: Number(process.env.PAGE_SIZE),
	endpoints: {
		answers: process.env.ENDPOINT_ANSWERS!,
		question: process.env.ENDPOINT_QUESTION!
	}
}

const httpsAgent = new Agent({
	rejectUnauthorized: false
})

async function fetchAllAnswers(): Promise<number[]> {
	let page = 1
	let allAnswers: number[] = []

	console.log('Fetching all answers...')

	while (true) {
		console.log(`Fetching answers from page ${page}...`)
		const endpoint = `${config.endpoints.answers}/${config.userId}/answers?page=${page}&pagesize=${config.pageSize}&order=asc&sort=activity&site=stackoverflow`
		try {
			const response = await fetch(endpoint, { agent: httpsAgent })
			const data = (await response.json()) as {
				items?: AnswerResponseItem[]
				has_more?: boolean
			}
			if (!data.items || data.items.length === 0) break

			const filteredItems = data.items.filter(
				(item) => item.is_accepted || item.score > 0
			)
			allAnswers = [
				...allAnswers,
				...filteredItems.map((item) => item.question_id)
			]

			page++
			if (!data.has_more) break
		} catch (err) {
			console.error('Error fetching answers:', err)
			break
		}
	}

	console.log(`Fetched a total of ${allAnswers.length} answers.`)
	return Array.from(new Set(allAnswers))
}

async function fetchQuestionDetailsBulk(
	questionIds: number[]
): Promise<QuestionDetail[]> {
	console.log(`Fetching details for ${questionIds.length} questions...`)
	const endpoint = `${config.endpoints.question}/${questionIds.join(
		';'
	)}?order=desc&sort=activity&site=stackoverflow`
	try {
		const response = await fetch(endpoint, { agent: httpsAgent })
		if (!response.ok) {
			console.error(
				`Received ${response.status} from the API for batch starting with ID ${questionIds[0]}`
			)
		}
		const data = (await response.json()) as { items?: QuestionDetail[] }
		return data.items || []
	} catch (err) {
		console.error('Error fetching question details:', err)
		return []
	}
}

function cleanTitle(title: string): string {
	return title
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
}

function processQuestionDetail(
	question: QuestionDetail,
	index: number
): ProcessedQuestionDetail {
	const { owner, content_license, ...rest } = question

	return {
		...rest,
		title: cleanTitle(question.title),
		key: index + 1
	}
}

async function fetchDataAndSaveToJson(): Promise<void> {
	let results: QuestionDetail[] = []
	const allQuestionIds = await fetchAllAnswers()

	console.log('Fetching question details for each answer...')

	const batchSize = 30
	for (let i = 0; i < allQuestionIds.length; i += batchSize) {
		const batchQuestionIds = allQuestionIds.slice(i, i + batchSize)
		const questionsDetails = await fetchQuestionDetailsBulk(batchQuestionIds)
		questionsDetails.forEach((details) => {
			results.push(details)
		})
	}

	results.sort((a, b) => {
		const dateA = Number(a.creation_date)
		const dateB = Number(b.creation_date)
		return dateB - dateA
	})

	const processedResults = results.map((item, index) =>
		processQuestionDetail(item, index)
	)

	console.log(
		`Imported details for ${results.length} questions out of ${allQuestionIds.length} unique questions.`
	)

	console.log('Saving data to "src/data/stackoverflow.json"...')
	const output: StackOverflowData = {
		fetched_data: { date_stamp: new Date().toISOString() },
		data: processedResults
	}
	writeFileSync('src/data/stackoverflow.json', JSON.stringify(output, null, 2))
	console.log('Data saved successfully!')
}

fetchDataAndSaveToJson()
