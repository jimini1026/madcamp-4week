// pages/api/jobKorea.js

import axios from 'axios';
import cheerio from 'cheerio';

const crawlJobKorea = async () => {
  const url = 'https://www.jobkorea.co.kr/Search/?stext=%EA%B5%90%EC%9C%A1'; // '교육' 부문 채용 공고 URL
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const jobListings = [];

  $('.list-post').each((index, element) => {
    const title = $(element).find('.title').text().trim();
    const company = $(element).find('.name').text().trim();
    const location = $(element).find('.loc').text().trim(); // location 정보 추출
    const datePosted = $(element).find('.date').text().trim();

    jobListings.push({
      title,
      company,
      location,
      datePosted,
    });
  });

  return jobListings;
};

export default async function handler(req, res) {
  try {
    const jobListings = await crawlJobKorea();
    res.status(200).json(jobListings);
  } catch (error) {
    console.error('Error crawling JobKorea:', error);
    res.status(500).json({ error: 'Error crawling JobKorea' });
  }
}
