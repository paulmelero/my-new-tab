import { execFileSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import { platform } from "node:os";
import { resolve } from "node:path";

const CHROME_CANDIDATES = {
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ],
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ],
};

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidate = (CHROME_CANDIDATES[platform()] ?? []).find((path) => existsSync(path));
  if (!candidate) {
    throw new Error(
      "Could not find a Chrome/Chromium install. Set CHROME_PATH to the browser executable and re-run.",
    );
  }
  return candidate;
}

const distDir = resolve("dist");
if (!existsSync(distDir)) {
  throw new Error(`${distDir} does not exist — run "vp build" first.`);
}

const keyPath = process.env.CRX_KEY_PATH ? resolve(process.env.CRX_KEY_PATH) : undefined;
if (keyPath && !existsSync(keyPath)) {
  throw new Error(`CRX_KEY_PATH points to a missing file: ${keyPath}`);
}

const args = [`--pack-extension=${distDir}`];
if (keyPath) args.push(`--pack-extension-key=${keyPath}`);

execFileSync(findChrome(), args, { stdio: "inherit" });

const producedCrx = `${distDir}.crx`;
const producedPem = `${distDir}.pem`;
if (!existsSync(producedCrx)) {
  throw new Error("Chrome did not produce a .crx file — check the output above for errors.");
}

const outputCrx = resolve("my-new-tab.crx");
renameSync(producedCrx, outputCrx);
console.log(`Wrote ${outputCrx}`);

if (!keyPath && existsSync(producedPem)) {
  const outputPem = resolve("my-new-tab.pem");
  renameSync(producedPem, outputPem);
  console.log(`Generated a new signing key at ${outputPem}.`);
  console.log(
    "Keep it secret, back it up outside this repo, and reuse it via CRX_KEY_PATH on future builds to keep the same extension ID.",
  );
}
