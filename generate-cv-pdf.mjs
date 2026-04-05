import puppeteer from 'puppeteer';

const OUTPUT_PATH = '/Users/michaelscimeca/Desktop/Michael-Scimeca-CV.pdf';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Michael Scimeca — CV</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 10pt;
    color: #1a1a1a;
    background: #fff;
    line-height: 1.5;
    padding: 0;
  }

  .page {
    max-width: 780px;
    margin: 0 auto;
    padding: 48px 52px;
  }

  /* ── Header ── */
  .header {
    border-bottom: 2.5px solid #0158ff;
    padding-bottom: 20px;
    margin-bottom: 28px;
  }

  .header h1 {
    font-size: 30pt;
    font-weight: 800;
    letter-spacing: -1px;
    color: #0a0a0a;
    line-height: 1;
    margin-bottom: 4px;
  }

  .header h1 span {
    color: #0158ff;
  }

  .header .title {
    font-size: 11pt;
    font-weight: 600;
    color: #444;
    margin-bottom: 12px;
  }

  .contact-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 20px;
    font-size: 8.5pt;
    color: #555;
  }

  .contact-row a {
    color: #0158ff;
    text-decoration: none;
  }

  /* ── Sections ── */
  .section {
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #0158ff;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 5px;
    margin-bottom: 14px;
  }

  /* ── Summary ── */
  .summary p {
    font-size: 9.5pt;
    color: #333;
    line-height: 1.65;
  }

  /* ── Experience ── */
  .job {
    margin-bottom: 16px;
  }

  .job:last-child {
    margin-bottom: 0;
  }

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 2px;
  }

  .job-company {
    font-size: 10.5pt;
    font-weight: 700;
    color: #0a0a0a;
  }

  .job-date {
    font-size: 8pt;
    color: #777;
    white-space: nowrap;
    margin-left: 12px;
  }

  .job-role {
    font-size: 9pt;
    font-weight: 600;
    color: #0158ff;
    margin-bottom: 6px;
  }

  .job-parent {
    font-size: 8pt;
    color: #888;
    font-style: italic;
    margin-bottom: 4px;
  }

  .job ul {
    list-style: none;
    padding: 0;
  }

  .job ul li {
    font-size: 9pt;
    color: #333;
    padding-left: 12px;
    position: relative;
    margin-bottom: 3px;
    line-height: 1.5;
  }

  .job ul li::before {
    content: '–';
    position: absolute;
    left: 0;
    color: #aaa;
  }

  /* ── Skills ── */
  .skills-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 32px;
  }

  .skill-category h4 {
    font-size: 8pt;
    font-weight: 700;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 5px;
  }

  .skill-category p {
    font-size: 9pt;
    color: #333;
    line-height: 1.6;
  }

  /* ── Two-col bottom ── */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 36px;
  }

  /* ── Education ── */
  .edu-item {
    margin-bottom: 10px;
  }

  .edu-item h4 {
    font-size: 10pt;
    font-weight: 700;
    color: #0a0a0a;
  }

  .edu-item .degree {
    font-size: 9pt;
    color: #333;
  }

  .edu-item .date {
    font-size: 8pt;
    color: #888;
    margin-bottom: 2px;
  }

  /* ── Awards ── */
  .award-item {
    margin-bottom: 8px;
  }

  .award-item h4 {
    font-size: 9.5pt;
    font-weight: 700;
    color: #0a0a0a;
  }

  .award-item p {
    font-size: 8.5pt;
    color: #555;
  }

  /* ── Clients ── */
  .clients p {
    font-size: 9pt;
    color: #333;
    line-height: 1.8;
  }

  /* ── Footer ── */
  .footer {
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid #e5e5e5;
    text-align: center;
    font-size: 7.5pt;
    color: #aaa;
  }

  /* Page break hints */
  @page { margin: 18mm 14mm; }
  .page-break { page-break-before: always; }
  .no-break { page-break-inside: avoid; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <h1>Michael <span>Scimeca</span></h1>
    <p class="title">AI-Powered Web Developer &nbsp;·&nbsp; Next.js · WordPress · n8n Automation</p>
    <div class="contact-row">
      <span>Greater Chicago Area</span>
      <a href="mailto:mikeyscimeca.dev@gmail.com">mikeyscimeca.dev@gmail.com</a>
      <a href="https://michaelscimeca.com">michaelscimeca.com</a>
      <a href="https://www.linkedin.com/in/mikey-scimeca/">linkedin.com/in/mikey-scimeca</a>

    </div>
  </div>

  <!-- SUMMARY -->
  <div class="section summary no-break">
    <div class="section-title">Summary</div>
    <p>Chicago-based Digital Designer &amp; Full-Stack Developer with 15+ years building AI-powered, conversion-driven digital experiences for premium brands. I blend design, code, and automation to craft intelligent, high-impact products — having shipped production work for Snickers, Twix, NetherRealm Studios (Mortal Kombat), Patreon, and Flipboard. Expert in React, Next.js, PHP, WordPress, and workflow automation using n8n.</p>
  </div>

  <!-- EXPERIENCE -->
  <div class="section">
    <div class="section-title">Experience</div>

    <div class="job no-break">
      <div class="job-header">
        <span class="job-company">Freelance</span>
        <span class="job-date">Aug 2023 – Present</span>
      </div>
      <div class="job-role">Web Developer &amp; Graphic Designer</div>
      <ul>
        <li>Building AI-powered web experiences and automation systems for premium clients.</li>
        <li>Developing custom Next.js, React, and WordPress solutions with deep GSAP animation work.</li>
        <li>Implementing n8n workflow automation, custom chatbots, and AI integrations that save teams hours every week.</li>
        <li>Delivering end-to-end digital products — from UX strategy to production deployment.</li>
      </ul>
    </div>

    <div class="job no-break">
      <div class="job-header">
        <span class="job-company">Good Giant</span>
        <span class="job-date">Mar 2021 – Apr 2023</span>
      </div>
      <div class="job-parent">Formerly Red Square Agency</div>
      <div class="job-role">Senior Stack Web Developer</div>
      <ul>
        <li>Led web solutions through a major agency merger, maintaining quality and velocity across a large client portfolio.</li>
        <li>Expert in the WordPress ecosystem — ACF, Custom Post Types, Yoast — building scalable, maintainable CMS architectures.</li>
        <li>Built high-performance digital products for Ripco Real Estate, Kovitz Investment Group, and Outleadership.</li>
        <li>Championed animation-forward development using GSAP, Lottie, and Lenis scroll.</li>
      </ul>
    </div>

    <div class="job no-break">
      <div class="job-header">
        <span class="job-company">Good Giant</span>
        <span class="job-date">Apr 2015 – Jul 2021</span>
      </div>
      <div class="job-parent">Formerly Red Square Agency</div>
      <div class="job-role">Junior Developer / Web Designer</div>
      <ul>
        <li>Drove creative and technical implementation across web and design projects for 6+ years.</li>
        <li>Delivered campaign work for Snickers (1 Million campaign), NFT Twix (Mars Inc.), Patreon, and Flipboard.</li>
        <li>Worked across the full stack — HTML/CSS, JavaScript, PHP, WordPress — building responsive, performant interfaces.</li>
        <li>Won W3 Gold &amp; Silver Awards for the Ripco Real Estate project.</li>
      </ul>
    </div>

    <div class="job no-break">
      <div class="job-header">
        <span class="job-company">We Can't Stop Thinking</span>
        <span class="job-date">Apr 2013 – Jun 2015</span>
      </div>
      <div class="job-role">Frontend Developer / Web Designer</div>
      <ul>
        <li>Built responsive web applications in a fast-moving creative agency environment.</li>
        <li>Collaborated on brand work for Optimo and Optimum Nutrition.</li>
        <li>Contributed design assets, UX flows, and front-end code across multiple simultaneous projects.</li>
      </ul>
    </div>

    <div class="job no-break">
      <div class="job-header">
        <span class="job-company">Freelance</span>
        <span class="job-date">Apr 2009 – Mar 2014</span>
      </div>
      <div class="job-role">Graphic Designer / Web Developer</div>
      <ul>
        <li>Delivered websites, brand identities, and graphic design for diverse clients over 5 years.</li>
        <li>Built an early foundation across HTML, CSS, JavaScript, PHP, and Adobe Creative Suite.</li>
      </ul>
    </div>
  </div>

  <!-- SKILLS -->
  <div class="section no-break">
    <div class="section-title">Skills &amp; Technologies</div>
    <div class="skills-grid">
      <div class="skill-category">
        <h4>Frontend Development</h4>
        <p>React, Next.js, TypeScript, JavaScript (ES6+), GSAP / ScrollTrigger, CSS / SCSS, Tailwind CSS, HTML5</p>
      </div>
      <div class="skill-category">
        <h4>Backend &amp; CMS</h4>
        <p>Node.js, PHP, WordPress (ACF, CPT, Yoast), Sanity CMS, Prismic, REST APIs, AJAX, SPA Architecture</p>
      </div>
      <div class="skill-category">
        <h4>AI &amp; Automation</h4>
        <p>n8n Workflows, Python, AI Chatbots, Robotic Process Automation, Claude / Anthropic API, Pollinations AI</p>
      </div>
      <div class="skill-category">
        <h4>Design &amp; Tools</h4>
        <p>Figma, Adobe Photoshop, Illustrator, GitHub, Docker, Vercel, Netlify, WP Engine, Pantheon, Browserstack, Google Analytics, SEO</p>
      </div>
    </div>
  </div>

  <!-- EDUCATION + AWARDS -->
  <div class="two-col">
    <div class="section no-break">
      <div class="section-title">Education</div>

      <div class="edu-item">
        <div class="date">Jul 2025 – Oct 2025</div>
        <h4>TripleTen</h4>
        <div class="degree">Certificate in AI Automation</div>
      </div>

      <div class="edu-item" style="margin-top:10px">
        <div class="date">2009 – Present</div>
        <h4>Self-Taught</h4>
        <div class="degree">15+ years of continuous learning, shipping real production work across the full web stack.</div>
      </div>
    </div>

    <div class="section no-break">
      <div class="section-title">Awards &amp; Certifications</div>

      <div class="award-item">
        <h4>W3 Award — Gold</h4>
        <p>Ripco Real Estate · W3 Awards</p>
      </div>
      <div class="award-item">
        <h4>W3 Award — Silver</h4>
        <p>Ripco Real Estate · W3 Awards</p>
      </div>
      <div class="award-item">
        <h4>AI Automation Certified</h4>
        <p>TripleTen</p>
      </div>
      <div class="award-item">
        <h4>Google Analytics Certified</h4>
        <p>Google</p>
      </div>
    </div>
  </div>

  <!-- NOTABLE CLIENTS -->
  <div class="section no-break" style="margin-top:20px">
    <div class="section-title">Notable Clients &amp; Projects</div>
    <div class="clients">
      <p>Snickers / Mars Inc. &nbsp;·&nbsp; Twix / Mars Inc. &nbsp;·&nbsp; Patreon &nbsp;·&nbsp; Flipboard &nbsp;·&nbsp; NetherRealm Studios (Mortal Kombat) &nbsp;·&nbsp; Outleadership &nbsp;·&nbsp; Kovitz Investment Group &nbsp;·&nbsp; Ripco Real Estate &nbsp;·&nbsp; Optimum Nutrition &nbsp;·&nbsp; NYC Pride &nbsp;·&nbsp; SEIU &nbsp;·&nbsp; Longview Innovation &nbsp;·&nbsp; Optimo</p>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    michaelscimeca.com/cv &nbsp;·&nbsp; mikeyscimeca.dev@gmail.com &nbsp;·&nbsp; Greater Chicago Area
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

// Wait for Inter font to load
await new Promise(r => setTimeout(r, 1500));

console.log('Generating PDF…');
await page.pdf({
  path: OUTPUT_PATH,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
  displayHeaderFooter: false,
});

await browser.close();
console.log(`✅  PDF saved → ${OUTPUT_PATH}`);
