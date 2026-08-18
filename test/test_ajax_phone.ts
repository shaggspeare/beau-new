import axios from 'axios';
import { config } from '../src/config';

async function testAjaxWithSession() {
  const pageUrl = 'https://barb.ua/uk/master/afelcher';

  console.log('1. Fetching page with cookies to obtain session & csrf token...');
  const pageRes = await axios.get(pageUrl, {
    headers: config.defaultHeaders
  });

  const cookies = pageRes.headers['set-cookie'];
  const cookieHeader = cookies ? cookies.map((c) => c.split(';')[0]).join('; ') : '';
  console.log('Got cookies:', cookieHeader);

  const csrfMatch = pageRes.data.match(/<meta name="csrf-token" content="([^"]+)"/);
  const csrfToken = csrfMatch ? csrfMatch[1] : '';
  console.log('Got CSRF Token:', csrfToken);

  const endpointMatch = pageRes.data.match(/['"](https?:\/\/barb\.ua\/[a-z]{2}\/ajax\/parsers_[a-zA-Z0-9_-]+)['"]/);
  const endpoint = endpointMatch ? endpointMatch[1] : 'https://barb.ua/uk/ajax/parsers_aa879736c25bfc5d54801150c78785be';
  console.log('Got Ajax endpoint:', endpoint);

  console.log('2. Sending AJAX POST request for phone...');
  const res = await axios.post(
    endpoint,
    new URLSearchParams({
      uid: '397205',
      _token: csrfToken
    }).toString(),
    {
      headers: {
        ...config.defaultHeaders,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': pageUrl,
        'Origin': 'https://barb.ua',
        Cookie: cookieHeader
      }
    }
  );

  console.log('Status:', res.status);
  console.log('Response data:', JSON.stringify(res.data, null, 2));
}

testAjaxWithSession();
