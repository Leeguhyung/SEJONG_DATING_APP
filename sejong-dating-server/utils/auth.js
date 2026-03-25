const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

async function authenticateWithSejong(studentId, password) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://do.sejong.ac.kr/ko/process/member/login',
    },
  }));

  try {
    const loginData = new URLSearchParams({
      email: studentId,
      password: password
    }).toString();

    await client.post('https://do.sejong.ac.kr/ko/process/member/login', loginData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const response = await client.get('https://do.sejong.ac.kr/');
    const $ = cheerio.load(response.data);
    const infoDiv = $('div.info');
    
    if (infoDiv.length === 0) {
      return { success: false, message: '인증 실패: 학번 또는 비밀번호를 확인하세요.' };
    }

    const name = infoDiv.find('b').text().trim();
    const rawMajor = infoDiv.find('small').text().trim();
    const major = rawMajor.split(' ').slice(1).join(' ');

    return {
      success: true,
      data: { name, major, studentId }
    };
  } catch (error) {
    console.error('Scraping Error:', error.message);
    return { success: false, message: '인증 서버 연결 중 오류가 발생했습니다.' };
  }
}

module.exports = { authenticateWithSejong };
