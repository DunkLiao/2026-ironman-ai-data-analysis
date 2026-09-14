import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  DEFAULT_CONFIG,
  applyTemplate,
  generateHtmlPage,
  generateIndexPage,
  loadConfig
} from "../convert.js";

test("loadConfig merges partial config with defaults", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "qa-config-"));
  const configPath = path.join(tempDir, "qa.config.json");
  fs.writeFileSync(configPath, JSON.stringify({
    siteTitle: "自訂 QA 主標題",
    unitHeadingTemplate: "{unit} 自訂問答卡"
  }), "utf-8");

  const config = loadConfig(configPath);

  assert.equal(config.siteTitle, "自訂 QA 主標題");
  assert.equal(config.unitHeadingTemplate, "{unit} 自訂問答卡");
  assert.equal(config.indexSubtitle, DEFAULT_CONFIG.indexSubtitle);
});

test("loadConfig returns defaults when config file does not exist", () => {
  const config = loadConfig(path.join(os.tmpdir(), "missing-qa-config.json"));

  assert.deepEqual(config, DEFAULT_CONFIG);
});

test("applyTemplate replaces known variables and leaves unknown variables intact", () => {
  const actual = applyTemplate("{unit} 共有 {count} 題，{unknown}", {
    unit: "Day1",
    count: 55
  });

  assert.equal(actual, "Day1 共有 55 題，{unknown}");
});

test("generated unit page defaults to light theme and supports manual dark mode", () => {
  const html = generateHtmlPage("Day1", [{ id: 1, question: "問題", answer: "答案" }], DEFAULT_CONFIG);

  assert.match(html, /data-theme="light"/);
  assert.match(html, /localStorage\.getItem\(THEME_STORAGE_KEY\) \|\| "light"/);
  assert.match(html, /function toggleTheme\(\)/);
  assert.match(html, /<button[^>]+id="themeToggleBtn"[^>]*>/);
  assert.match(html, /html\[data-theme="dark"\]/);
  assert.doesNotMatch(html, /prefers-color-scheme/);
});

test("generated index page defaults to light theme and supports manual dark mode", () => {
  const html = generateIndexPage([{ baseName: "Day1", fileName: "Day1.html", count: 1 }], DEFAULT_CONFIG);

  assert.match(html, /data-theme="light"/);
  assert.match(html, /localStorage\.getItem\(THEME_STORAGE_KEY\) \|\| "light"/);
  assert.match(html, /function toggleTheme\(\)/);
  assert.match(html, /<button[^>]+id="themeToggleBtn"[^>]*>/);
  assert.match(html, /html\[data-theme="dark"\]/);
  assert.doesNotMatch(html, /prefers-color-scheme/);
});
