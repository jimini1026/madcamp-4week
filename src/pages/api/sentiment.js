import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { content } = req.body;

  if (!content) {
    console.error('Missing content', req.body); // Log the received payload
    return res.status(400).json({ error: 'Content is required.' });
  }

  const client_id = process.env.NAVER_SENTIMENT_ID;
  const client_secret = process.env.NAVER_SENTIMENT_SECRET;

  try {
    const response = await axios.post('https://naveropenapi.apigw.ntruss.com/sentiment-analysis/v1/analyze', {
      content: content
    }, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': client_id,
        'X-NCP-APIGW-API-KEY': client_secret,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const confidence = response.data.document.confidence;
      const sentiment = {
        positive: confidence.positive / 100,
        neutral: confidence.neutral / 100,
        negative: confidence.negative / 100
      };
      res.status(200).json({ sentiment });
    } else {
      console.error(`Error: ${response.status}`);
      res.status(response.status).json({ error: response.statusText });
    }
  } catch (error) {
    console.error('Error fetching sentiment:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      return res.status(error.response.status).json({ error: error.response.data });
    }
    res.status(500).json({ error: 'Failed to fetch sentiment' });
  }
}
