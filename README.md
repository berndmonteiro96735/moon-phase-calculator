# Moon Phase Calculator

Determines the lunar phase name and illumination percentage for a given date by locating the instant within the mean synodic month relative to a known new-moon epoch.

## Usage

```js
import { moonPhase, phaseCycle, phaseName, illumination } from "moon-phase-calculator";

const r = moonPhase(new Date("2024-06-21T12:00:00Z"));
// r.cyclePosition  -> ~0.398
// r.phaseName      -> "WaxingCrescent"
// r.illumination   -> ~0.355

const pos = phaseCycle(Date.UTC(2024, 0, 11, 11, 57)); // documented new moon -> ~0
const name = phaseName(pos);                           // "NewMoon"
const lit = illumination(pos);                         // ~0
```

## Why this exists

The problem is simple: given a date, say what the Moon looks like. The dependency-free answer is to count days from a reference new moon and divide by the mean synodic month (29.530588853 days). The trade-off is accuracy: real lunar motion varies by several hours month to month because of orbital eccentricity and solar perturbation, so phase labels near the quarter transitions can be off by roughly half a day. For scheduling, UI labels, and general-purpose date work that is fine; for astronomy or tide prediction it is not, and you should use a numerical ephemeris instead.

## Edge you will hit

The phase-name boundaries are inclusive at the start of each band. A position of exactly `0.25` is reported as `WaxingCrescent`, not `FirstQuarter`; only the exact midpoint of the band is reported as the cardinal phase. If you need the classic eight-phase vocabulary with the quarters as a single instant rather than a band, compare `cyclePosition` against the exact fractions (0, 0.25, 0.5, 0.75) yourself before calling `phaseName`.

## Exports

- `moonPhase(input)` → `{ date, cyclePosition, phaseName, illumination }`
- `phaseCycle(epochMillis)` → `number` in `[0, 1)`
- `phaseName(position)` → `"NewMoon" | "WaxingCrescent" | "WaxingGibbous" | "FullMoon"`
- `illumination(position)` → `number` in `[0, 1]`
- `NEW_MOON_EPOCH_MS` → reference epoch (ms since Unix epoch)
- `SYNODIC_MONTH_DAYS` → `29.530588853`
