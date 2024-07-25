import axios from 'axios';
import cheerio from 'cheerio';

const crawlJobKorea = async (interest) => {
  const url = `https://www.jobkorea.co.kr/Search/?stext=${encodeURIComponent(interest)}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const jobListings = [];

  $('.list-post').each((index, element) => {
    const title = $(element).find('.title').text().trim();
    const company = $(element).find('.name').text().trim();
    const location = $(element).find('.loc').text().trim();
    const datePosted = $(element).find('.date').text().trim();
    const link = $(element).find('a').attr('href'); // Fetch the job link

    jobListings.push({
      title,
      company,
      location,
      datePosted,
      link: `https://www.jobkorea.co.kr${link}`, // Make sure the link is complete
    });
  });

  return jobListings;
};

export default async function handler(req, res) {
  const { interest } = req.query;
  try {
    const jobListings = await crawlJobKorea(interest || '교육');
    res.status(200).json(jobListings);
  } catch (error) {
    console.error('Error crawling JobKorea:', error);
    res.status(500).json({ error: 'Error crawling JobKorea' });
  }
}
