const fs = require('fs');
const path = require('path');

async function validateMermaid() {
  const dompurify = (await import('dompurify')).default;
  dompurify.sanitize = (s) => s;
  dompurify.addHook = () => {};

  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
  });

  function findMd(dir) {
    const list = [];
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        list.push(...findMd(full));
      } else if (full.endsWith('.md')) {
        list.push(full);
      }
    }
    return list;
  }

  const files = findMd('content');
  let totalDiagrams = 0;
  let failedDiagrams = 0;
  const failures = [];

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const regex = /```mermaid\r?\n([\s\S]*?)```/g;
    let match;
    let index = 0;

    while ((match = regex.exec(text)) !== null) {
      totalDiagrams++;
      index++;
      const chart = match[1].trim();
      try {
        await mermaid.mermaidAPI.getDiagramFromText(chart);
      } catch (err) {
        failedDiagrams++;
        failures.push({
          file,
          index,
          error: err.message || String(err),
          fullChart: chart
        });
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`Total Mermaid Diagrams: ${totalDiagrams}`);
  console.log(`Failed Diagrams: ${failedDiagrams}`);
  console.log(`========================================\n`);

  if (failures.length > 0) {
    for (const f of failures) {
      console.log(`[ERROR in ${f.file} (diagram #${f.index})]:`);
      console.log(f.error);
      console.log(`--- Full Chart ---`);
      console.log(f.fullChart);
      console.log(`----------------------------------------\n`);
    }
  }
}

validateMermaid().catch(console.error);
