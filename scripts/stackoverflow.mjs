import fetch from "node-fetch";
import { Agent } from "https";
import { writeFileSync } from "fs";

const config = {
  userId: 2244383,
  pageSize: 20,
  endpoints: {
    answers: "https://api.stackexchange.com/2.3/users",
    question: "https://api.stackexchange.com/2.3/questions",
  },
};

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

async function fetchAllAnswers() {
  let page = 1;
  let allAnswers = [];

  console.log("Fetching all answers...");

  while (true) {
    console.log(`Fetching answers from page ${page}...`);
    const endpoint = `${config.endpoints.answers}/${config.userId}/answers?page=${page}&pagesize=${config.pageSize}&order=asc&sort=activity&site=stackoverflow`;
    try {
      const response = await fetch(endpoint, { agent: httpsAgent });
      const data = await response.json();
      if (!data.items || data.items.length === 0) break;

      allAnswers = [
        ...allAnswers,
        ...data.items.map((item) => item.question_id),
      ];

      page++;
      if (!data.has_more) break;
    } catch (err) {
      console.error("Error fetching answers:", err);
      break;
    }
  }

  console.log(`Fetched a total of ${allAnswers.length} answers.`);
  return Array.from(new Set(allAnswers)); // return only unique question_ids
}

async function fetchQuestionDetailsBulk(questionIds) {
  console.log(`Fetching details for ${questionIds.length} questions...`);
  const endpoint = `${config.endpoints.question}/${questionIds.join(
    ";"
  )}?order=desc&sort=activity&site=stackoverflow`;
  try {
    const response = await fetch(endpoint, { agent: httpsAgent });
    if (!response.ok) {
      console.error(
        `Received ${response.status} from the API for batch starting with ID ${questionIds[0]}`
      );
    }
    const data = await response.json();
    if (data.items.length !== questionIds.length) {
      console.warn(
        `Mismatch: Requested details for ${questionIds.length} questions but received ${data.items.length} in batch starting with ID ${questionIds[0]}`
      );
    }
    return data.items || [];
  } catch (err) {
    console.error("Error fetching question details:", err);
    return [];
  }
}

async function fetchDataAndSaveToJson() {
  let results = {};
  const allQuestionIds = await fetchAllAnswers();

  console.log("Fetching question details for each answer...");

  const batchSize = 30;
  for (let i = 0; i < allQuestionIds.length; i += batchSize) {
    const batchQuestionIds = allQuestionIds.slice(i, i + batchSize);
    const questionsDetails = await fetchQuestionDetailsBulk(batchQuestionIds);
    questionsDetails.forEach((details) => {
      results[details.question_id] = {
        question_id: details.question_id,
        answer_id: details.accepted_answer_id,
        creation_date: details.creation_date,
        is_accepted: !!details.accepted_answer_id,
        tags: details.tags,
        link: details.link,
        title: details.title,
      };
    });
  }

  console.log(
    `Imported details for ${Object.keys(results).length} questions out of ${
      allQuestionIds.length
    } unique questions.`
  );
  console.log("Saving data to 'src/data/stackoverflow.json'...");
  writeFileSync(
    "src/data/stackoverflow.json",
    JSON.stringify(results, null, 2)
  );
  console.log("Data saved successfully!");
}

fetchDataAndSaveToJson();
