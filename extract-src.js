const fs = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');
const fse = require('fs-extra');

async function extractSourcesFromMap(mapFile, outDir) {
  const rawMap = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  const consumer = await new SourceMapConsumer(rawMap);

  const sources = rawMap.sources;
  const sourcesContent = rawMap.sourcesContent;

  if (!sources || !sourcesContent) {
    console.log(`[!] ${mapFile}: enthält keine eingebetteten Quelltexte.`);
    return;
  }

  sources.forEach((src, i) => {
    const content = sourcesContent[i];
    if (!content) return;

    const filePath = path.join(outDir, src.replace(/^webpack:\/\/|^file:\/\/\//, ''));
    fse.outputFileSync(filePath, content);
    console.log(`? Extrahiert: ${filePath}`);
  });

  consumer.destroy();
}

async function run() {
  const outDir = path.resolve('./extracted-src');
  const files = fs.readdirSync('.').filter(f => f.endsWith('.map'));

  for (const file of files) {
    console.log(`?? Verarbeite ${file} ...`);
    await extractSourcesFromMap(path.resolve(file), outDir);
  }

  console.log(`\n? Fertig. Extrahierte Dateien liegen unter: ${outDir}`);
}

run();
