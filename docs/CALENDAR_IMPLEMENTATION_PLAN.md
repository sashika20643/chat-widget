# Custom Calendar Component – Implementation Plan

## 1. Goal

Replace the current calendar (shadcn `Calendar` + `react-day-picker`) with a **custom calendar** that:

- Uses **date-fns** for all date/month logic (already in the project).
- Implements the **UI with Tailwind** only (no react-day-picker for the grid).
- Keeps the same behavior and API as today: single date picker, availability dots, weekends disabled/hidden, min date.

---

## 2. Library for Dates / Months: **date-fns** (no new dependency)

**date-fns** is already in `package.json` and is enough for the custom calendar. No new library is required.

| Need | date-fns API |
|------|------------------|
| First/last day of month | `startOfMonth`, `endOfMonth` |
| Days in month | `getDaysInMonth` |
| All days in range | `eachDayOfInterval` |
| Month navigation | `addMonths`, `subMonths` |
| Formatting | `format(date, 'yyyy-MM-dd')`, `format(date, 'EEE')`, etc. |
| Comparisons | `isSameMonth`, `isSameDay`, `isBefore`, `isAfter` |
| Day of week | `getDay()` (0 = Sun … 6 = Sat) |
| Add days | `addDays` |

We’ll use these to build the calendar grid (which days to show, padding for weekday alignment) and to implement min date, weekends, and availability.

---

## 3. Current Behavior to Preserve

From `CalendarPicker.tsx` and `ReservationFlow`:

- **Mode:** Single date selection.
- **Props:** `onDateSelect(date: Date)`, optional `minDate`, optional `availabilityMap: Map<string, boolean>` (key = `YYYY-MM-DD`).
- **Rules:**
  - Disable past dates and dates before `minDate`.
  - Treat weekends (Sat/Sun) as disabled; currently they are hidden in the grid.
  - Show only **weekdays (Mon–Fri)** in the grid.
- **UI per day:**
  - Day abbreviation (e.g. MO, TU).
  - Day number.
  - Availability dot: green = available (`true` or missing in map), yellow = limited (`false` in map).
- **Range:** Support a configurable year range (e.g. current year to current year + 2) for navigation.
- **Styling:** Reuse existing Tailwind/shadcn-like styles (borders, primary/accent, hover, disabled).

---

## 4. Architecture

- **Custom calendar (core):**  
  New component that only knows about “current month”, “selected date”, “disabled” and “availability” per day. It receives:
  - `month: Date` (first day of displayed month),
  - `onMonthChange(month: Date)`,
  - `selected: Date | undefined`,
  - `onSelect(date: Date)`,
  - `disabled(date: Date) => boolean`,
  - `availabilityMap?: Map<string, boolean>`,
  - optional `fromYear`, `toYear` for navigation limits.

- **CalendarPicker (container):**  
  Keeps the same public API as now:
  - `onDateSelect: (date: Date) => void`
  - `minDate?: Date`
  - `availabilityMap?: Map<string, boolean>`

  It will:
  - Compute `startDate` (min selectable date, e.g. next weekday if today is weekend).
  - Build default `availabilityMap` when not provided (same logic as today).
  - Render the **custom calendar** and pass the above props.

- **ReservationFlow** and **ChatWidget** do not need changes; they keep using `CalendarPicker` as today.

---

## 5. Implementation Steps

### Phase 1: Date grid and month logic

1. **Add a small calendar utils module** (or extend `calendarUtils.ts`) with:
   - `getCalendarDays(month: Date, options?: { hideWeekends?: boolean })`: returns an array of “day” objects for the visible grid:
     - For each cell: `{ date: Date, isCurrentMonth: boolean, isWeekend: boolean }`.
     - Use `startOfMonth`, `endOfMonth`, `eachDayOfInterval`, and pad the start so the first weekday aligns (e.g. Monday = 1). If `hideWeekends`, only include Mon–Fri and pad so the grid stays 5 columns.
   - Use `date-fns` only; no new deps.

2. **Implement the grid layout** in the custom component:
   - One row: weekday headers (e.g. MON, TUE, WED, THU, FRI).
   - Rows of day cells built from `getCalendarDays(month, { hideWeekends: true })`.
   - Each cell: button (or div) with `date`, `isCurrentMonth`, `isWeekend`; later we’ll add selection and availability.

### Phase 2: Navigation and selection

3. **Month/Year navigation:**
   - “Previous” / “Next” month buttons using `addMonths`/`subMonths`, respecting `fromYear`/`toYear`.
   - Optional: month/year dropdowns (can be Phase 2b if we want to ship minimal first).

4. **Selection:**
   - When a day is clicked, call `onSelect(date)`.
   - Highlight selected day with Tailwind (e.g. `bg-primary text-primary-foreground`).
   - Disable cells when `disabled(date)` is true (past, before `minDate`, weekend if we ever show them).

### Phase 3: Availability and styling

5. **Availability dots:**
   - For each day, key = `format(date, 'yyyy-MM-dd')`.
   - If `availabilityMap.get(key) === false` → yellow dot; otherwise green (or no dot if you prefer).
   - Reuse the same dot placement and size as current design (e.g. bottom-left of cell).

6. **Tailwind UI:**
   - Match current look: cell borders, rounded corners, hover, disabled opacity, “today” ring if desired.
   - Ensure responsive cell size (e.g. `[--cell-size:2.5rem]` and use in min/max width/height) so layout stays consistent.

### Phase 4: Integration and cleanup

7. **Wire into CalendarPicker:**
   - Replace the shadcn `<Calendar />` (and any `react-day-picker` usage) with the new custom calendar component.
   - Pass `selected`, `onSelect`, `disabled`, `availabilityMap`, `fromYear`, `toYear`, and month state.
   - Keep `CalendarPicker`’s props (`onDateSelect`, `minDate`, `availabilityMap`) unchanged.

8. **Optional cleanup:**
   - If nothing else in the app uses the shadcn Calendar or react-day-picker, we can remove `react-day-picker` from dependencies and delete or simplify `src/components/ui/shadCN/calendar.tsx` later. Do this only after confirming no other imports.

---

## 6. File Changes (Summary)

| Action | File |
|--------|------|
| Add/extend | `src/utils/calendarGridUtils.ts` (or inside `calendarUtils.ts`) – grid generation with date-fns |
| Add | `src/components/CalendarGrid.tsx` (or `CustomCalendar.tsx`) – custom calendar UI with Tailwind |
| Modify | `src/components/flows/CalendarPicker.tsx` – use custom calendar instead of shadcn Calendar |
| No change | `ReservationFlow.tsx`, `useReservationFlow.ts`, `calendarUtils.ts` (createAvailabilityMap) |
| Optional later | Remove `react-day-picker` and simplify `src/components/ui/shadCN/calendar.tsx` if unused elsewhere |

---

## 7. Testing Checklist (Manual / Later Automated)

- [ ] Month prev/next changes grid correctly (only weekdays, correct count).
- [ ] Selecting a date calls `onDateSelect` once with correct `Date`.
- [ ] Past dates and dates before `minDate` are disabled and not selectable.
- [ ] Weekends are not shown (or disabled if shown).
- [ ] Availability dots: green when available, yellow when `availabilityMap.get(key) === false`.
- [ ] “Today” is visually distinct when in range.
- [ ] Layout works on small and large viewports (Tailwind responsive).
- [ ] Reservation flow still works end-to-end (select date → time → form → submit).

---

## 8. Next Step

Start with **Phase 1**: implement `getCalendarDays` with date-fns and a minimal grid (weekday headers + day cells) in the new component, then proceed through the phases. We can implement phase-by-phase and test after each.
