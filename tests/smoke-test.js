const { chromium } = require('playwright');
const { execFileSync, spawn } = require('node:child_process');
const http = require('node:http');

const files = ['virtual-ps5-base.js','virtual-ps5.js','multiplayer.js','controls-step1.js'];
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });

const server = spawn(process.platform === 'win32' ? 'python' : 'python3', ['-m','http.server','4173','--bind','127.0.0.1'], { stdio:'ignore' });
const wait = ms => new Promise(r => setTimeout(r, ms));
(async()=>{
  let browser;
  try {
    await wait(1000);
    browser = await chromium.launch({ headless:true });
    const page = await browser.newPage({ viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true });
    const errors=[];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
    await page.goto('http://127.0.0.1:4173/index.html', { waitUntil:'domcontentloaded', timeout:15000 });
    await page.waitForTimeout(2500);

    const title = await page.title();
    if (title !== 'OBITREND FOOTBALL WORLD 27') throw new Error('Unexpected page title: '+title);
    if (!(await page.locator('#menu').count())) throw new Error('Menu missing');
    if (!(await page.locator('#obiMPWorldButton').count())) throw new Error('Multiplayer button missing');
    await page.locator('#obiMPWorldButton').click();
    if (!(await page.locator('#obiMP.show').count())) throw new Error('Multiplayer lobby did not open');
    if (!(await page.locator('#obiMPCreateBtn').count())) throw new Error('Create Match button missing');
    if (!(await page.locator('#obiMPJoinBtn').count())) throw new Error('Join Match button missing');
    await page.locator('#obiMPClose').click();
    if (await page.locator('#obiMP.show').count()) throw new Error('Multiplayer lobby did not close');

    if (errors.length) throw new Error('Browser errors: '+errors.join(' | '));
    console.log('PUBLISHING SMOKE TEST PASS');
  } catch (e) {
    console.error('PUBLISHING SMOKE TEST FAIL');
    console.error(e.stack || e);
    process.exitCode=1;
  } finally {
    if(browser) await browser.close();
    server.kill();
  }
})();
