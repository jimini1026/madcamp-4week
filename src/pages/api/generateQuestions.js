import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { content, numQuestions } = req.body;

  try {
    const gemini = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    const prompt = `다음 자기소개서를 바탕으로 새로운 내용의 질문을 ${numQuestions}가지 해주세요. 자기소개서에서 답을 찾을 수 있는 질문은 하지 말아주세요. 존댓말로 질문해주세요.:\n\n${content}`;
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });

    //console.log('Prompt:', prompt); // Log the prompt for debugging

    const result = await model.generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 150,
      n: 5,
    });

    //console.log('API Response:', JSON.stringify(result, null, 2)); // Log the API response for debugging

    if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
      throw new Error('No candidates found in the response');
    }

    // Extract and parse the questions from the response
    const generatedText = result.response.candidates[0].content.parts[0].text.trim();
    const questions = parseGeneratedQuestions(generatedText);

    //console.log("Parsed Questions: ", questions); // Log the parsed questions to the console

    // Save the questions to the InterviewQuestions.js file
    await saveQuestionsToFile(questions);

    res.status(200).json({ questions });
  } catch (error) {
    //console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
}

function parseGeneratedQuestions(text) {
  const questionLines = text.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.') || line.trim().startsWith('4.') || line.trim().startsWith('5.'));
  return questionLines.map(line => ({
    question: line.replace(/^\d+\.\s*/, '').trim(),
    answer: ""
  }));
}

async function saveQuestionsToFile(questions) {
  const filePath = path.resolve(process.cwd(), 'src/data/InterviewQuestions.js');

  const fileContent = `
export const initialQuestionsAndAnswers = ${JSON.stringify(questions, null, 2)};
  `;
  fs.writeFileSync(filePath, fileContent);
}
