import { IncomingForm } from 'formidable';
import fs from 'fs';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      res.status(500).json({ error: 'Failed to parse form data' });
      return;
    }

    console.log('Parsed files:', files);

    const file = files.audio;
    const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;

    if (!filePath) {
      console.error('File path is not defined');
      res.status(500).json({ error: 'File path is not defined' });
      return;
    }

    try {
      const audioFile = fs.readFileSync(filePath);

      const response = await axios.post(
        'https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=Kor',
        audioFile,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
            'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET,
          },
        }
      );

      console.log('API response:', response.data);

      res.status(200).json({ transcript: response.data.text });
    } catch (error) {
      console.error('API request error:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to recognize speech' });
    }
  });
}
