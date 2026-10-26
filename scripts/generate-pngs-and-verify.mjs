import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Ayush\\.gemini\\antigravity\\brain\\01deb985-56db-4f0b-aff3-e35ff0d59027';

// 1. Generate PNG exports at 24, 32, 48, 96, 256, 512
const sizes = [24, 32, 48, 96, 256, 512];

const svgMarkPath = path.resolve('public/assets/branding/orion9-mark.svg');
const svgLogoPath = path.resolve('public/assets/branding/orion9-logo.svg');
const svgLogoDarkPath = path.resolve('public/assets/branding/orion9-logo-dark.svg');

// Render an HTML containing the SVG at exact square / target dimensions with transparent body
for (const size of sizes) {
  const htmlMark = `<!DOCTYPE html><html><body style="margin:0; padding:0; background:transparent; display:flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; overflow:hidden;"><img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width:100%; height:100%; object-fit:contain;" /></body></html>`;
  const tempHtml = `temp_${size}.html`;
  const outPng = `public/assets/branding/orion9-mark-${size}.png`;
  fs.writeFileSync(tempHtml, htmlMark);
  try {
    execSync(`"${chromePath}" --headless --default-background-color=00000000 --disable-gpu --screenshot="${path.resolve(outPng)}" --window-size=${size},${size} "${path.resolve(tempHtml)}"`);
    console.log(`Generated ${outPng}`);
  } catch (e) {
    console.error(`Error generating ${size}px:`, e.message);
  }
  if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
}

// Full logo at 512px
const htmlLogo = `<!DOCTYPE html><html><body style="margin:0; padding:0; background:transparent; display:flex; align-items:center; justify-content:center; width:512px; height:435px; overflow:hidden;"><img src="file://${svgLogoPath.replace(/\\/g, '/')}" style="width:100%; height:100%; object-fit:contain;" /></body></html>`;
fs.writeFileSync('temp_logo.html', htmlLogo);
execSync(`"${chromePath}" --headless --default-background-color=00000000 --disable-gpu --screenshot="${path.resolve('public/assets/branding/orion9-logo-512.png')}" --window-size=512,435 "${path.resolve('temp_logo.html')}"`);
if (fs.existsSync('temp_logo.html')) fs.unlinkSync('temp_logo.html');
console.log('Generated public/assets/branding/orion9-logo-512.png');

// 2. Build Quality Verification Grid HTML
const verificationHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Orion-9 Minimal Brand Mark Refinement Verification</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070B14; color: #E2E8F0; padding: 40px; }
    h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; color: #FFFFFF; }
    p.sub { font-size: 14px; color: #94A3B8; margin-bottom: 32px; }
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #38BDF8; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 36px; }
    .card { border-radius: 16px; padding: 28px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
    .card.light { background: #FFFFFF; color: #0F172A; }
    .card.dark { background: #0B1120; color: #FFFFFF; }
    .card-label { position: absolute; top: 12px; left: 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.6; }
    
    .scales-row { display: flex; align-items: flex-end; justify-content: space-around; width: 100%; gap: 16px; margin-top: 12px; padding: 20px 0; }
    .scale-box { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .scale-label { font-size: 11px; font-mono; opacity: 0.7; }

    .logo-hero { width: 340px; height: auto; }
  </style>
</head>
<body>
  <h1>ORION-9 — MINIMAL BRAND MARK REFINEMENT</h1>
  <p class="sub">Verification Matrix · Scalability at 24px–256px, Contrast on Light & Dark Canvas, Solid Vector Silhouette</p>

  <div class="section-title">1. Full Brand Lockup (Symbol + Modern Geometric Wordmark)</div>
  <div class="grid-2">
    <div class="card dark">
      <span class="card-label">Dark Enterprise Canvas (#0B1120)</span>
      <img src="file://${svgLogoDarkPath.replace(/\\/g, '/')}" class="logo-hero" alt="Orion-9 Dark Logo" />
    </div>
    <div class="card light">
      <span class="card-label">Light Enterprise Canvas (#FFFFFF)</span>
      <img src="file://${svgLogoPath.replace(/\\/g, '/')}" class="logo-hero" alt="Orion-9 Light Logo" />
    </div>
  </div>

  <div class="section-title">2. Symbol Scalability & Legibility Verification (24px, 32px, 48px, 96px, 256px)</div>
  <div class="grid-2">
    <div class="card dark">
      <span class="card-label">Dark Canvas Symbol Scalability</span>
      <div class="scales-row">
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 24px; height: 16px;" />
          <span class="scale-label">24px</span>
        </div>
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 32px; height: 21px;" />
          <span class="scale-label">32px</span>
        </div>
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 48px; height: 31px;" />
          <span class="scale-label">48px</span>
        </div>
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 96px; height: 62px;" />
          <span class="scale-label">96px</span>
        </div>
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 180px; height: 117px;" />
          <span class="scale-label">180px</span>
        </div>
      </div>
    </div>
    <div class="card light">
      <span class="card-label">Light Canvas Symbol Scalability</span>
      <div class="scales-row">
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 24px; height: 16px;" />
          <span class="scale-label">24px</span>
        </div>
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 32px; height: 21px;" />
          <span class="scale-label">32px</span>
        </div>
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 48px; height: 31px;" />
          <span class="scale-label">48px</span>
        </div>
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 96px; height: 62px;" />
          <span class="scale-label">96px</span>
        </div>
        <div class="scale-box">
          <img src="file://${svgMarkPath.replace(/\\/g, '/')}" style="width: 180px; height: 117px;" />
          <span class="scale-label">180px</span>
        </div>
      </div>
    </div>
  </div>

  <div class="section-title">3. Monochrome Solid Silhouette (1-Color Dark & 1-Color Light with Knockout)</div>
  <div class="grid-2">
    <div class="card dark">
      <span class="card-label">White Monochrome on Dark</span>
      <div style="color: #FFFFFF; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <img src="file://${path.resolve('public/assets/branding/orion9-logo-mono.svg').replace(/\\/g, '/')}" style="width: 280px; filter: invert(1);" />
      </div>
    </div>
    <div class="card light">
      <span class="card-label">Dark Navy Monochrome on Light</span>
      <div style="color: #0F172A; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <img src="file://${path.resolve('public/assets/branding/orion9-logo-mono.svg').replace(/\\/g, '/')}" style="width: 280px;" />
      </div>
    </div>
  </div>
</body>
</html>`;

const previewHtmlPath = path.resolve('temp_verification_preview.html');
fs.writeFileSync(previewHtmlPath, verificationHtml, 'utf8');

const verificationScreenshot = path.join(artifactDir, 'orion9-branding-refinement-verification.png');
execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${verificationScreenshot}" --window-size=1200,1050 "${previewHtmlPath}"`);
if (fs.existsSync(previewHtmlPath)) fs.unlinkSync(previewHtmlPath);

console.log(`Verification screenshot written to: ${verificationScreenshot}`);
