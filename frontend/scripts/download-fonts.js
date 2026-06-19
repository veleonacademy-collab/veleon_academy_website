const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '../public/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Lora (400, 700 + italic) & Plus Jakarta Sans (400, 500, 600, 700, 800)
const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

function fetchCss(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': userAgent
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('Fetching Google Fonts stylesheet...');
    const css = await fetchCss(googleFontsUrl);
    
    // Regular expression to parse each @font-face block (specifically for latin subset)
    // We parse individual blocks to map font-family, style, weight, and the URL.
    const fontFaceBlocks = css.split('}');
    const localCssRules = [];

    console.log('Downloading fonts...');
    for (const block of fontFaceBlocks) {
      if (!block.trim()) continue;
      
      // We only care about the latin subset to minimize font payload sizes (standard optimization)
      if (!block.includes('/* latin */')) {
        continue;
      }

      const familyMatch = block.match(/font-family:\s*['"]?([^'"]+)['"]?/);
      const styleMatch = block.match(/font-style:\s*(\w+)/);
      const weightMatch = block.match(/font-weight:\s*(\d+)/);
      const urlMatch = block.match(/src:\s*url\(([^)]+)\)/);

      if (familyMatch && styleMatch && weightMatch && urlMatch) {
        const family = familyMatch[1];
        const style = styleMatch[1];
        const weight = weightMatch[1];
        const url = urlMatch[1];

        const sanitizedFamily = family.replace(/\s+/g, '-').toLowerCase();
        const filename = `${sanitizedFamily}-${style}-${weight}.woff2`;
        const destPath = path.join(fontsDir, filename);

        console.log(`Downloading ${family} (${style}, ${weight}) -> ${filename}...`);
        await downloadFile(url, destPath);

        // Generate @font-face rule
        const rule = `
@font-face {
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url('/fonts/${filename}') format('woff2');
}`;
        localCssRules.push(rule.trim());
      }
    }

    const cssFilePath = path.join(__dirname, '../src/local-fonts.css');
    fs.writeFileSync(cssFilePath, localCssRules.join('\n\n') + '\n');
    console.log(`Successfully downloaded fonts and generated CSS config in ${cssFilePath}`);
  } catch (error) {
    console.error('Error downloading fonts:', error);
  }
}

main();
