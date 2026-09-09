# TRANSITOPS — PRODUCTION FRONTEND IMPLEMENTATION PROMPT

## ROLE
Act as a Senior Frontend Architect and Production UI Engineer. Build the complete TransitOps frontend from the repository/specification, not a mockup. Inspect the existing project first and preserve the current framework/build system where practical.

## SOURCE OF TRUTH
Implement the attached TransitOps requirements:
- Smart transport operations platform
- Authentication + RBAC
- Vehicle Digital Twin
- Driver Intelligence + license compliance
- Smart Dispatch Engine
- Maintenance Intelligence
- Fuel Intelligence
- Financial Intelligence
- Operational Analytics
- Alert Center
- AI Copilot

Do not invent business rules that conflict with the specification.

## PRODUCTION RULES
1. Use environment variables for API URLs and runtime configuration. Never hard-code secrets.
2. Connect UI to real backend APIs through a typed API/service layer; do not rely on fake data in production flows.
3. Add loading, empty, validation, success, error, unauthorized (401/403), and network-failure states.
4. Protect routes and actions according to RBAC. Never rely only on hiding buttons; backend authorization is authoritative.
5. Use reusable components, typed models, centralized API handling, form validation, error handling, and consistent state management.
6. Make the UI responsive for desktop, tablet, and mobile.
7. Prevent duplicate submissions and unsafe repeated mutations.
8. Confirm destructive actions.
9. Do not expose tokens, credentials, stack traces, or sensitive backend errors.
10. Build production-ready code with no placeholder TODOs in core functionality.

## DESIGN SYSTEM
Visual direction: premium B2B operations dashboard; classy, advanced, minimal.

Theme:
- Primary: sophisticated Olive Green
- Accent: elegant Beige
- Structural neutrals: soft off-white / deep charcoal
- Light mode: beige-toned canvas, white cards, olive headings/CTAs
- Dark mode: charcoal/muted olive canvas, beige typography/highlights
- Avoid generic bright red/green status styling; use restrained olive/beige status variants.
- Minimal borders, no heavy shadows, generous spacing, precise typography.
- Smooth but restrained micro-interactions.

Global shell:
- Persistent collapsible left sidebar
- Sticky top header
- Breadcrumb/context area where useful
- Global dark-mode toggle
- Responsive navigation
- User/role context
- Toast/notification system
- Accessible keyboard navigation and focus states

## ROUTES / VIEWS

### Auth
- `/login`
- `/403`
- Protected application routes after authentication.

Login:
- Email + password
- Validation
- Loading state
- API error handling
- Secure token/session handling
- Dark-mode toggle

### Dashboard
Show 7 KPIs:
- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization %

Filters:
- Vehicle type
- Status
- Region

Charts:
- Vehicle ROI trend
- Weekly fuel logs
- Maintenance cost trend
- Fuel cost trend where backend data exists

### Vehicle Registry
Table:
- Registration Number
- Model/Name
- Type
- Maximum Load Capacity
- Odometer
- Acquisition Cost
- Status

Features:
- Search
- Sorting
- Filtering
- Pagination
- Add/Edit drawer or modal
- Vehicle details / Digital Twin view
- Document management upload UI
- Trip history
- Fuel logs
- Maintenance history
- Profitability/ROI
- Health score
- Fuel efficiency

Vehicle statuses:
Available, On Trip, In Shop, Retired.

Do not allow Retired or In Shop vehicles in dispatch selection.

### Driver Management
Table:
- Name
- License Number
- License Category
- Expiry Date
- Contact Number
- Safety Score
- Status

Show:
- Availability
- Trips completed
- Violation count
- Performance score
- License validity
- Expiry warning when <30 days
- Suspend action for authorized Safety Officer

Driver statuses:
Available, On Trip, Off Duty, Suspended.

Expired-license and Suspended drivers must never be selectable for dispatch.

### Trip Management / Smart Dispatch
Trip list and lifecycle visualization.

Canonical lifecycle:
Draft → Dispatched → Completed / Cancelled

Operational state may include:
Dispatched → In Progress → Completed

Create trip with:
- Source
- Destination
- Vehicle
- Driver
- Cargo weight
- Planned distance

Before dispatch, clearly show validation results:
- Vehicle available
- Driver available
- License valid
- Vehicle capacity sufficient
- Vehicle not in maintenance
- Vehicle/driver not already On Trip

If cargo weight > vehicle capacity:
- Block dispatch
- Show exact validation reason

Do not show/allow:
- In Shop vehicles
- Retired vehicles
- On Trip vehicles
- Suspended drivers
- Expired-license drivers
- On Trip drivers

After successful dispatch, refresh authoritative backend state so vehicle and driver display On Trip automatically.

### Maintenance
- Maintenance records
- Create/edit/close maintenance
- Vehicle maintenance timeline
- Current odometer
- Last service odometer
- Service interval
- Next service
- Progress toward next service
- Maintenance cost

Workflow:
Create active maintenance → vehicle becomes In Shop → removed from dispatch pool → close maintenance → Available unless Retired.

### Fuel & Expenses
Fuel log:
- Vehicle
- Liters
- Cost
- Date

Other expenses:
- Toll
- Maintenance
- Other supported expense types

Display:
- Fuel cost
- Maintenance cost
- Total operational cost
- Fuel efficiency = distance / fuel

### Reports & Analytics
Show:
- Fuel Efficiency
- Fleet Utilization
- Operational Cost
- Vehicle ROI

ROI:
`(Revenue - (Maintenance + Fuel)) / Acquisition Cost`

Provide:
- Date/filter controls where supported
- CSV export
- PDF export if backend supports it
- Export loading/error/success states

### Alert Center
Mission-control style alert list.

Support:
- License expiry
- Vehicle service due
- Maintenance overdue
- High fuel cost / abnormal consumption
- Suspended-driver assignment attempt
- Overloaded cargo attempt

Alerts should have:
- severity
- title
- description
- timestamp
- read/unread state if API supports it
- related entity/action

### AI Copilot
Build a secure assistant UI for supported operational queries such as:
- Highest ROI vehicle
- Drivers with expiring licenses
- Vehicles currently in maintenance

Do not send arbitrary user-generated SQL from the browser.
Call a backend-approved Copilot endpoint/query service.

## RBAC UI
Roles required by the specification:
- Fleet Manager
- Dispatcher / operational dispatch role
- Safety Officer
- Financial Analyst

The source materials use both “Driver” and “Dispatcher” terminology for dispatch responsibilities. Do not create conflicting duplicate permissions. Inspect the backend contract/repository and map the existing operational role consistently.

Permission examples:
Fleet Manager:
- Vehicle CRUD
- Maintenance
- Analytics
- Cannot manage finance

Dispatcher:
- Create trips
- Assign drivers
- Assign vehicles
- Complete trips
- Cannot delete vehicles

Safety Officer:
- View drivers
- Monitor licenses
- Suspend drivers
- Cannot create expenses

Financial Analyst:
- Expenses
- Fuel
- ROI
- Reports
- Cannot dispatch trips

Implement route guards + action guards + UI visibility, while treating backend authorization as final authority.

## DIGITAL TWIN UX
Vehicle detail should feel like a mini ERP:
Overview | Trips | Fuel | Maintenance | Profitability

Display:
- Registration
- Model
- Purchase/acquisition cost
- Capacity
- Current odometer
- Status
- Health score
- Fuel efficiency
- ROI
- Maintenance history

Vehicle lifecycle:
Purchased → Available → Assigned → On Trip → Maintenance → Available → Retired

Represent this visually without allowing the frontend to directly force illegal state transitions.

## DRIVER INTELLIGENCE UX
Driver health/performance:
- Availability
- Safety score
- Trips completed
- Violation count
- License validity
- Performance score

The source describes a health-score concept based on 100 minus violations/late deliveries plus successful trips. Treat the backend-calculated score as authoritative; do not duplicate an unverified formula in the frontend.

## API / DATA LAYER
Create typed services for:
- auth
- users/roles
- vehicles
- vehicle documents
- drivers
- trips
- maintenance
- fuel
- expenses
- analytics/reports
- alerts
- copilot

Centralize:
- base URL
- auth headers
- token/session handling
- refresh/re-auth behavior if supported
- API error normalization
- request cancellation where useful

Never couple pages directly to raw HTTP calls.

## FORMS
Use schema-based validation and clear inline messages.
Validate client-side for UX, but expect server-side validation to reject invalid requests.
Handle:
- duplicate registration number
- invalid dates
- invalid numeric values
- cargo > capacity
- unavailable vehicle/driver
- expired/suspended driver
- maintenance/retired vehicle
- unauthorized action

## DOCUMENT UPLOAD
Implement secure upload UI:
- drag/drop
- file picker
- progress
- success/error state
- allowed type/size feedback from backend contract
- never expose storage credentials or signed URLs unnecessarily

## PERFORMANCE
- Lazy-load heavy pages/components
- Paginate large tables
- Debounce search
- Avoid unnecessary API calls
- Cache safe read-only data where appropriate
- Virtualize very large lists if needed
- Optimize charts and assets

## ACCESSIBILITY
Meet practical WCAG expectations:
- semantic controls
- keyboard navigation
- visible focus
- accessible labels
- sufficient contrast
- screen-reader-friendly status/error messages

## TESTING
Add tests for critical flows:
1. Login and protected routes
2. RBAC/403
3. Vehicle CRUD validation
4. Driver license validation
5. Cargo-capacity dispatch blocking
6. Vehicle/driver unavailable states
7. Maintenance state display
8. Trip completion/cancellation refresh
9. Dashboard KPI rendering
10. Export actions
11. Error/loading/empty states

## DELIVERY
Before finishing:
- Run lint/type checks/tests/build.
- Fix all compile/runtime errors.
- Verify production environment configuration.
- Verify all routes.
- Verify API integration.
- Verify responsive layout.
- Verify dark mode.
- Verify RBAC behavior.
- Verify no secrets are committed.
- Verify no mock data remains in production paths.
- Provide a concise list of implemented routes, API dependencies, environment variables, and build/run commands.

Build the result as a real production frontend, not a visual prototype.
