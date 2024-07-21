import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY; // Ensure this is set in your environment variables

      // Replace with the correct base URL for the Gemini API
      const geminiApiUrl = 'https://api.gemini.example.com/v1/generate-response'; // Update this URL with the actual endpoint

      console.log('Requesting Gemini API with URL:', geminiApiUrl);

      const response = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get response text for better error debugging
        throw new Error(`Failed to get Gemini response: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini response:', data); // Log the response to the terminal
      res.status(200).json(data);
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      res.status(500).json({ error: 'Failed to get Gemini response', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
