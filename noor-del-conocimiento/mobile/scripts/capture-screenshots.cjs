const puppeteer = require("puppeteer");
const { join } = require("path");
const { execSync, spawn } = require("child_process");

const PORT = 18181;
const BASE = `http://localhost:${PORT}`;
const OUT = join(process.cwd(), "screenshots");

const VIEWPORT = { width: 390, height: 844 }; // iPhone 14 size ≈ typical phone

const PAGES = [
  { path: "/welcome", name: "01-welcome" },
  { path: "/home", name: "02-home" },
  { path: "/play?mode=musafir&category=mix&difficulty=easy&language=es", name: "03-play-question" },
  { path: "/game-over?score=72&correct=7&total=10&newRecord=1&language=es&category=mix&difficulty=easy", name: "04-game-over-record" },
  { path: "/stats", name: "05-stats" },
  { path: "/rules", name: "06-rules" },
  { path: "/settings", name: "07-settings" },
  { path: "/learn?category=mix", name: "08-learn" },
];

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Server did not start in time");
}

async function main() {
  const fs = require("fs");
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  // Start expo server
  console.log("Starting Expo web server...");
  const server = spawn("npx", ["expo", "start", "--web", "--port", String(PORT)], {
    cwd: process.cwd(),
    stdio: "pipe",
    env: { ...process.env, PORT: String(PORT) },
  });

  let serverOutput = "";
  server.stdout.on("data", (d) => { serverOutput += d.toString(); });
  server.stderr.on("data", (d) => { serverOutput += d.toString(); });

  try {
    await waitForServer(`http://localhost:${PORT}`, 60000);
    console.log("Server ready! Taking screenshots...\n");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    // Set language to Spanish
    await page.setExtraHTTPHeaders({ "Accept-Language": "es" });

    for (const { path, name } of PAGES) {
      try {
        const url = BASE + path;
        console.log(`  → ${name} (${url})`);
        await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
        // Wait extra for animations to settle
        await new Promise((r) => setTimeout(r, 2000));
        await page.screenshot({
          path: join(OUT, `${name}.png`),
          fullPage: false,
        });
        console.log(`    ✓ ${name}.png`);
      } catch (err) {
        console.error(`    ✗ ${name}: ${err.message}`);
      }
    }

    await browser.close();
    console.log("\n✅ Screenshots saved in screenshots/");
  } finally {
    server.kill("SIGTERM");
    // Also kill any expo/metro child processes
    try { execSync("pkill -f 'expo start' 2>/dev/null || true"); } catch {}
    try { execSync("pkill -f 'metro' 2>/dev/null || true"); } catch {}
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
