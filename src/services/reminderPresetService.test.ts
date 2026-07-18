import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_REMINDER_PRESET,
  REMINDER_PRESETS,
  buildReminderSchedulePreview,
  daysForReminderPreset,
  detectReminderPreset,
  formatReminderChipLabel,
  parseReminderPreset,
} from "./reminderPresetService";

describe("reminderPresetService", () => {
  it("default preset is balanced", () => {
    assert.equal(DEFAULT_REMINDER_PRESET, "balanced");
    assert.deepEqual(REMINDER_PRESETS.balanced, {
      soft: 1,
      firm: 3,
      final: 7,
    });
  });

  it("daysForReminderPreset returns each named preset", () => {
    assert.deepEqual(daysForReminderPreset("early"), {
      soft: 3,
      firm: 3,
      final: 7,
    });
    assert.deepEqual(daysForReminderPreset("gentle"), {
      soft: 3,
      firm: 5,
      final: 10,
    });
    assert.deepEqual(daysForReminderPreset("assertive"), {
      soft: 1,
      firm: 1,
      final: 5,
    });
  });

  it("detectReminderPreset matches named presets and falls back to custom", () => {
    assert.equal(detectReminderPreset({ soft: 1, firm: 3, final: 7 }), "balanced");
    assert.equal(detectReminderPreset({ soft: 3, firm: 3, final: 7 }), "early");
    assert.equal(detectReminderPreset({ soft: 3, firm: 5, final: 10 }), "gentle");
    assert.equal(detectReminderPreset({ soft: 1, firm: 1, final: 5 }), "assertive");
    assert.equal(detectReminderPreset({ soft: 2, firm: 4, final: 8 }), "custom");
  });

  it("fine-tune snap-back when values realign with a preset", () => {
    assert.equal(detectReminderPreset({ soft: 1, firm: 3, final: 7 }), "balanced");
    assert.equal(
      parseReminderPreset("custom", { soft: 1, firm: 3, final: 7 }),
      "balanced",
    );
  });

  it("formatReminderChipLabel and preview are stable", () => {
    assert.equal(
      formatReminderChipLabel({ soft: 1, firm: 3, final: 7 }),
      "T−1 · +3 · +7",
    );
    const preview = buildReminderSchedulePreview(1, {
      soft: 1,
      firm: 3,
      final: 7,
    }, "en");
    assert.ok(preview.due.includes("1"));
    assert.ok(preview.soft);
    assert.ok(preview.firm);
    assert.ok(preview.final);
  });
});
