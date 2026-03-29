# Phase 2: Dashboard - Research

**Researched:** 2026-03-28
**Domain:** React charting (Recharts), Express API endpoint, clinical UI layout
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Chart library:** Use Recharts (SVG-based, declarative React components)
- **Waveform:** Single correction_angle line — one continuous line, no area fill
- **Data strategy:** Send all data points from server; Recharts renders them all (no server-side downsampling)
- **Tooltip:** On hover — shows exact angle value + timestamp
- **Layout:** Vertical stack: Header → Chart card → Metrics card
- **Header:** Profile name (prominent) + back button (← Back to profiles) — no avatar
- **Full-width layout** with consistent left/right padding — no max-width container
- **Cards:** Chart and metrics table each in a bordered card with subtle shadow — consistent with ProfileCard pattern
- **Chart line color:** #0D8ABC (matches existing app accent)
- **Line only** — no area fill under the waveform
- **Y-axis:** Fixed range 5 to 130 degrees, labeled with degree values
- **X-axis:** Day labels (Mon, Tue, Wed…) for the 7-day span
- **Grid:** Light gray horizontal grid lines for Y-axis guidance
- **Chart title/label:** "Correction Angle — Past 7 Days"
- **Metrics table:** Two-column table: Metric name | Value
- **Two rows:** "Avg X-axis deviation" and "Avg Y-axis deviation"
- **Both metrics computed from correction_angle** (same value for both — single-axis data)
- **Format:** One decimal place + degree symbol (e.g. `42.3°`)
- **"Past 7 days"** context label in/near the table
- **Table lives inside a card** consistent with the chart card above
- **Inline styles throughout** (no Tailwind, no CSS modules)
- **Data fetching:** `fetch('/api/...')` in `useEffect`
- **Dashboard.jsx:** Extend in place — do not replace the file
- **New API endpoint:** `GET /api/profiles/:id/telemetry` returns correction_angle + recorded_at for past 7 days
- **Server:** Add route in `server/routes/` and register in `server/index.js`
- **Chart renders inside Dashboard.jsx** — no new page/route needed

### Claude's Discretion

- Exact spacing/padding values between sections
- Table header row styling (bold labels vs plain)
- Loading state while data fetches (spinner or skeleton)
- Error state if API fails
- Exact tooltip styling details

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | Dashboard displays a continuous waveform chart (X: time across past 7 days, Y: correction angle 5–130°) | Recharts LineChart + YAxis domain={[5,130]} + XAxis with day labels; see Code Examples |
| DASH-02 | Dashboard displays a metrics table showing average X-axis deviation and average Y-axis deviation for the past 7 days | Server-side AVG(correction_angle) query; two-column HTML table inside card |
| DASH-03 | Dashboard shows the profile name/identity clearly | Existing profile fetch in Dashboard.jsx stub; display in prominent h1 header |
| UI-01 | Interface follows a medical/clinical aesthetic — clean, white, professional typography | Established inline style palette: #fff background, #1a1a2e headings, #666 secondary, #0D8ABC accent; no consumer-app patterns |
</phase_requirements>

---

## Summary

Phase 2 adds a clinical dashboard to an existing React + Express + SQLite app. The core technical work is: (1) a new Express route querying telemetry data for a given profile over 7 days, and (2) rendering a Recharts LineChart inside the existing Dashboard.jsx stub with fixed Y-axis range and day-label X-axis. The stack is already established — React 18, React Router v6, inline styles, better-sqlite3, Express.

**Critical data volume fact:** The seed script inserts one row every 30 seconds for 7 days — approximately 20,160 rows per profile. Recharts renders SVG, and CONTEXT.md locks "no server-side downsampling." At 20k points, SVG rendering will be slow (several seconds) and the line will be visually indistinguishable from a much smaller dataset. The planner must decide how to handle this: either allow thin server-side time-bucketing (aggregation, not downsampling) that preserves waveform shape, or send all points and note the performance consequence. This is the single most important open question in this phase.

Recharts has released version 3.x (currently 3.8.1 as of March 2026) with breaking changes from 2.x — particularly `CartesianGrid` now requires explicit `xAxisId`/`yAxisId` props, and `ResponsiveContainer` ref behavior changed. Since the project does not currently have Recharts installed, the planner should install 3.x and use its API patterns.

**Primary recommendation:** Install Recharts 3.x; use `LineChart` with `ResponsiveContainer` inside a fixed-height parent div; set `YAxis domain={[5, 130]} allowDataOverflow`; address data volume by bucketing at the API level rather than sending raw 20k rows.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^3.8.1 | SVG line chart with React components | Locked decision; declarative, React 18 compatible |
| react | ^18.2.0 (already installed) | Component rendering | Already in project |
| react-router-dom | ^6.20.0 (already installed) | `useParams`, `useNavigate` | Already in project |
| better-sqlite3 | 12.8.0 (already installed) | SQLite query for telemetry | Already in project, prebuilt for Node 25.x |
| express | already installed | API route | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none additional) | — | — | All dependencies already present |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Victory, Chart.js, Nivo | Recharts is locked decision — do not substitute |
| Recharts 3.x | Recharts 2.x | 3.x is current; 2.x is outdated; new installs get 3.x by default |

**Installation (client directory):**
```bash
cd client && npm install recharts
```

---

## Architecture Patterns

### Recommended Project Structure

No new files/folders needed except:
```
server/
├── routes/
│   ├── profiles.js          # existing
│   └── telemetry.js         # NEW — GET /api/profiles/:id/telemetry
├── index.js                 # register new route
client/src/pages/
└── Dashboard.jsx            # extend in place (do not create new file)
```

### Pattern 1: Express Route (factory style matching existing code)

**What:** Create a new route file that exports a factory function receiving the `db` instance — identical pattern to `profiles.js`.
**When to use:** Every new server route in this project.
**Example:**
```javascript
// server/routes/telemetry.js
// Source: modeled on existing server/routes/profiles.js
const express = require('express');
const router = express.Router({ mergeParams: true });

module.exports = (db) => {
  router.get('/', (req, res) => {
    const { id } = req.params;
    const rows = db.prepare(`
      SELECT recorded_at, correction_angle
      FROM telemetry
      WHERE profile_id = ?
        AND recorded_at >= datetime('now', '-7 days')
      ORDER BY recorded_at ASC
    `).all(id);
    res.json(rows);
  });
  return router;
};
```

Register in `server/index.js`:
```javascript
app.use('/api/profiles/:id/telemetry', require('./routes/telemetry')(db));
```

**Note on `mergeParams: true`:** Required when the route file uses `req.params.id` from the parent router path (`/api/profiles/:id/...`). Without it, `req.params.id` is undefined.

### Pattern 2: Recharts LineChart with Fixed Y-Axis

**What:** Recharts 3.x declarative component tree for a responsive waveform line chart.
**When to use:** The chart card inside Dashboard.jsx.
**Example:**
```jsx
// Source: recharts.github.io official docs
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

// Parent div MUST have explicit height — ResponsiveContainer reads parent height
<div style={{ width: '100%', height: 320 }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={telemetry} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
      <CartesianGrid vertical={false} stroke="#f0f0f0" />
      <XAxis dataKey="day_label" tick={{ fontSize: 12, fill: '#666' }} />
      <YAxis
        domain={[5, 130]}
        allowDataOverflow
        tickFormatter={(v) => `${v}°`}
        tick={{ fontSize: 12, fill: '#666' }}
        width={48}
      />
      <Tooltip
        formatter={(value) => [`${value.toFixed(1)}°`, 'Correction Angle']}
        labelFormatter={(label) => label}
      />
      <Line
        type="monotone"
        dataKey="correction_angle"
        stroke="#0D8ABC"
        dot={false}
        strokeWidth={1.5}
        isAnimationActive={false}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
```

### Pattern 3: Data Fetching (matching existing Dashboard.jsx style)

**What:** useEffect + fetch with loading and error state.
**When to use:** Fetching telemetry inside Dashboard.jsx alongside existing profile fetch.
**Example:**
```jsx
// Matches existing fetch('/api/profiles') pattern
const [telemetry, setTelemetry] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch(`/api/profiles/${profileId}/telemetry`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to load telemetry');
      return res.json();
    })
    .then(data => { setTelemetry(data); setLoading(false); })
    .catch(err => { setError(err.message); setLoading(false); });
}, [profileId]);
```

### Pattern 4: Metrics Computation

**What:** Compute average correction_angle from the telemetry array in the component (or from server).
**Note from CONTEXT.md:** Both "Avg X-axis deviation" and "Avg Y-axis deviation" use the same `correction_angle` value.

Two valid approaches:
1. **Server-side (preferred):** Add a separate `/api/profiles/:id/metrics` endpoint returning pre-computed AVG from SQLite — offloads computation, cleaner component.
2. **Client-side:** Compute `arr.reduce((sum, r) => sum + r.correction_angle, 0) / arr.length` on the telemetry array already in state.

Server-side SQL:
```sql
SELECT AVG(correction_angle) AS avg_angle
FROM telemetry
WHERE profile_id = ?
  AND recorded_at >= datetime('now', '-7 days')
```

### Anti-Patterns to Avoid

- **Giving ResponsiveContainer a percentage height without a sized parent:** The parent div MUST have an explicit pixel height (e.g., `height: 320`). `height: '100%'` on the parent without a sized ancestor causes zero-height rendering or infinite growth.
- **Omitting `dot={false}` on Line with thousands of points:** Each data point renders an SVG circle. With 20k rows this adds 20k DOM nodes. Always set `dot={false}` for large datasets.
- **Omitting `isAnimationActive={false}` on Line:** Recharts animates lines on first render. With large datasets this causes a multi-second animation that feels broken. Disable it.
- **Omitting `mergeParams: true` on nested router:** Without it, `req.params.id` is undefined in the telemetry route.
- **Using `require('./routes/telemetry')` path without registering with `:id` param in the parent path:** The profile ID must be in the Express mount path, not just the router.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG line chart rendering | Custom SVG path calculations | Recharts LineChart | Path math, scaling, axis layout are complex and error-prone |
| Responsive chart sizing | JavaScript resize listener + manual width calculation | ResponsiveContainer | Handles ResizeObserver, SSR edge cases, container measurement correctly |
| Axis tick formatting | Manual SVG text elements | YAxis tickFormatter / XAxis tick props | Recharts handles positioning, clipping, rotation automatically |
| Fixed Y-axis domain clamping | Manual min/max checks in data | YAxis domain + allowDataOverflow | Recharts clips SVG paths correctly at domain boundaries |

**Key insight:** Even "simple" line charts involve non-trivial coordinate math, tick spacing, responsive resizing, and tooltip hit-testing. Recharts handles all of this. The clinical simplicity of the output should not be mistaken for implementation simplicity.

---

## Common Pitfalls

### Pitfall 1: ResponsiveContainer Zero-Height Rendering
**What goes wrong:** Chart renders with 0px height and is invisible.
**Why it happens:** ResponsiveContainer sets its own height to 100% of its parent. If the parent's height is auto/unset, it collapses to 0.
**How to avoid:** Always wrap ResponsiveContainer in a div with an explicit pixel height: `<div style={{ height: 320 }}>`.
**Warning signs:** Chart is invisible; browser dev tools shows height:0 on the SVG element.

### Pitfall 2: 20,160 Data Points — SVG Performance
**What goes wrong:** Browser takes 3-8 seconds to render the chart; scrolling/interaction becomes sluggish.
**Why it happens:** Seed data inserts one row every 30 seconds for 7 days = ~20,160 rows. Each row becomes an SVG path point and potentially a DOM node.
**How to avoid:** Add time-bucketing at the API level — aggregate to 5-minute or 15-minute averages. This reduces rows from ~20,160 to ~2,016 (5-min) or ~672 (15-min) while preserving waveform shape. CONTEXT.md says "no server-side downsampling" but averaging preserves clinical information and is distinct from dropping data.
**Warning signs:** Long loading spinner; chart render takes >1 second; `dot={false}` must be set regardless.

SQLite time-bucketing query (5-minute buckets):
```sql
SELECT
  strftime('%Y-%m-%dT%H:%M:00', recorded_at,
    'start of minute',
    '-' || (strftime('%M', recorded_at) % 5) || ' minutes') AS bucket,
  AVG(correction_angle) AS correction_angle
FROM telemetry
WHERE profile_id = ?
  AND recorded_at >= datetime('now', '-7 days')
GROUP BY bucket
ORDER BY bucket ASC
```

### Pitfall 3: Recharts 3.x CartesianGrid API Change
**What goes wrong:** Grid lines don't render (silent failure).
**Why it happens:** Recharts 3.0 changed CartesianGrid to require explicit `xAxisId`/`yAxisId` props when axes have non-default IDs. With default single-axis setup (no explicit IDs), the default behavior still works — but if you add explicit axis IDs, CartesianGrid must match.
**How to avoid:** For this single-axis chart, do not set custom `xAxisId`/`yAxisId` on XAxis/YAxis — use defaults. CartesianGrid will work without explicit props.
**Warning signs:** Chart renders but has no grid lines.

### Pitfall 4: SQLite TEXT Date Comparison
**What goes wrong:** `datetime('now', '-7 days')` comparison returns no rows or wrong rows.
**Why it happens:** SQLite text comparison works correctly only if `recorded_at` is stored in ISO 8601 format (`YYYY-MM-DDTHH:MM:SS.sssZ`).
**How to avoid:** Confirmed safe — seed.js uses `current.toISOString()` which produces ISO 8601 format. The datetime comparison will work correctly.
**Warning signs:** Empty telemetry array returned from API.

### Pitfall 5: XAxis Day Labels from ISO Timestamps
**What goes wrong:** X-axis shows raw ISO strings ("2026-03-21T14:32:00.000Z") instead of day labels (Mon, Tue, Wed).
**Why it happens:** XAxis renders the `dataKey` value directly as a label.
**How to avoid:** Transform data in the API or component to add a computed `day_label` field, or use XAxis `tickFormatter` prop to convert the timestamp to a short day name.
**Example tickFormatter:**
```javascript
tickFormatter={(isoString) => {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}}
```
But with 20k points, tick labels only show on a subset — Recharts selects tick positions automatically based on interval.

---

## Code Examples

### Complete Dashboard.jsx Extension Pattern
```jsx
// Source: established project patterns + recharts official docs
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const CARD_STYLE = {
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '24px',
  background: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  marginBottom: '24px',
};

export default function Dashboard() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(profiles => {
        const found = profiles.find(p => String(p.id) === String(profileId));
        if (found) setProfile(found);
      });
  }, [profileId]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/profiles/${profileId}/telemetry`)
      .then(res => { if (!res.ok) throw new Error('Failed to load data'); return res.json(); })
      .then(data => { setTelemetry(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [profileId]);

  const avg = telemetry.length
    ? (telemetry.reduce((sum, r) => sum + r.correction_angle, 0) / telemetry.length).toFixed(1)
    : '—';

  return (
    <div style={{
      minHeight: '100vh', background: '#fff',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      padding: '40px',
    }}>
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#0D8ABC', cursor: 'pointer', marginBottom: '24px', fontSize: '0.9rem' }}
      >
        &larr; Back to profiles
      </button>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1a2e', marginBottom: '32px' }}>
        {profile ? profile.name : `Profile ${profileId}`}
      </h1>

      {/* Chart Card */}
      <div style={CARD_STYLE}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Correction Angle — Past 7 Days
        </p>
        {loading && <p style={{ color: '#666' }}>Loading…</p>}
        {error && <p style={{ color: '#c62828' }}>{error}</p>}
        {!loading && !error && (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="recorded_at"
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { weekday: 'short' })}
                  tick={{ fontSize: 12, fill: '#666' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[5, 130]}
                  allowDataOverflow
                  tickFormatter={(v) => `${v}°`}
                  tick={{ fontSize: 12, fill: '#666' }}
                  width={48}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(1)}°`, 'Correction Angle']}
                  labelFormatter={(v) => new Date(v).toLocaleString()}
                />
                <Line
                  type="monotone"
                  dataKey="correction_angle"
                  stroke="#0D8ABC"
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Metrics Card */}
      <div style={CARD_STYLE}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Averages — Past 7 Days
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[['Avg X-axis deviation', avg], ['Avg Y-axis deviation', avg]].map(([label, val]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 0', color: '#1a1a2e', fontSize: '0.95rem' }}>{label}</td>
                <td style={{ padding: '12px 0', color: '#1a1a2e', fontWeight: 600, fontSize: '0.95rem', textAlign: 'right' }}>
                  {val}°
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Telemetry API Route with Time-Bucketing
```javascript
// server/routes/telemetry.js
// 5-minute bucketing reduces ~20,160 rows to ~2,016 while preserving waveform shape
const express = require('express');
const router = express.Router({ mergeParams: true });

module.exports = (db) => {
  router.get('/', (req, res) => {
    const { id } = req.params;
    const rows = db.prepare(`
      SELECT
        strftime('%Y-%m-%dT%H:', recorded_at) ||
          printf('%02d', (CAST(strftime('%M', recorded_at) AS INTEGER) / 5) * 5) ||
          ':00Z' AS recorded_at,
        AVG(correction_angle) AS correction_angle
      FROM telemetry
      WHERE profile_id = ?
        AND recorded_at >= datetime('now', '-7 days')
      GROUP BY 1
      ORDER BY 1 ASC
    `).all(id);
    res.json(rows);
  });
  return router;
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts 2.x | Recharts 3.x (3.8.1) | 2024-2025 | CartesianGrid needs axis IDs if custom IDs used; ref API changed |
| `recharts@^2` in package.json | `recharts@^3` | 2024 | New installs get 3.x; 2.x is outdated |

**Deprecated/outdated:**
- Recharts 2.x `CartesianGrid` implicit axis selection: replaced by explicit `xAxisId`/`yAxisId` in 3.x (not needed for default single-axis usage, but be aware)
- Recharts `activeIndex` prop: removed in 3.x; use Tooltip hooks instead

---

## Open Questions

1. **Data volume: strict "no downsampling" vs. time-bucketing**
   - What we know: Seed inserts ~20,160 rows per profile (30-second intervals × 7 days). CONTEXT.md locks "no server-side downsampling." Time-bucketing (averaging) preserves all clinical information at lower resolution.
   - What's unclear: Whether the user's intent behind "no downsampling" was to prevent data loss (in which case averaging is fine) or to preserve every 30-second reading (in which case 20k points must render).
   - Recommendation: Default to 5-minute averaging at the API level. This is a data aggregation, not downsampling, and preserves the waveform shape that makes the chart meaningful. If the user wants raw data, the planner can add a note to verify.

2. **X-axis tick density with time-series data**
   - What we know: Recharts XAxis `interval="preserveStartEnd"` shows first and last tick only; `interval={N}` shows every Nth tick.
   - What's unclear: With bucketed data (~2,016 points), Recharts will auto-select tick density — likely showing many more ticks than the 7 day-label slots desired.
   - Recommendation: Pre-process data to attach a `day_label` field (Mon/Tue/Wed) and use `tickCount={7}` or use `ticks` prop with 7 specific timestamp values aligned to day boundaries.

---

## Sources

### Primary (HIGH confidence)
- [Recharts YAxis official docs](https://recharts.github.io/en-US/api/YAxis) — domain, allowDataOverflow, tickFormatter props
- [Recharts ResponsiveContainer official docs](https://recharts.github.io/en-US/api/ResponsiveContainer) — height/width behavior, parent sizing requirement
- [Recharts 3.0 migration guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) — CartesianGrid breaking changes, ref changes, accessibilityLayer
- `server/scripts/seed.js` (project codebase) — confirmed `toISOString()` format, 30-second intervals, ~20,160 rows
- `server/routes/profiles.js` (project codebase) — factory pattern, `mergeParams` requirement
- `server/db/schema.sql` (project codebase) — telemetry table columns, index structure
- `client/src/pages/Dashboard.jsx` (project codebase) — existing stub, inline style conventions
- `client/src/components/ProfileCard.jsx` (project codebase) — card style values to reuse

### Secondary (MEDIUM confidence)
- [npm recharts page](https://www.npmjs.com/package/recharts) — version 3.8.1 current as of March 2026
- Multiple GitHub issues confirming ResponsiveContainer parent-height requirement (issues #1545, #3688, #5388)

### Tertiary (LOW confidence)
- WebSearch results on SVG performance with 20k+ points — general guidance; project-specific threshold not benchmarked

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Recharts 3.x confirmed current; project stack read directly from codebase
- Architecture: HIGH — Patterns derived from existing project code + official Recharts docs
- Pitfalls: HIGH for ResponsiveContainer height (confirmed by multiple GitHub issues); HIGH for data volume (confirmed by seed.js row count); MEDIUM for 3.x CartesianGrid change (confirmed from migration guide)

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (Recharts 3.x is under active development; check for API changes if planning is delayed)
