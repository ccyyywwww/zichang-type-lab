import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function checkViewport({ browser, profile, url, width, reduced, screenshot, motionScreenshots, sourceMode = false, screenshotCategory, screenshotCode = false }) {
  const process = spawn(browser, ["--headless", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0", "--remote-debugging-address=127.0.0.1", `--user-data-dir=${profile}`, ...(reduced ? ["--force-prefers-reduced-motion"] : []), "about:blank"], { windowsHide: true, stdio: "ignore" });
  let socket;
  try {
    let endpoint;
    for (let attempt = 0; attempt < 200; attempt++) {
      try { const lines = readFileSync(path.join(profile, "DevToolsActivePort"), "utf8").trim().split(/\r?\n/); endpoint = `ws://127.0.0.1:${lines[0]}${lines[1]}`; break; }
      catch { await pause(50); }
    }
    assert.ok(endpoint, "Chromium did not start its local debugging endpoint");
    socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
    const pending = new Map(); let next = 0;
    socket.addEventListener("message", event => { const response = JSON.parse(event.data); const handler = pending.get(response.id); if (!handler) return; pending.delete(response.id); clearTimeout(handler.timer); if (response.error) handler.reject(new Error(JSON.stringify(response.error))); else handler.resolve(response.result); });
    const call = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const id = ++next; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timed out: ${method}`)); }, 10000); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
    const { targetId } = await call("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true });
    await call("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 }, sessionId);
    await call("Page.navigate", { url }, sessionId);
    let result;
    for (let attempt = 0; attempt < 200; attempt++) {
      const response = await call("Runtime.evaluate", { expression: 'document.querySelector("#result")?.textContent', returnByValue: true }, sessionId);
      const value = response.result.value;
      if (value && value !== "pending") { result = JSON.parse(value); break; }
      await pause(50);
    }
    assert.ok(result, "Browser fixture did not finish");
    if (motionScreenshots && result.passed) {
      for (const [scene, destination] of Object.entries(motionScreenshots)) {
        await call("Runtime.evaluate", { expression: scene === "hero" ? 'scrollTo({top:0,behavior:"instant"})' : 'document.querySelector(".effect-grid").scrollIntoView({block:"start",behavior:"instant"})' }, sessionId);
        await pause(1500);
        const capture = await call("Page.captureScreenshot", { format: "png" }, sessionId);
        writeFileSync(destination, Buffer.from(capture.data, "base64"));
      }
    }
    if (screenshot && result.passed) {
      if (screenshotCategory) await call("Runtime.evaluate", { expression: `Array.from(document.querySelectorAll('[aria-label="组件分类"] button')).find(element => element.textContent.startsWith(${JSON.stringify(screenshotCategory)})).click()` }, sessionId);
      await pause(50);
      await call("Runtime.evaluate", { expression: 'document.querySelector(".ui-configure").click()' }, sessionId);
      await pause(400);
      await call("Runtime.evaluate", { expression: 'Promise.all(document.querySelector(".detail-drawer").getAnimations().map(animation => animation.finished.catch(() => {})))', awaitPromise: true }, sessionId);
      if (sourceMode) await call("Runtime.evaluate", { expression: 'Array.from(document.querySelectorAll(".code-tabs button")).find(element => element.textContent === "完整源码").click()' }, sessionId);
      const geometry = await call("Runtime.evaluate", { expression: '({ drawer: document.querySelector(".detail-drawer").getBoundingClientRect().right, viewport: innerWidth, content: document.querySelector(".detail-drawer").scrollWidth, available: document.querySelector(".detail-drawer").clientWidth })', returnByValue: true }, sessionId);
      assert.ok(geometry.result.value.drawer <= width + 1, `Drawer extends past the viewport: ${JSON.stringify(geometry.result.value)}`);
      assert.ok(geometry.result.value.content <= geometry.result.value.available + 1, "Drawer content overflows horizontally");
      if (screenshotCode) { await call("Runtime.evaluate", { expression: 'document.querySelector(".generated-code").scrollIntoView({block:"center",behavior:"instant"})' }, sessionId); await pause(50); }
      const capture = await call("Page.captureScreenshot", { format: "png" }, sessionId);
      writeFileSync(screenshot, Buffer.from(capture.data, "base64"));
    }
    await call("Browser.close");
    return result;
  } finally { socket?.close(); process.kill(); }
}
