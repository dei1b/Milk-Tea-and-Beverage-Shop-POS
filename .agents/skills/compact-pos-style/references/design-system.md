# Design specification

The source screenshot is 1107 × 702 pixels. The approximate boundaries are a 128 px navigation rail, a 50 px global header, a 42 px workspace toolbar, a 696 px catalog region, and a 246 px summary region. These are visual observations from a scaled image, not a requirement to render text at screenshot scale. The gray surround is presentation framing; omit it from ordinary full-window applications.

## Palette and surfaces

| Role | Starting value | Treatment |
| --- | --- | --- |
| Workspace | `#F7F9FA` | Very pale cool gray |
| Panel or card | `#FFFFFF` | Flat white |
| Primary / selected | `#1D2B39` | Navy fill with white label |
| Main text | `#22272D` | Near-black, neutral |
| Secondary text | `#66727D` | Readable muted gray |
| Faint annotation | `#8D969F` | Nonessential detail only |
| Outline | `#E8ECEF` | 1 px dividing lines and card borders |
| Hover background | `#F0F3F5` | Small tonal change |
| Success | `#1AAF77` | Status dots or paired icon/text |
| Unavailable / error | `#D94848` | Status dots or paired icon/text |
| Disabled surface | `#CDD1D4` | Muted filled action |

Dark fills occupy only navigation selection, active filters, and key buttons. Colorful photographs supply most of the visual variety. Avoid unrelated accent colors. Add enough contrast for any small text, state, and focus ring; the screenshot's faint text is not an accessibility target.

## Typography and spacing

Use the project's neutral sans serif, or `Inter, ui-sans-serif, system-ui, sans-serif`. Do not require a remote font. Normal product text should typically be 13–14 px with 1.35–1.5 line height; supporting details 12 px; section labels 14 px medium; important totals 14–16 px medium. Use weights 400, 500, and 600. The reference has modest hierarchy, not large headlines.

Use a 4 px spacing rhythm: 4, 8, 12, 16, and 24 px. Common card inset: 8 px. Grid gaps: 10–12 px. Panel inset: 12 px. Use 6 px radii on controls, 8–10 px on cards and major panels. Keep shadows absent by default, or exceptionally light for overlays. Borders do most of the separation.

## Desktop composition

The visual hierarchy is `navigation rail | catalog workspace | task summary`. The global header and filter toolbar span the area beside the rail; the catalog and summary begin beneath them. In the source, the rail takes about 12% of the shell, the catalog about 64%, and the summary about 24%. Use these as balance checks at comparable widths, then adapt the layout to the minimum usable widths below. Keep the first row of cards aligned with the top of the summary panel.

- Left rail: approximately 140–176 px at production size, with brand at top, grouped navigation, indented subitems under disclosure controls, and settings/account actions at the bottom. Selected destination is a short navy rounded rectangle. Use consistent 16–18 px outline icons.
- Global header: approximately 52–60 px, with context/store selector at left and date/context utilities and user menu at right. Thin bottom border, white fill.
- Toolbar: approximately 44–52 px minimum; allow wrapping. Leading view selector, category chips with small count badges, selected chip in navy, and refresh/search aligned to the right when space permits.
- Workspace: flexible content region plus a roughly 280–320 px right panel. Start with `minmax(0, 1fr)` for the content so cards do not push the summary outside the viewport.
- Catalog: four equal columns on ample desktops, three or two when the available content width is smaller. Choose columns by usable card width (roughly 170–220 px), not viewport width alone.
- Summary: bordered white panel with title and identifier on one line. Item list occupies the flexible area; totals, option controls, offer row, and final action appear below. Use a column layout and `margin-top: auto` for the footer when there is spare height. Avoid overlapping absolute-positioned controls.

Use independent scrolling only when it improves a full-height work application. In that case give the grid and summary list valid `min-height: 0` scroll containers. For normal document-flow pages, use page scrolling and a sticky summary with an appropriate header offset.

## Component anatomy

### Catalog card

White rounded rectangle with a thin outline and 8 px inset. Image roughly 4:3, `object-fit: cover`, and a 5–6 px radius; a small white status pill sits in its upper-right corner. The next row contains item name on the left and a short value on the right. Use tabular numerals for prices. Reserve predictable text space or two lines for longer names while keeping actions aligned. A compact full-width button follows.

- Available, unselected: navy action with a small plus icon.
- Already selected: white outlined action with quantity in the label; preserve selected quantity in state.
- Unavailable: muted filled disabled action and status pill with red dot and explicit label. Color alone does not convey the status.

### Summary item

Thin bordered row with a 56–64 px square thumbnail, item name and quantity, subdued option details, and value beneath. Small edit/remove actions align at the lower right with adequate hit areas. Allow names to wrap while values remain stable. Keep separate rows rather than a visually heavy table.

### Totals and option rows

Pair left labels with right-aligned values. Separate the final total with a subtle top border. Positive reductions may use success color with a minus sign. Render order type, location, or equivalent domain options as compact labeled rows with a value and chevron. Use a full-width navy final action.

### Filters, controls, and navigation

Default buttons and filter chips are white with a faint border; active filters use navy and a small lighter count badge. Search is a compact outlined input with a leading icon. Secondary utility buttons combine an outline icon and short label. Navigation uses compact rows with clear grouping and a restrained active state.

Desktop control height starts at 32–36 px with sufficient spacing; on touch layouts use at least 44 px targets. Small visual icons can sit inside larger button hit areas. Keep a distinct focus outline and relevant pressed/selected semantics.

## Responsive adaptation

Use content fit to choose breakpoints. Suggested starting behavior:

- Wide desktop: full rail, horizontal toolbar, 3–4 catalog columns, persistent summary at right.
- Smaller desktop or tablet: reduce catalog to 2–3 columns. Collapse navigation if needed; keep summary visible only while content retains useful width. Wrap filters and search cleanly.
- Narrow screens: replace the rail with a labeled menu trigger; arrange catalog in 1–2 columns according to content length; present the summary below content or in a user-controlled cart/detail drawer. If using a sticky summary trigger, reserve page padding so it cannot cover cards or actions.

Never remove critical summary data or checkout functionality solely to match the desktop composition. Respect reduced-motion preferences; any feedback animation should be brief and subtle.

## Transfer to other products

For inventory, booking, asset libraries, or dispatch tools, replace dishes with domain items and the order summary with the relevant selection/detail panel. Preserve information hierarchy and task flow. For data-heavy admin pages, use compact rows or tables in the main workspace while keeping the same shell, border treatment, palette, filters, and action styles. Do not copy the reference's typos, inconsistent monetary punctuation, user identity, or historical timestamp.
