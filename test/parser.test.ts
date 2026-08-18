import { parseListingPage } from '../src/parsers/listing.parser';
import { parseProfilePage, categorizeSocialLinks } from '../src/parsers/profile.parser';

function runTests() {
  console.log('Running barb-crawler parser unit tests...\n');

  // Test 1: Social Links Categorization from URLs and Text
  console.log('1. Testing Social Links Categorization:');
  const testSocials = [
    'https://www.instagram.com/af.nails.kyiv/',
    'https://www.facebook.com/share/1Cq3RQgLcm/',
    'https://t.me/nails_kyiv',
    'https://tiktok.com/@pastel_beauty',
    'https://youtube.com/@fargosalon'
  ];
  const categorized = categorizeSocialLinks(testSocials, 'Запис через Instagram @nails_master або Telegram t.me/nails_direct');
  console.log('   Categorized socials:', categorized);
  if (
    categorized.instagram !== 'https://www.instagram.com/af.nails.kyiv/' ||
    categorized.telegram !== 'https://t.me/nails_kyiv' ||
    categorized.tiktok !== 'https://tiktok.com/@pastel_beauty'
  ) {
    throw new Error('Socials categorization failed');
  }
  console.log('   ✔ Social links parser passed\n');

  // Test 2: Profile Parser with Mock HTML
  console.log('2. Testing Profile Parser:');
  const mockProfileHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org/",
        "@type": "NailSalon",
        "name": "Ганна Фельчер",
        "url": "https://barb.ua/uk/master/afelcher",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "вулиця Анни Ахматової, 13",
          "addressLocality": "Київ"
        },
        "sameAs": ["https://www.instagram.com/af.nails.kyiv/", "https://www.facebook.com/afnails"],
        "image": "https://barb.ua/uploads/card_master.jpg"
      }
      </script>
    </head>
    <body>
      <h1 class="seller-title">Ганна Фельчер (Київ)</h1>
      <div id="procedures">
        <table class="table-procedures_price">
          <tr class="procedures_head"><th class="procedures_name">Манікюр</th></tr>
          <tr><td class="procedures_name">Класичний манікюр</td><td class="procedures_price">350 грн</td></tr>
          <tr><td class="procedures_name">Апаратний манікюр</td><td class="procedures_price">400 грн</td></tr>
        </table>
      </div>
    </body>
    </html>
  `;
  const record = parseProfilePage(mockProfileHtml, 'https://barb.ua/uk/master/afelcher');
  console.log('   Parsed record summary:');
  console.log('   - Name:', record.name);
  console.log('   - Type:', record.type);
  console.log('   - City/Address:', `${record.city}, ${record.address}`);
  console.log('   - Socials:', record.socials);
  console.log('   - Services count:', record.services.length);

  if (
    record.name !== 'Ганна Фельчер' ||
    record.services.length !== 2 ||
    record.socials.instagram !== 'https://www.instagram.com/af.nails.kyiv/'
  ) {
    throw new Error('Profile parser verification failed');
  }
  console.log('   ✔ Profile parser passed\n');

  console.log('All parser unit tests passed successfully! 🎉');
}

runTests();
