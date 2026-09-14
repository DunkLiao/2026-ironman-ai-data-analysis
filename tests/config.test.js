import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  DEFAULT_CONFIG,
  applyTemplate,
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
