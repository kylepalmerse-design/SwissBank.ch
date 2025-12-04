# Helvetia Private Bank - Swiss Private Banking Application

## Overview

Helvetia Private Bank is a luxury multi-user Swiss private banking web application built with modern web technologies. The application provides a sophisticated banking interface inspired by elite Swiss private banks (Julius Baer, Pictet, Lombard Odier), featuring account management, transaction history, and internal/external fund transfers. The system supports multiple users with individual accounts and implements real-time balance updates for internal transfers between users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation

**Design System:**
The application follows a "quiet luxury" design philosophy based on Swiss private banking aesthetics:
- Dark mode as default with light mode support via ThemeProvider
- Custom color palette defined in CSS variables (HSL-based)
- Typography using Inter/DM Sans with precise spacing
- Glassmorphism effects for cards with subtle borders
- Gold (#D4AF37) and platinum (#E5E4E2) accents for CTAs
- Responsive layout with Tailwind breakpoints

**Component Architecture:**
- Reusable UI components in `client/src/components/ui/`
- Feature-specific components (AccountCard, TransferModal, Header)
- Page-level components in `client/src/pages/`
- Utility functions separated into `lib/utils.ts` and `lib/utils-format.ts`

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js
- **Session Management**: express-session with MemoryStore
- **Data Storage**: In-memory storage (MemStorage class)
- **Build System**: Vite for frontend, esbuild for backend

**API Design:**
RESTful API endpoints:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/user` - Retrieve authenticated user data
- `POST /api/transfer` - Process fund transfers

**Session Management:**
- Cookie-based sessions using express-session
- Session data stored in memory (MemoryStore)
- 24-hour session expiry
- Secure cookies in production (httpOnly, secure flags)

**Data Architecture:**
User data is stored in `server/lib/users-data.ts` as a simple TypeScript object:
- Each user has username, password, name, accounts array, and transactions array
- Each user has exactly 3 accounts: Private Account, Savings Account, Investment Portfolio
- All accounts use CHF currency
- IBANs follow valid Swiss format (CH + check digits + bank/account numbers)

**Transfer Logic:**
- Internal transfers: If recipient IBAN matches another user's account, funds move instantly between accounts
- External transfers: Recorded as outgoing transactions if IBAN doesn't match any user account
- Fee calculation: CHF 0 for internal, configurable for external
- Real-time balance updates on successful transfers

### Data Storage Solutions

**In-Memory Storage (MemStorage):**
- Implements IStorage interface for potential future database migration
- Methods: authenticateUser, getUser, createTransfer
- User data mutations happen directly on the users object
- Transaction history appended to both sender and recipient (for internal transfers)

**Schema Definitions:**
Located in `shared/schema.ts`:
- Zod schemas for runtime validation (loginSchema, transferSchema)
- TypeScript interfaces for type safety (User, Account, Transaction, UserData)
- Shared between frontend and backend for consistency

### Authentication and Authorization

**Authentication Flow:**
1. User submits credentials via login form
2. Backend validates against users-data.ts
3. On success, username stored in session
4. Session cookie returned to client
5. Subsequent requests include session cookie automatically

**Authorization:**
- Protected routes check for session presence
- Frontend redirects to /login if user query returns null
- No token-based auth - relies on server-side sessions

**Security Considerations:**
- Passwords stored in plain text (development/demo system)
- Session secret configurable via environment variable
- CSRF protection not implemented (should be added for production)

### External Dependencies

**Core Dependencies:**
- **@neondatabase/serverless**: Database driver (PostgreSQL compatible, though currently using in-memory storage)
- **drizzle-orm**: Type-safe ORM (configured but not actively used)
- **drizzle-kit**: Database migration toolkit
- **express-session**: Session middleware
- **memorystore**: Memory-based session store

**Frontend Libraries:**
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives (17 packages for various components)
- **react-hook-form**: Form state and validation
- **@hookform/resolvers**: Zod integration for forms
- **zod**: Schema validation
- **wouter**: Lightweight routing
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Variant-based component styling
- **clsx & tailwind-merge**: Class name utilities

**Development Tools:**
- **vite**: Frontend build tool and dev server
- **@vitejs/plugin-react**: React support for Vite
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **tsx**: TypeScript execution for development
- **esbuild**: Backend bundler for production builds

**Database Configuration:**
- Drizzle configured for PostgreSQL dialect
- Connection via DATABASE_URL environment variable
- Schema defined in `shared/schema.ts`
- Migrations output to `./migrations` directory
- Note: Currently not actively used as data is in-memory

**Build and Deployment:**
- Development: Vite dev server with HMR
- Production: Static frontend build + bundled Express server
- Separate index files for dev (`index-dev.ts`) and prod (`index-prod.ts`)
- Build outputs to `dist/` directory