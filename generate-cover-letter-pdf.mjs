import puppeteer from 'puppeteer';

const OUTPUT_PATH = '/Users/michaelscimeca/Desktop/Michael-Scimeca-Cover-Letter.pdf';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 10.5pt;
    color: #1a1a1a;
    background: #fff;
    line-height: 1.7;
  }

  .page {
    max-width: 700px;
    margin: 0 auto;
    padding: 56px 52px;
  }

  /* Header */
  .sender {
    margin-bottom: 36px;
    border-bottom: 2px solid #0158ff;
    padding-bottom: 18px;
  }

  .sender h1 {
    font-size: 20pt;
    font-weight: 700;
    color: #0a0a0a;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }

  .sender h1 span { color: #0158ff; }

  .sender .contact {
    font-size: 8.5pt;
    color: #555;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    margin-top: 6px;
  }

  .sender .contact a {
    color: #0158ff;
    text-decoration: none;
  }

  /* Date & recipient */
  .meta {
    margin-bottom: 28px;
    font-size: 9.5pt;
    color: #444;
  }

  .meta .date {
    margin-bottom: 16px;
    color: #666;
  }

  .meta .recipient-name {
    font-weight: 600;
    color: #0a0a0a;
  }

  /* Body */
  .salutation {
    font-size: 10.5pt;
    font-weight: 600;
    color: #0a0a0a;
    margin-bottom: 18px;
  }

  p {
    font-size: 10.5pt;
    color: #2a2a2a;
    margin-bottom: 16px;
    line-height: 1.75;
  }

  /* Closing */
  .closing {
    margin-top: 28px;
    font-size: 10.5pt;
  }

  .closing .sign-off {
    margin-bottom: 32px;
    color: #2a2a2a;
  }

  .closing .name {
    font-size: 12pt;
    font-weight: 700;
    color: #0a0a0a;
  }

  @page { margin: 18mm 14mm; }
</style>
</head>
<body>
<div class="page">

  <!-- SENDER HEADER -->
  <div class="sender">
    <h1>Michael <span>Scimeca</span></h1>
    <div class="contact">
      <span>Greater Chicago Area</span>
      <a href="mailto:mikeyscimeca.dev@gmail.com">mikeyscimeca.dev@gmail.com</a>
      <a href="https://michaelscimeca.com">michaelscimeca.com</a>
      <a href="https://www.linkedin.com/in/mikey-scimeca/">linkedin.com/in/mikey-scimeca</a>
    </div>
  </div>

  <!-- DATE + RECIPIENT -->
  <div class="meta">
    <div class="date">March 7, 2026</div>
    <div>
      <div class="recipient-name">Hiring Team</div>
      <div>Eidra</div>
      <div>171 N Aberdeen St, Suite 400</div>
      <div>Chicago, IL 60607</div>
    </div>
  </div>

  <!-- SALUTATION -->
  <div class="salutation">Dear Eidra Hiring Team,</div>

  <!-- BODY -->
  <p>
    I'm excited to apply for the Web Developer – TypeScript (Next.js) role. As a Chicago-based developer with 15+ years of experience building production-grade web applications, I've spent the better part of the last decade working in exactly the stack you're describing — TypeScript, React, and Next.js — and I'm drawn to Eidra's reputation for cross-disciplinary innovation and the collaborative, Nordic-rooted culture you've built stateside.
  </p>

  <p>
    Throughout my career at Good Giant (formerly Red Square Agency) and in freelance engagements, I've shipped high-performance digital products for brands including Snickers, Patreon, Flipboard, and NetherRealm Studios. My work has consistently lived at the intersection of technical rigor and design thinking — building scalable component architectures, implementing CI/CD pipelines, and integrating complex APIs, all while keeping the end-user experience at the center. I'm a strong advocate for test-driven development and clean, maintainable code; on every project I push for patterns that make codebases easier to scale and hand off.
  </p>

  <p>
    What draws me specifically to Eidra is the scope: cross-functional teams, a real product group, and a role that asks you to think strategically, not just execute tickets. I'm comfortable navigating ambiguity and translating technical decisions for non-technical stakeholders — something I've done regularly as both a solo consultant and as a senior developer managing client relationships across a large agency portfolio. I am authorized to work in the United States and do not require sponsorship.
  </p>

  <p>
    I'd love the opportunity to bring this experience to your Chicago team. Thank you for your consideration, and I look forward to the conversation.
  </p>

  <!-- CLOSING -->
  <div class="closing">
    <div class="sign-off">Sincerely,</div>
    <div class="name">Michael Scimeca</div>
  </div>

</div>
</body>
</html>`;

const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1200));

console.log('Generating cover letter PDF…');
await page.pdf({
    path: OUTPUT_PATH,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: false,
});

await browser.close();
console.log(`✅  Saved → ${OUTPUT_PATH}`);
