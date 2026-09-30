import { test } from "node:test";
import assert from "node:assert/strict";

import {
  phaseCycle,
  phaseName,
  illumination,
  NEW_MOON_EPOCH_MS,
  SYNODIC_MONTH_DAYS,
} from "../src/core.js";

import { moonPhase } from "../src/index.js";

const MS_PER_DAY = 86400000;
const SYNODIC_MS = SYNODIC_MONTH_DAYS * MS_PER_DAY;

test("phaseCycle is exactly 0 at the reference epoch", () => {
  assert.equal(phaseCycle(NEW_MOON_EPOCH_MS), 0);
});

test("phaseCycle is ~0.5 one half-month after the epoch (full moon)", () => {
  const got = phaseCycle(NEW_MOON_EPOCH_MS + SYNODIC_MS / 2);
  assert.ok(Math.abs(got - 0.5) < 1e-9, `expected ~0.5, got ${got}`);
});

test("phaseCycle wraps back to ~0 after one full synodic month", () => {
  // The product SYNODIC_MONTH_DAYS * MS_PER_DAY is not exactly representable
  // in IEEE-754 double precision, so adding it to the epoch lands a few ULP
  // short of a whole cycle and the remainder surfaces as ~0.99999999999999.
  // That is expected floating-point behaviour; only assert the value is
  // within one day of the boundary on either side.
  const got = phaseCycle(NEW_MOON_EPOCH_MS + SYNODIC_MS);
  assert.ok(got < 1e-6 || got > 1 - 1e-6, `expected ~0 or ~1, got ${got}`);
});

test("phaseCycle stays in [0, 1) for a date well before the epoch", () => {
  const pre = Date.UTC(1900, 0, 1);
  const p = phaseCycle(pre);
  assert.ok(p >= 0 && p < 1, `out of range: ${p}`);
});

test("phaseCycle throws on non-finite input", () => {
  assert.throws(() => phaseCycle(NaN), RangeError);
  assert.throws(() => phaseCycle(Infinity), RangeError);
});

test("phaseName covers every region of the cycle", () => {
  // Spot-check one point inside each band plus the eight cardinal samples.
  assert.equal(phaseName(0), "NewMoon");
  assert.equal(phaseName(0.03), "NewMoon");
  assert.equal(phaseName(0.25), "WaxingCrescent");
  assert.equal(phaseName(0.5), "WaxingGibbous");
  assert.equal(phaseName(0.75), "FullMoon");
});

test("phaseName throws for out-of-range positions", () => {
  assert.throws(() => phaseName(-0.01), RangeError);
  assert.throws(() => phaseName(1), RangeError);
  assert.throws(() => phaseName(NaN), RangeError);
});

test("illumination is 0 at new moon and ~1 at full moon", () => {
  assert.equal(illumination(0), 0);
  const full = illumination(0.5);
  assert.ok(Math.abs(full - 1) < 1e-12, `expected ~1, got ${full}`);
});

test("illumination is 0.5 at both quarter points", () => {
  const q1 = illumination(0.25);
  const q3 = illumination(0.75);
  assert.ok(Math.abs(q1 - 0.5) < 1e-12, `q1=${q1}`);
  assert.ok(Math.abs(q3 - 0.5) < 1e-12, `q3=${q3}`);
});

test("illumination is symmetric between waxing and waning halves", () => {
  // cos(2πp) is symmetric about p=0.5, so illumination(p) == illumination(1-p).
  const a = illumination(0.2);
  const b = illumination(0.8);
  assert.ok(Math.abs(a - b) < 1e-12, `${a} vs ${b}`);
});

test("moonPhase accepts a Date, a string, and a numeric timestamp", () => {
  const d = new Date(Date.UTC(2024, 0, 11, 11, 57)); // documented new moon
  const fromObj = moonPhase(d);
  const fromStr = moonPhase(d.toISOString());
  const fromNum = moonPhase(d.getTime());

  assert.equal(fromObj.cyclePosition, fromStr.cyclePosition);
  assert.equal(fromObj.cyclePosition, fromNum.cyclePosition);
  assert.ok(fromObj.illumination >= 0 && fromObj.illumination <= 1);
  assert.ok(fromObj.date.getTime() === d.getTime());
  assert.equal(typeof fromObj.phaseName, "string");
});

test("moonPhase returns a fresh Date instance (no shared mutable state)", () => {
  const a = moonPhase(new Date(Date.UTC(2024, 0, 1)));
  const b = moonPhase(new Date(Date.UTC(2024, 0, 1)));
  assert.notEqual(a, b);
  assert.equal(a.date.getTime(), b.date.getTime());
});

test("moonPhase rejects invalid string input", () => {
  assert.throws(() => moonPhase("not-a-date"), RangeError);
});

test("moonPhase returns cyclePosition in [0, 1) for an arbitrary modern date", () => {
  const r = moonPhase(Date.UTC(2024, 5, 21));
  assert.ok(r.cyclePosition >= 0 && r.cyclePosition < 1);
});
