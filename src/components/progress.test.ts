import { describe, it, expect } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import DsProgress from "./DsProgress.vue";

describe("progress", () => {
  it.each([
    [125, 100],
    [-2, 0],
    [Number.NaN, 0],
    [50, 50],
  ])("bounds %s to %s", async (value, expected) => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(DsProgress, { value, label: "Budget used" }),
      }),
    );
    expect(html).toContain(`aria-valuenow="${expected}"`);
    expect(html).toContain('aria-label="Budget used"');
  });
});
