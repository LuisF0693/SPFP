import lighthouse from 'lighthouse';
import * as fs from 'fs';

const url = 'http://localhost:4173';
const opts = {
  logLevel: 'info',
  output: 'json',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
};

const runLighthouse = async () => {
  try {
    console.log(`🔍 Running Lighthouse audit on ${url}...`);
    const runnerResult = await lighthouse(url, opts);

    const report = runnerResult.lhr;

    console.log('\n📊 LIGHTHOUSE AUDIT RESULTS:');
    console.log('================================');
    console.log(`Performance:     ${report.categories.performance.score * 100}`);
    console.log(`Accessibility:   ${report.categories.accessibility.score * 100}`);
    console.log(`Best Practices:  ${report.categories['best-practices'].score * 100}`);
    console.log(`SEO:             ${report.categories.seo.score * 100}`);
    console.log('================================\n');

    fs.writeFileSync('lighthouse-report.json', JSON.stringify(report, null, 2));
    console.log('✅ Report saved to lighthouse-report.json');
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error);
    process.exit(1);
  }
};

runLighthouse();
