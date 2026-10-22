# PlacePro Evaluate — Design System & Visual Theme

Professional White-and-Blue theme tailored for collegiate placement drives and fast evaluative data entry.

---

## 1. Color Palette

| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Blue** | `#2563EB` | `bg-blue-600` | Primary buttons, active indicators, brand badges |
| **Secondary Blue** | `#1D4ED8` | `bg-blue-700` | Button hover states, active headers |
| **Light Blue** | `#EFF6FF` | `bg-blue-50` | Background accents, selected table rows |
| **Accent Blue** | `#60A5FA` | `bg-blue-400` | Chart secondary bars, subtle borders |
| **Page Background**| `#F8FAFC` | `bg-slate-50` | Full-screen app background |
| **Card Background**| `#FFFFFF` | `bg-white` | Content cards, data table bodies |
| **Primary Text** | `#111827` | `text-slate-900`| Page headings, candidate names, primary scores |
| **Secondary Text** | `#64748B` | `text-slate-500`| Subtitles, timestamps, metadata labels |
| **Subtle Borders** | `#E2E8F0` | `border-slate-200` | Card borders, table dividers |
| **Success** | `#16A34A` | `text-emerald-700` | Qualified badges, completed statuses, top marks |
| **Warning** | `#D97706` | `text-amber-700` | Judge shortlist stars, waitlists, pending reviews |
| **Danger** | `#DC2626` | `text-rose-700` | Not qualified badges, error banners |

---

## 2. Typography
- **Font Family**: `Inter`, sans-serif
- **Heading Styles**: `font-bold tracking-tight text-slate-900`
- **Monospace Accents**: Registration IDs and numerical rubrics use clean monospace rendering for tabular readability.

---

## 3. UI Component Specifications
- **Cards**: `bg-white border border-slate-200/90 rounded-xl shadow-sm p-6`
- **Tables**: Clean horizontal lines (`divide-y divide-slate-100`), subtle blue hover (`hover:bg-blue-50/30`), responsive horizontal scrolling.
- **Badges**: Compact pill badges with semantic light backgrounds and dark text.
- **Buttons**: Micro-interactions with `active:scale-[0.98]` and clear focus rings.
- **Modals**: Backdrop blur with smooth entry transitions.
