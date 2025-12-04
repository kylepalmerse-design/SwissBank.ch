# Swiss Private Banking Design Guidelines

## Design Approach
**Reference-Based Approach**: Draw primary inspiration from elite Swiss private banks:
- **Julius Baer**: Sophisticated dark interfaces with gold accents
- **Pictet**: Clean minimalism with premium typography
- **Lombard Odier**: Restrained elegance and discreet wealth displays
- **UBS**: Professional banking aesthetics with modern touches

Key principle: *Quiet luxury* - expensive without being ostentatious, discreet yet confident.

## Core Design Elements

### Typography
**Hierarchy & Families**:
- Primary font: Inter or similar Swiss-style sans-serif for precision and clarity
- Secondary: SF Pro or system fonts for optimal readability
- Headings: 600-700 weight, tight letter-spacing (-0.02em)
- Balance displays: 700-800 weight, 2xl-4xl sizes for prominence
- Body text: 400-500 weight, relaxed line-height (1.6)
- Micro-copy (IBANs, dates): 400 weight, text-sm with monospace numbers

### Color Strategy
**Dark Mode (Default)**:
- Background: Deep charcoal/navy (#0A0F1C to #121827)
- Cards: Glassmorphism with subtle borders (rgba(255,255,255,0.1))
- Text: Off-white (#F8FAFC) for primary, muted gray (#94A3B8) for secondary
- Accents: Subtle gold (#D4AF37) or platinum (#E5E4E2) for CTAs and highlights
- Success: Muted green, Error: Muted red (never vibrant)

**Light Mode**:
- Background: Soft white (#FAFBFC) to warm gray (#F5F5F4)
- Cards: White with subtle shadows
- Text: Charcoal (#1E293B) primary, gray (#64748B) secondary
- Same accent philosophy: understated luxury

### Layout System
**Spacing**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Page padding: px-4 md:px-8 lg:px-12
- Section spacing: space-y-8 to space-y-12
- Card padding: p-6 to p-8
- Component gaps: gap-4 to gap-6

**Container Strategy**:
- Dashboard: max-w-7xl mx-auto
- Forms/modals: max-w-2xl
- Transaction lists: max-w-6xl

## Component Library

### Navigation
- Minimal top header with logo, dark/light toggle, user menu
- Navigation links subtle and understated
- Logout discretely positioned (not prominently displayed)

### Dashboard Cards (Glassmorphism)
- Semi-transparent backgrounds with backdrop blur
- Subtle border (1px, low opacity white/dark)
- Hover: Gentle lift (transform translateY(-2px))
- Shadow: Soft, elevated (not harsh)
- Account name and type in subtle text
- Swiss IBAN in monospace, smaller font
- Balance: Large, bold typography (text-3xl to text-4xl)
- Micro sparkline chart (simple, monochromatic)
- "Transfer" button: Minimal, text-based or ghost style

### Transfer Modal
- Centered overlay with backdrop blur
- Clean white/dark card (depending on theme)
- Form fields with labels above inputs
- IBAN validation indicator (subtle check/cross)
- Fee display in muted text
- Primary CTA: "Confirm Transfer" (solid, understated)
- Success state: Subtle confetti (library-based, 2-3 second duration)

### Transaction List
- Table or card-based rows
- Incoming/outgoing indicators: + (green) / - (red) with amounts
- Date: Secondary text, right-aligned
- Counterparty/IBAN: Primary line item
- Filters: Minimal dropdowns for account and date range

### Login Page
- Centered form (max-w-md)
- Subtle gradient background (deep blues to blacks in dark mode)
- Logo at top
- Two clean input fields (login, password)
- Single prominent "Client Login" button
- No clutter, no marketing copy

### Landing Page (Minimalist)
- Hero section: Clean typography stating bank values
- No large imagery (Swiss banks prefer restraint)
- Single prominent "Client Login" CTA
- Optional: Brief 2-3 line tagline about discretion/wealth management
- Footer: Minimal with legal links

### Accounts Page
- Individual account cards similar to dashboard
- Full transaction history below
- IBAN prominently displayed
- Downloadable statement option (text link)

## Responsive Behavior
**Mobile (< 768px)**:
- Single column layout
- Cards stack vertically with full width
- Account cards: Slightly reduced padding (p-4)
- Balance typography scales down (text-2xl)
- Navigation: Hamburger or bottom tab bar (Pictet/UBS style)
- Modal: Full-screen on mobile

**Desktop (≥ 768px)**:
- Three-column grid for account cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Spacious padding throughout
- Modal: Centered with max-w-2xl

## Animations & Interactions
- **Minimize motion**: Respect Swiss restraint
- Card hover: Subtle elevation (150ms ease)
- Transfer success: Confetti (2s duration, auto-dismiss)
- Page transitions: Minimal or none
- Loading states: Subtle skeleton screens (not spinners)
- No distracting scroll animations

## Images
**No hero images**. Swiss private banking emphasizes discretion over visual spectacle. The interface IS the luxury.

## Key Differentiators
- **Trust over flash**: Every element reinforces stability and security
- **Clarity in wealth display**: Balances are clear, prominent, never obscured
- **Efficient interactions**: One-click access to critical functions
- **Professional restraint**: No gamification, no promotional elements
- **Mobile parity**: Mobile experience matches desktop in functionality and refinement