import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { question, answer } = req.body;

  if (!question || !answer) {
    console.error('Missing question or answer', req.body); // Log the received payload
    return res.status(400).json({ error: 'Question and answer are required.' });
  }

  try {
    const gemini = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    const prompt = `다음 질문과 답변에 대한 피드백을 제공해줘.\n\n질문: ${question}\n\n답변: ${answer}\n\n피드백:`;
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });

    console.log('Prompt:', prompt); // Log the prompt for debugging

    const result = await model.generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 150,
      n: 1,
    });

    console.log('API Result:', result); // Log the raw API result for debugging

    if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
      throw new Error('No candidates found in the response');
    }

    // Extract the feedback from the response
    const feedback = result.response.candidates[0].content.parts[0].text.trim();
    console.log('Generated Feedback:', feedback); // Log the feedback to the terminal

    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);

    // Improved error handling to catch specific issues
    if (error.response) {
      console.error('Error response:', error.response.data);
      return res.status(error.response.status).json({ error: error.response.data });
    }

    res.status(500).json({ error: 'Failed to generate feedback' });
  }
}
