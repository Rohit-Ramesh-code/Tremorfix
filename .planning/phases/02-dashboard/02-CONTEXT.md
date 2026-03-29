# Phase 2: Dashboard - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a clinical dashboard page for a selected profile showing a 7-day correction angle waveform chart and a metrics table. Profile name is displayed clearly. The page replaces the current stub in Dashboard.jsx. Creating posts, real-time streaming, and ML analysis are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Chart library
- Use **Recharts** (SVG-based, declarative React components)
- Single waveform line — `correction_angle` plotted as one continuous line
- Send all data points from server, Recharts renders them all (no server-side downsampling)
- Tooltip on hover: shows exact angle value + timestamp

### Dashboard layout
- Vertical stack: **Header → Chart card → Metrics card**
- Header: profile name (prominent) + back button (← Back to profiles) — no avatar
- Full-width layout with consistent left/right padding (no max-width container)
- Chart and metrics table each in a **bordered card with subtle shadow** — consistent with ProfileCard pattern

### Chart visual style
- Waveform line color: **#0D8ABC** (matches existing app accent)
- Line only — no area fill under the waveform
- Y-axis: fixed range **5 to 130 degrees**, labeled with degree values
- X-axis: **day labels** (Mon, Tue, Wed…) for the 7-day span
- **Light gray horizontal grid lines** for Y-axis guidance
- Chart title or label: "Correction Angle — Past 7 Days"

### Metrics table format
- **Two-column table**: Metric name | Value
- Two rows: "Avg X-axis deviation" and "Avg Y-axis deviation"
- Both computed from `correction_angle` (same value for both — single-axis data)
- Format: **one decimal place + degree symbol** (e.g. `42.3°`)
- Table includes a **"Past 7 days"** context label
- Table lives inside a card consistent with the chart card above

### Claude's Discretion
- Exact spacing/padding values between sections
- Table header row styling (bold labels vs plain)
- Loading state while data fetches (spinner or skeleton)
- Error state if API fails
- Exact tooltip styling details

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ProfileCard.jsx`: Card pattern with `border: '1px solid #e0e0e0'`, `borderRadius: '8px'`, `boxShadow: '0 1px 3px rgba(0,0,0,0.08)'` — reuse this exact pattern for chart and metrics cards
- `Dashboard.jsx`: Existing stub with back button and profile fetch logic — extend in place, don't replace the file
- Established color palette: `#fff` background, `#1a1a2e` headings, `#666` secondary, `#0D8ABC` accent, `#c62828` errors

### Established Patterns
- Inline styles throughout (no Tailwind, no CSS modules) — continue with inline styles
- Data fetching via `fetch('/api/...')` in `useEffect` — use same pattern for telemetry endpoint
- `useParams()` already in Dashboard.jsx — `profileId` is available

### Integration Points
- New API endpoint needed: `GET /api/profiles/:id/telemetry` — returns correction_angle + recorded_at for past 7 days
- Server: add route in `server/routes/` and register in `server/index.js`
- Chart renders inside Dashboard.jsx — no new page/route needed

</code_context>

<specifics>
## Specific Ideas

- The dashboard should feel like a clinical monitor read-out — not a consumer app chart
- Waveform should visually "breathe" across the 7-day window — the continuous nature of the data is the point

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-dashboard*
*Context gathered: 2026-03-29*
