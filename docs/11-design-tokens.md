# Design System & Tokens

Design tokens are the foundational values that define the visual language of the system — colors, spacing, typography, shadows, borders. Using tokens ensures consistency.

---

## Current Theme System (Existing)

The current system has 3 themes stored as CSS custom properties:

```typescript
type ThemeKey = 'blue' | 'teal' | 'dark'

type ThemeVars = {
  '--color-bg_sideBar'
  '--color-sideBar_border_color'
  '--color-sideBar_sideMenu_bg'
  '--color-sideBarIcon_border_color'
  '--color-sidebar_inactive_text_color'
  '--color-sidebar_text_color'
  '--color-sidebar_hover_text_color'
  '--color-sidebar_active_text_color'
  '--color-vibrant_tur'           // primary accent color
  '--color-hover_vibrant_tur'     // hover state of accent
  '--color-table_header_color'
  '--color-table_header_text_color'
}
```

**Problem:** Only sidebar and table header colors are themeable. The rest of the UI (buttons, forms, badges, alerts) uses hardcoded Tailwind classes.

---

## New Design Token System

### 1. Brand Colors

```css
/* Primary Brand */
--color-brand-50:  #EFF8FF;   /* lightest tint */
--color-brand-100: #DBEFFE;
--color-brand-200: #B5DFFE;
--color-brand-300: #74C7FD;
--color-brand-400: #2AABFB;   /* light */
--color-brand-500: #1F90F9;   /* base (current blue theme) */
--color-brand-600: #0B74E0;
--color-brand-700: #0A5DB4;
--color-brand-800: #0E4F93;
--color-brand-900: #1A344D;   /* darkest */

/* Accent (Teal) */
--color-teal-50:  #F0FDFA;
--color-teal-100: #CCFBF1;
--color-teal-400: #2DD4BF;
--color-teal-500: #37A0AD;   /* current teal theme */
--color-teal-600: #2E8791;
--color-teal-700: #1E5F68;
```

### 2. Semantic Colors

```css
/* Status Colors */
--color-success-50:  #F0FDF4;
--color-success-500: #22C55E;
--color-success-700: #15803D;

--color-warning-50:  #FFFBEB;
--color-warning-500: #F59E0B;
--color-warning-700: #B45309;

--color-error-50:  #FEF2F2;
--color-error-500: #EF4444;
--color-error-700: #B91C1C;

--color-info-50:   #EFF8FF;
--color-info-500:  #3B82F6;
--color-info-700:  #1D4ED8;

/* Neutral Grays */
--color-neutral-0:   #FFFFFF;
--color-neutral-50:  #F9FAFB;
--color-neutral-100: #F3F4F6;
--color-neutral-200: #E5E7EB;
--color-neutral-300: #D1D5DB;
--color-neutral-400: #9CA3AF;
--color-neutral-500: #6B7280;
--color-neutral-600: #4B5563;
--color-neutral-700: #374151;
--color-neutral-800: #1F2937;
--color-neutral-900: #111827;
```

### 3. Semantic Surface Colors

```css
/* Backgrounds */
--surface-page:      #F4F6F9;   /* page background (current table_header_color) */
--surface-card:      #FFFFFF;   /* card/panel background */
--surface-sidebar:   (from theme) /* sidebar background */
--surface-overlay:   rgba(0,0,0,0.5); /* modal overlay */

/* Borders */
--border-subtle:     #E5E7EB;   /* --color-neutral-200 */
--border-default:    #D1D5DB;   /* --color-neutral-300 */
--border-strong:     #9CA3AF;   /* --color-neutral-400 */
--border-focus:      var(--color-brand-500);

/* Text */
--text-primary:      #111827;   /* main text */
--text-secondary:    #6B7280;   /* muted/label text */
--text-disabled:     #9CA3AF;   /* disabled state */
--text-inverse:      #FFFFFF;   /* on dark backgrounds */
--text-link:         var(--color-brand-600);
--text-link-hover:   var(--color-brand-700);
```

---

## Typography Scale

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs:   0.75rem;    /* 12px — metadata, badges */
--text-sm:   0.875rem;   /* 14px — table cells, form labels */
--text-base: 1rem;       /* 16px — body text */
--text-lg:   1.125rem;   /* 18px — card titles */
--text-xl:   1.25rem;    /* 20px — page titles */
--text-2xl:  1.5rem;     /* 24px — section headers */
--text-3xl:  1.875rem;   /* 30px — dashboard KPIs */
--text-4xl:  2.25rem;    /* 36px — large stats */

/* Font Weights */
--font-regular: 400;
--font-medium:  500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight:  1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## Spacing Scale

Based on 4px base unit:
```css
--space-0:   0;
--space-1:   0.25rem;   /* 4px */
--space-2:   0.5rem;    /* 8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
--space-20:  5rem;      /* 80px */
```

---

## Border Radius Scale

```css
--radius-sm:   0.25rem;   /* 4px — chips, small badges */
--radius-md:   0.375rem;  /* 6px — inputs, buttons */
--radius-lg:   0.5rem;    /* 8px — cards, dropdowns */
--radius-xl:   0.75rem;   /* 12px — modals */
--radius-2xl:  1rem;      /* 16px — large cards */
--radius-full: 9999px;    /* pills, avatars */
```

---

## Shadow Scale

```css
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:  0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05);
--shadow-xl:  0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04);
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.25);
```

---

## Component-Level Tokens

### Button

```css
/* Primary Button */
--btn-primary-bg:         var(--color-brand-500);
--btn-primary-bg-hover:   var(--color-brand-600);
--btn-primary-bg-active:  var(--color-brand-700);
--btn-primary-text:       #FFFFFF;
--btn-primary-border:     transparent;

/* Secondary Button */
--btn-secondary-bg:       #FFFFFF;
--btn-secondary-bg-hover: var(--color-neutral-50);
--btn-secondary-text:     var(--color-brand-600);
--btn-secondary-border:   var(--color-brand-300);

/* Danger Button */
--btn-danger-bg:          var(--color-error-500);
--btn-danger-bg-hover:    var(--color-error-700);
--btn-danger-text:        #FFFFFF;

/* Ghost Button */
--btn-ghost-bg:           transparent;
--btn-ghost-bg-hover:     var(--color-neutral-100);
--btn-ghost-text:         var(--color-neutral-700);

/* Button Sizes */
--btn-sm-px: var(--space-3);   --btn-sm-py: var(--space-1);   --btn-sm-text: var(--text-sm);
--btn-md-px: var(--space-4);   --btn-md-py: var(--space-2);   --btn-md-text: var(--text-sm);
--btn-lg-px: var(--space-6);   --btn-lg-py: var(--space-3);   --btn-lg-text: var(--text-base);
```

### Input / Form Fields

```css
--input-bg:              #FFFFFF;
--input-border:          var(--border-default);
--input-border-focus:    var(--color-brand-500);
--input-border-error:    var(--color-error-500);
--input-border-radius:   var(--radius-md);
--input-text:            var(--text-primary);
--input-placeholder:     var(--text-secondary);
--input-label:           var(--text-secondary);
--input-label-required:  var(--color-error-500); /* asterisk color */
--input-height-sm:       2rem;    /* 32px */
--input-height-md:       2.5rem;  /* 40px */
--input-height-lg:       3rem;    /* 48px */
```

### Table

```css
--table-header-bg:          var(--surface-page);  /* #F4F6F9 */
--table-header-text:        var(--color-neutral-700);
--table-header-border:      var(--border-subtle);
--table-row-bg:             #FFFFFF;
--table-row-bg-hover:       var(--color-neutral-50);
--table-row-bg-selected:    var(--color-brand-50);
--table-cell-border:        var(--border-subtle);
--table-cell-text:          var(--text-primary);
--table-cell-text-sm:       var(--text-sm);
```

### Badge / Status

```css
/* Status badges for Active/Passive/etc */
--badge-active-bg:      var(--color-success-50);
--badge-active-text:    var(--color-success-700);
--badge-active-border:  var(--color-success-500);

--badge-passive-bg:     var(--color-neutral-100);
--badge-passive-text:   var(--color-neutral-600);
--badge-passive-border: var(--color-neutral-300);

--badge-warning-bg:     var(--color-warning-50);
--badge-warning-text:   var(--color-warning-700);
--badge-warning-border: var(--color-warning-500);

--badge-error-bg:       var(--color-error-50);
--badge-error-text:     var(--color-error-700);
--badge-error-border:   var(--color-error-500);

--badge-info-bg:        var(--color-info-50);
--badge-info-text:      var(--color-info-700);
--badge-info-border:    var(--color-info-500);
```

### Sidebar (Theme-specific)

The sidebar tokens extend the current theme system:

```css
/* Blue Theme */
--sidebar-bg:           #FFFFFF;
--sidebar-border:       #DCE0E8;
--sidebar-text:         #35496D;
--sidebar-text-active:  #1F90F9;
--sidebar-text-muted:   #B9C6DC;
--sidebar-item-hover:   rgba(31, 144, 249, 0.06);
--sidebar-item-active:  rgba(31, 144, 249, 0.10);
--sidebar-width:        240px;
--sidebar-collapsed-width: 64px;

/* Dark Theme */
--sidebar-bg:           #35496D;
--sidebar-border:       #415982;
--sidebar-text:         #C7D2E4;
--sidebar-text-active:  #FFFFFF;
--sidebar-text-muted:   #7084AB;
--sidebar-item-hover:   rgba(255,255,255,0.06);
--sidebar-item-active:  rgba(255,255,255,0.12);
```

---

## Status Mapping (Business Entities → Visual Tokens)

| Business Status | Badge Variant | Color Token |
|---|---|---|
| `ACTIVE` | active | --badge-active |
| `INACTIVE` | passive | --badge-passive |
| `PASSIVE` | passive | --badge-passive |
| `TEMPORARILY_PASSIVE` | warning | --badge-warning |
| `SYNCED` | active | --badge-active |
| `PENDING` | info | --badge-info |
| `FAILED` | error | --badge-error |
| `STALE` | warning | --badge-warning |

---

## Icon System

Current: Custom SVG icon components per icon.

**Recommended upgrade:** Keep current pattern but ensure:
- Consistent viewBox size (24×24)
- Stroke-based icons (not fill) for scalability
- Size prop: `sm` (16px), `md` (20px), `lg` (24px), `xl` (32px)
- Color via `currentColor` so icons inherit text color

**Icon categories needed:**
- Navigation (home, back, arrow, chevron)
- Actions (edit, delete, add, save, cancel, copy, download, upload)
- Status (check, x, warning, info, clock)
- Entities (product, dealer, user, external-system, audit)
- UI (search, filter, sort, menu, close, expand)
- Data (chart, table, list, grid, tree)

---

## Layout Constants

```css
--layout-sidebar-width:    240px;
--layout-sidebar-collapsed: 64px;
--layout-header-height:    56px;
--layout-content-max-width: 1440px;
--layout-page-padding:     var(--space-6);   /* 24px */
--layout-card-padding:     var(--space-5);   /* 20px */
--layout-table-row-height: 48px;
--layout-table-compact-row-height: 36px;
--layout-form-label-width: 200px;   /* for horizontal forms */
```

---

## Breakpoints (Responsive)

```css
--breakpoint-sm:  640px;
--breakpoint-md:  768px;
--breakpoint-lg:  1024px;
--breakpoint-xl:  1280px;
--breakpoint-2xl: 1536px;
```

MDM is primarily a desktop app (data entry), but should be readable on 1024px+ screens without horizontal scroll.

---

## Transition & Animation

```css
--transition-fast:   150ms ease;
--transition-base:   200ms ease;
--transition-slow:   300ms ease-in-out;

/* Used for sidebar collapse */
--transition-sidebar: 250ms ease-in-out;

/* Used for modal open/close */
--transition-modal: 200ms ease;
```
