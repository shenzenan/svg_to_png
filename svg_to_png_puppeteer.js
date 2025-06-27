#!/usr/bin/env node
/**
 * SVG转PNG工具 (使用Puppeteer)
 * 
 * 这个脚本使用Puppeteer将SVG文件渲染为PNG图像，
 * 并确保文本正确显示。
 * 
 * 使用方法: node svg_to_png_puppeteer.js <输入SVG文件> <输出PNG文件> [宽度]
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  // Read the SVG file
  const svgPath = path.resolve(__dirname, 'process.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Extract viewBox dimensions
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    console.error('Could not find viewBox in SVG');
    process.exit(1);
  }
  
  const [minX, minY, width, height] = viewBoxMatch[1].split(' ').map(Number);
  console.log(`SVG dimensions: ${width}x${height}`);
  
  // Launch the browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Create HTML content with the SVG
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; background: white; }
        svg { display: block; }
      </style>
    </head>
    <body>
      ${svgContent}
    </body>
    </html>
  `;
  
  // Set the viewport to match SVG dimensions
  await page.setViewport({
    width: Math.ceil(width),
    height: Math.ceil(height),
    deviceScaleFactor: 1
  });
  
  // Set the content and wait for it to load
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  // Take a screenshot
  const outputPath = path.resolve(__dirname, 'process.png');
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    omitBackground: false
  });
  
  console.log(`PNG saved to ${outputPath}`);
  
  await browser.close();
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 