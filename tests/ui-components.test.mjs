import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { root, loadSource } from "./helpers/load-ts.mjs";
const component = (folder, name) => { const filename = path.join(root, `components/ui/${folder}/${name}.tsx`); return loadSource(readFileSync(filename, "utf8"), filename)[name]; };
const Button = component("button", "Button");
const Switch = component("switch", "Switch");
const Progress = component("progress", "Progress");
test("buttons are safe in forms and loading prevents duplicate actions", () => {
  const html = renderToStaticMarkup(createElement(Button, { loading: true, variant: "shiny" }, "保存"));
  assert.match(html, /type="button"/); assert.match(html, /disabled=""/); assert.match(html, /aria-busy="true"/); assert.match(html, /zc-button--shiny/);
  assert.match(renderToStaticMarkup(createElement(Button, { type: "submit" }, "提交")), /type="submit"/);
});
test("switch retains native input, form value, label and checked state", () => {
  const html = renderToStaticMarkup(createElement(Switch, { defaultChecked: true, name: "notifications", "aria-label": "通知" }));
  for (const token of ['type="checkbox"', 'role="switch"', 'checked=""', 'name="notifications"', 'aria-label="通知"']) assert.ok(html.includes(token));
});
test("progress normalizes invalid and out-of-range values accessibly", () => {
  assert.match(renderToStaticMarkup(createElement(Progress, { value: 150, max: 100 })), /aria-valuenow="100"/);
  assert.match(renderToStaticMarkup(createElement(Progress, { value: -12 })), /aria-valuenow="0"/);
  const html = renderToStaticMarkup(createElement(Progress, { value: NaN, max: 0, showValue: false, "aria-label": "下载" }));
  assert.match(html, /aria-valuemax="100"/); assert.match(html, /aria-valuenow="0"/); assert.doesNotMatch(html, /zc-progress-value/);
});
