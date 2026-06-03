---
'@vitecharts/core': minor
---

Update-morph (FLIP), value count-up, and hover emphasis.

- Bars now slide + resize from their previous geometry on data updates (the
  "bar-race" effect) via a per-frame geometry snapshot.
- Data labels count up/down to the new value on update.
- Hovering highlights the active point(s) with an emphasis ring.

Adds `animateRectMorph` and `animateNumber` to the animation API.
