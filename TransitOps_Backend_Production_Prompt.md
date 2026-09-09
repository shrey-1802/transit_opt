# TRANSITOPS — PRODUCTION BACKEND IMPLEMENTATION PROMPT

## ROLE
Act as a Senior Backend Architect and Production API Engineer. Build the TransitOps backend as a secure, modular, testable production service. Inspect the existing repository first and preserve the current backend stack/build conventions where practical.

## SOURCE OF TRUTH
Implement the attached TransitOps requirements:
- Authentication + RBAC
- Vehicle Digital Twin
- Driver Intelligence
- License Compliance Engine
- Smart Dispatch Engine
- Trip State Machine
- Automatic Status Engine
- Maintenance Intelligence
- Fuel Intelligence
- Financial Intelligence
- Operational Analytics
- Alert Center
- AI Copilot
- CSV/PDF reporting where supported
- Email reminders for expiring licenses

Do not replace specified business rules with simplified CRUD behavior.

## PRODUCTION REQUIREMENTS
1. Never hard-code secrets, database passwords, JWT secrets, API keys, SMTP credentials, or storage credentials.
2. Use environment configuration with startup validation.
3. Use a relational database with migrations and indexes appropriate to query patterns.
4. Use DTO/schema validation at every write endpoint.
5. Enforce RBAC and authorization on the server for every protected resource/action.
6. Use transactions for multi-entity state changes.
7. Prevent race conditions when dispatching, completing/cancelling trips, and changing maintenance status.
8. Never trust frontend availability/capacity/role checks.
9. Return consistent HTTP status codes and safe error responses.
10. Never expose stack traces, SQL errors, secrets, or internal implementation details to clients.
11. Add structured logging, request correlation IDs, health checks, and graceful shutdown.
12. Add rate limiting/auth abuse protection where appropriate.
13. Add automated tests for all critical business rules.
14. Provide database migrations and seed data only for development/demo environments.
15. Make the service deployable without manual code edits.

## CORE ENTITIES
Implement at minimum:
- Users
- Roles / permissions
- Vehicles
- Drivers
- Trips
- Maintenance Logs
- Fuel Logs
- Expenses
- Vehicle Documents
- Alerts

Add supporting entities only when required for normalization, auditing, authentication, or reporting.

## AUTHENTICATION + RBAC
Secure login:
- email + password
- password hashing using a modern password-hashing algorithm
- authenticated session/JWT strategy consistent with the existing stack
- token/session expiration
- safe logout/revocation strategy if applicable

Roles:
- Fleet Manager
- Dispatcher / operational dispatch role
- Safety Officer
- Financial Analyst

The source materials use “Driver” in the target-user section but “Dispatcher” for dispatch permissions. Do not create duplicate/conflicting roles. Inspect the existing project contract and use one consistent operational role mapping.

Permissions:
Fleet Manager:
- vehicle CRUD
- maintenance
- analytics
- no finance management

Dispatcher:
- create trips
- assign drivers
- assign vehicles
- complete trips
- cannot delete vehicles

Safety Officer:
- view drivers
- monitor licenses
- suspend drivers
- cannot create expenses

Financial Analyst:
- expenses
- fuel
- ROI
- reports
- cannot dispatch trips

Authorization must be enforced server-side even if the frontend hides the UI.

## VEHICLES — DIGITAL TWIN
Vehicle fields should support:
- unique registration number
- name/model
- type
- maximum load capacity
- odometer
- acquisition cost
- status
- health score
- fuel efficiency
- ROI-related calculations

Vehicle statuses:
- Available
- On Trip
- In Shop
- Retired

Maintain history through related:
- trips
- fuel logs
- maintenance logs
- documents
- profitability data

Vehicle lifecycle:
Purchased → Available → Assigned → On Trip → Maintenance → Available → Retired

Do not allow illegal state transitions.

Registration number must be unique at the database level, not only in application code.

## DRIVER INTELLIGENCE
Driver fields should support:
- name
- license number
- license category
- license expiry date
- contact number
- status
- availability
- safety score
- trips completed
- violation count
- performance score

Driver statuses:
- Available
- On Trip
- Off Duty
- Suspended

Server rules:
- expired license cannot be assigned
- Suspended driver cannot be assigned
- On Trip driver cannot be assigned
- only authorized Safety Officer action can suspend drivers

Health/performance score:
The source describes a 100-based score involving violations, late deliveries, and successful trips. Treat the exact formula as a business rule/configuration rather than duplicating an ambiguous formula across modules.

## LICENSE COMPLIANCE ENGINE
Run a scheduled daily check (the specification describes every midnight).

For drivers whose license expiry is within 30 days:
- create an alert
- create dashboard notification/event as supported
- send email reminder when email delivery is configured

Avoid duplicate alerts/emails for the same driver and expiry period.

Expired licenses must immediately fail dispatch validation.

## SMART DISPATCH ENGINE
This is the central business service. Do NOT implement dispatch as simple CRUD.

When creating/dispatching a trip validate server-side:
1. Vehicle exists
2. Vehicle is Available
3. Vehicle is not In Shop
4. Vehicle is not Retired
5. Driver exists
6. Driver is Available
7. Driver is not Suspended
8. Driver license is valid/not expired
9. Cargo weight <= vehicle maximum load capacity
10. Vehicle/driver are not already committed to another active trip

If any rule fails:
- reject dispatch
- return structured validation errors
- do not partially update vehicle/driver/trip

If all pass:
- dispatch trip
- atomically set vehicle = On Trip
- atomically set driver = On Trip

Use a database transaction and appropriate locking/optimistic concurrency so two simultaneous dispatch requests cannot reserve the same vehicle/driver.

## TRIP STATE MACHINE
Required lifecycle:
Draft → Dispatched → Completed / Cancelled

Operational flow from the architecture specification also includes:
Dispatched → In Progress → Completed

Implement explicit state-transition validation.

Example allowed transitions:
- Draft → Dispatched
- Draft → Cancelled
- Dispatched → In Progress
- Dispatched → Completed if business flow permits
- In Progress → Completed
- Dispatched/In Progress → Cancelled only according to business policy

Reject illegal transitions.

Automatic status engine:
- Dispatch → vehicle On Trip + driver On Trip
- Complete → vehicle Available + driver Available
- Cancel dispatched/active trip → restore vehicle and driver to Available
- Never require manual frontend status edits for these transitions

On completion support:
- final odometer
- fuel consumed
- actual distance where available

Update vehicle odometer and relevant fuel/efficiency analytics atomically.

## MAINTENANCE INTELLIGENCE
Maintenance record should support:
- vehicle
- type/description
- start date
- completion/close date
- cost
- odometer/service data
- status

When an active maintenance record is created:
- transactionally set vehicle = In Shop
- vehicle becomes unavailable for dispatch

When maintenance closes:
- set vehicle = Available unless vehicle is Retired

Do not allow dispatch while In Shop.

Predictive/service calculation:
- current odometer
- last service odometer
- service interval
- next service
- progress toward next service

Example logic:
next service = last service odometer + service interval.

## FUEL INTELLIGENCE
Fuel log:
- vehicle
- liters
- cost
- date
- odometer/distance data where available

Fuel efficiency:
`distance / fuel`

Abnormal fuel detector:
- calculate vehicle baseline/average
- compare current consumption
- create alert when consumption is abnormally poor

Do not label arbitrary threshold logic as AI. Make thresholds/configuration explicit and auditable.

## FINANCIAL INTELLIGENCE
Track:
- trip revenue where available
- fuel cost
- maintenance cost
- tolls
- other expenses
- acquisition cost

Operational cost:
`Fuel + Maintenance` at minimum, with supported additional expenses such as tolls.

ROI:
`(Revenue - (Maintenance + Fuel)) / Acquisition Cost`

Avoid division by zero; return null/undefined with a safe API representation when acquisition cost is zero.

Financial endpoints must obey Financial Analyst permissions.

## ANALYTICS
Provide backend endpoints/services for:
- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization
- Maintenance cost trend
- Fuel cost trend
- Fuel efficiency
- Operational cost
- Vehicle ROI
- Top driver
- Top vehicle
- Worst vehicle
- Vehicles near retirement
- Compliance risk

Support filtering by:
- vehicle type
- status
- region where region exists in the data model
- date range where applicable

Prefer database aggregation over loading the entire dataset into application memory.

## ALERT CENTER
Alert types should cover:
- License expiry
- Vehicle service due
- Maintenance overdue
- High/abnormal fuel cost
- Suspended driver assignment attempt
- Overloaded cargo attempt

Store:
- type
- severity
- title
- message
- related entity
- created timestamp
- read/resolved state if implemented

Dispatch failures caused by business rules should be auditable and may generate an alert/event where appropriate, without exposing sensitive details.

## AI COPILOT
Implement a controlled backend Copilot/query service.

Supported examples:
- highest ROI vehicle
- drivers with expiring licenses
- vehicles in maintenance

SECURITY:
- never execute arbitrary SQL supplied by the user
- use an allowlisted intent/query mapping
- parameterize all values
- return structured data
- enforce the requesting user's RBAC before returning results
- add query timeout/limits
- log copilot intent, not sensitive credentials

A simple rule/intent-based implementation is acceptable; do not require an external LLM unless the project already uses one.

## API STRUCTURE
Create versioned REST APIs, e.g.:
- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/vehicles`
- `/api/v1/drivers`
- `/api/v1/trips`
- `/api/v1/maintenance`
- `/api/v1/fuel`
- `/api/v1/expenses`
- `/api/v1/analytics`
- `/api/v1/alerts`
- `/api/v1/copilot`
- `/api/v1/reports`

Use consistent:
- pagination
- filtering
- sorting
- search
- validation errors
- response envelopes if the existing project uses them

Never expose database entities blindly; use DTOs/serializers.

## REPORTING / EXPORT
Support CSV export for required datasets.
PDF export is required by the deliverables/specification where practical.

Exports must:
- enforce RBAC
- apply requested filters
- avoid unbounded memory usage for large datasets
- stream/download safely where possible
- never expose unauthorized records

## DOCUMENT MANAGEMENT
Vehicle documents:
- metadata in database
- file storage through configured storage provider
- validation for file type/size
- secure upload/download authorization
- no storage secrets in client code
- avoid public exposure of sensitive documents

## DATABASE / INTEGRITY
Add:
- foreign keys
- unique constraints
- indexes for registration number, license number, statuses, trip states, expiry dates, and common reporting filters
- created/updated timestamps
- appropriate audit fields

Use migrations. Never require manually editing production tables.

## ERROR HANDLING
Use a consistent error model containing safe:
- code
- message
- field errors where applicable
- request/correlation ID

Business validation failures should be distinguishable from authentication/authorization/server failures.

## OBSERVABILITY
Provide:
- `/health` or equivalent liveness endpoint
- readiness check including database connectivity
- structured logs
- correlation/request ID
- error logging without secrets
- graceful shutdown
- configurable log level

## SECURITY HARDENING
Implement as appropriate to the framework:
- secure password hashing
- CORS allowlist
- security headers
- rate limiting
- request size limits
- input validation/sanitization
- parameterized queries/ORM
- secure cookies/tokens according to auth strategy
- secret management through environment
- dependency/security checks
- no debug mode in production

## TESTING
Write automated tests for critical business rules:
1. Authentication
2. RBAC permissions
3. Unique vehicle registration
4. Expired-license rejection
5. Suspended-driver rejection
6. On-Trip driver rejection
7. In-Shop/Retired vehicle rejection
8. Cargo > capacity rejection
9. Successful dispatch atomically updates trip/vehicle/driver
10. Completion restores vehicle/driver
11. Cancellation restores vehicle/driver
12. Maintenance moves vehicle to In Shop
13. Maintenance closure restores Available unless Retired
14. Fuel efficiency calculation
15. ROI calculation and zero acquisition-cost handling
16. License-expiry scheduler
17. Analytics aggregation
18. Copilot allowlist/security
19. Export authorization

Include integration tests for transactional dispatch and concurrent assignment.

## DEPLOYMENT
Prepare production configuration:
- environment variables documented in `.env.example`
- database migration command
- seed command for non-production
- build/start commands
- health endpoint
- production logging
- CORS configuration
- frontend API base URL compatibility
- no secrets committed

If Docker/deployment files already exist, update them rather than replacing the project structure unnecessarily.

## FINAL VERIFICATION
Before finishing:
- run formatting
- run lint
- run type checks
- run unit/integration tests
- run database migrations against a clean environment
- run production build
- verify all routes/controllers
- verify all RBAC rules
- verify transaction safety
- verify no hard-coded secrets
- verify no placeholder TODOs in critical paths
- verify API contract matches frontend needs

Return a concise implementation summary including:
- modules created/changed
- database entities/migrations
- API endpoints
- environment variables
- scheduled jobs
- test coverage/results
- build/deployment commands

Build a real production backend, not a CRUD demo.
