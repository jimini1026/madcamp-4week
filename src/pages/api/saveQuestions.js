// src/pages/api/saveQuestions.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const { questions } = req.body;
        
        if (!questions || !Array.isArray(questions)) {
          return res.status(400).json({ error: 'Questions are required and must be an array' });
        }
  
        // Logic to save questions (e.g., save to a database)
        // For now, let's just return the questions for demonstration
        return res.status(200).json({ message: 'Questions saved successfully', questions });
      } catch (error) {
        console.error('Failed to save questions:', error);
        return res.status(500).json({ error: 'Failed to save questions' });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  }
  