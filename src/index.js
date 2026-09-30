/**
 * Public entry point for the Moon Phase Calculator.
 *
 * Re-exports the pure-arithmetic primitives from core.js plus a single
 * convenience function, moonPhase, that returns a complete description
 * for a given date.
 */
import {
  phaseCycle,
  phaseName,
  illumination,
  NEW_MOON_EPOCH_MS,
  SYNODIC_MONTH_DAYS,
} from "./core.js";

export { phaseCycle, phaseName, illumination, NEW_MOON_EPOCH_MS, SYNODIC_MONTH_DAYS };

/**
 * Returns a complete description of the lunar phase at the given date.
 *
 * Accepts any value Date() understands, or a finite millisecond timestamp.
 * The branch is necessary because calling new Date(undefined) yields Invalid
 * Date silently, whereas new Date(1234) is intentional and valid.
 *
 * @param {Date | number | string} input - the instant to evaluate.
 * @returns {{
 *   date: Date,
 *   cyclePosition: number,
 *   phaseName: string,
 *   illumination: number
 * }}
 */
export function moonPhase(input) {
  let epochMillis;
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new RangeError("numeric input must be a finite millisecond timestamp");
    }
    epochMillis = input;
  } else {
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) {
      throw new RangeError("input must be a valid Date or date string");
    }
    epochMillis = d.getTime();
  }

  const position = phaseCycle(epochMillis);
  return {
    date: new Date(epochMillis),
    cyclePosition: position,
    phaseName: phaseName(position),
    illumination: illumination(position),
  };
}
