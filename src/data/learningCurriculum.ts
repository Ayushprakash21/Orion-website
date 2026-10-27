export interface Lesson {
  id: string;
  moduleId: string;
  lessonIndex: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  isPlannedFeature?: boolean;
  summary: string;
  keyTakeaways: string[];
  content: string;
  durationMinutes?: number;
  objective?: string;
  level?: string;
  scenarioCheck?: { question: string; answer: string };
}

export interface LearningModule {
  id: string;
  moduleIndex: number;
  title: string;
  description: string;
  iconName: string;
  category: 'Fundamentals' | 'Interface' | 'Workflows' | 'Intelligence' | 'Governance' | 'Support';
  lessons: Lesson[];
  code?: string;
  level?: string;
  estimatedHours?: string;
}

export const ORION_LEARNING_CURRICULUM: LearningModule[] = [
  {
    id: 'module-1',
    moduleIndex: 1,
    title: 'Introduction to Orion-9',
    description: 'Understand the core architectural philosophy, operating system paradigm, and essential supply chain concepts of Orion-9.',
    iconName: 'Compass',
    category: 'Fundamentals',
    lessons: [
      {
        id: 'm1-l1',
        moduleId: 'module-1',
        lessonIndex: 1,
        title: 'What Is Orion-9?',
        subtitle: 'The intelligence layer and operating system for modern enterprise supply chains.',
        estimatedMinutes: 4,
        summary: 'Learn why Orion-9 was built as an operating system rather than a traditional static dashboard.',
        keyTakeaways: [
          'Orion-9 is a desktop-grade Supply Chain Operating System combining web and native runtimes.',
          'It replaces fragmented spreadsheets and siloed ERP portals with unified real-time intelligence.',
          'Features 19 deterministic supply chain engines backed by Google Cloud Firestore and fail-closed security.',
        ],
        content: `### The Problem with Fragmented Supply Chains
Modern global supply chains suffer from disjointed enterprise software: ERPs that take minutes to execute queries, disconnected spreadsheets that drift out of sync within hours, and critical logistics disruptions communicated via email threads after cargo is already delayed.

### The Orion-9 Vision
**Orion-9** is engineered from the ground up as a high-performance **Supply Chain Operating System (OS)**. Rather than forcing operators to switch browser tabs between procurement, inventory, telemetry, and invoicing systems, Orion-9 unifies all operational workflows into an enterprise desktop environment.

\`\`\`
Traditional Stack:  [Siloed ERP] <---> [Spreadsheets] <---> [Manual Emails]
Orion-9 Paradigm:   [Multi-Window OS Shell] ---> [Authoritative Kernel Bus] ---> [19 Real-Time Engines]
\`\`\`

### Architectural Foundations
1. **Operating System Paradigm**: Draggable, resizable, minimizable application windows with native keyboard shortcuts and dynamic spatial organization.
2. **Deterministic Business Authority**: Business formulas (Available-to-Promise, Cash Conversion Cycle, 3-Way Match) are strictly executed by deterministic TypeScript engines, never probabilistic guesswork.
3. **Fail-Closed Zero Trust**: Access control enforces cryptographic verification on every read and write transaction.
4. **Governed AI Integration**: The Orion Copilot operates within transparent tool boundaries where high-consequence operations require explicit human approval.`,
      },
      {
        id: 'm1-l2',
        moduleId: 'module-1',
        lessonIndex: 2,
        title: 'Understanding the Orion-9 Interface',
        subtitle: 'A tour of the Liquid Glass material design, layout hierarchy, and ergonomics.',
        estimatedMinutes: 4,
        summary: 'Discover how the Apple-inspired Liquid Glass design system enhances operator focus and situational awareness.',
        keyTakeaways: [
          'Liquid Glass provides realistic optical depth, edge highlights, and spatial hierarchies.',
          'Dark Midnight palette is optimized for 24/7 mission control rooms to minimize eye strain.',
          'Responsive design ensures equal ergonomics across 4K wall monitors, laptops, and mobile devices.',
        ],
        content: `### The Liquid Glass Material Engine
Orion-9 utilizes an advanced **Liquid Glass Material Engine**. Rather than decorative glassmorphism, our materials serve clear functional roles:

* **Clear Glass**: Used for floating pills, status badges, and transient scenario selectors to maximize underlying visibility.
* **Regular Liquid Glass**: The primary navigation layer, framing window title bars, taskbars, and command palettes.
* **Content Surfaces**: High-opacity, low-reflection substrates that ensure maximum readability for tables, stock lists, and sensor graphs.
* **Elevated Glass**: Reserved for high-priority modal windows, download interfaces, and disruption alerts.

\`\`\`
Layer 4: [ Elevated Modals & Dynamic Island ] -> Highest z-index & specular sheen
Layer 3: [ Floating Windows & Title Bars ]    -> Mid-level glass blur & edge rim
Layer 2: [ Content Grids & Tables ]          -> High contrast, minimal reflection
Layer 1: [ Ambient Canvas & Deep Navy Base ]  -> 24/7 control-room dark canvas
\`\`\`

### Ergonomic Color Tokens
* **Canvas Background**: Deep midnight navy (\`#030712\` / \`#050C16\`) prevents retina burnout during night shifts.
* **Cyan Telemetry Accent**: Hex \`#00D2FF\` highlights nominal operational flow and primary actions.
* **Amber / Rose Alert Accents**: Hex \`#F59E0B\` and \`#EF4444\` indicate corridor bottlenecks and critical stockout risks.`,
      },
      {
        id: 'm1-l3',
        moduleId: 'module-1',
        lessonIndex: 3,
        title: 'Navigating the OS',
        subtitle: 'Mastering the multi-window desktop shell, bottom dock, and system controls.',
        estimatedMinutes: 5,
        summary: 'Learn window management shortcuts, snapping, minimizing, and multi-tasking.',
        keyTakeaways: [
          'Windows can be dragged by their titlebars and resized from any border handle.',
          'Double-clicking titlebars maximizes windows; pressing Win+Up/Down snaps geometry.',
          'The Dock hosts pinned applications, running status indicators, and the Application Launcher.',
        ],
        content: `### Multi-Window Stacking & Management
In Orion-9, applications operate inside isolated window frames. The Window Manager coordinates active z-indexes, geometry constraints, and layout snapping.

| Window Control | Mouse Action | Keyboard Shortcut |
| :--- | :--- | :--- |
| **Move** | Drag Titlebar | Drag |
| **Resize** | Drag any window edge/corner | - |
| **Maximize / Restore** | Double-click titlebar or Green traffic light | \`Win + Up\` / \`Alt + F10\` |
| **Minimize to Dock** | Click Yellow traffic light | \`Win + Down\` |
| **Close Application** | Click Red traffic light | \`Alt + W\` / \`Cmd + W\` |
| **Quick Command Palette** | Click Search Icon | \`Alt + Space\` |

### Dock Ergonomics
The bottom **Application Dock** serves as your launchpad:
1. **Running Indicators**: A glowing cyan dot appears below applications with active running instances.
2. **Context Menus**: Right-clicking any dock icon opens quick controls: *Restore*, *Minimize*, *Open New Window*, or *Force Close*.
3. **Auto-Hide Mode**: When an application is maximized, the dock smoothly retracts to provide maximum vertical canvas, reappearing when hovering near the bottom bezel.`,
      },
      {
        id: 'm1-l4',
        moduleId: 'module-1',
        lessonIndex: 4,
        title: 'Understanding the Main Dashboard',
        subtitle: 'Navigating the Intelligent Control Tower and global logistics telemetry.',
        estimatedMinutes: 5,
        summary: 'Explore the Executive Posture bar, multimodal corridor map, and exception counters.',
        keyTakeaways: [
          'The Control Tower aggregates road, rail, air, and maritime freight telemetry in real time.',
          'The Executive Posture Bar monitors OTIF, SLA integrity, and capital exposure.',
          'Disruption radar categorizes exceptions into Low, Medium, High, and Critical severities.',
        ],
        content: `### The Control Tower Overview
The **Supply Chain Control Tower** (\`src/components/Dashboard.tsx\`) is the mission control center of Orion-9. It monitors global supply chain vitality across four unified dimensions:

\`\`\`
1. Executive Posture -> Global OTIF (98.4%) | Working Capital ($14.2M) | SLA (99.1%)
2. Corridor Map     -> Active transit across Malacca Strait, Suez Canal, Trans-Pacific
3. Inventory Heath  -> Multi-facility stock, safety stock levels, burn rates
4. Exception Radar  -> Port strikes, customs hold-ups, weather anomalies
\`\`\`

### Reading Key Performance Indicators (KPIs)
* **On-Time In-Full (OTIF)**: Percentage of customer orders delivered on time without missing line items. Standard benchmark: > 98.0%.
* **SLA Integrity**: Measures contractual fulfillment compliance against tier-1 enterprise customer agreements.
* **Active Disruption Counter**: Live tally of transit delays or facility stockouts requiring immediate human or automated mitigation.`,
      },
      {
        id: 'm1-l5',
        moduleId: 'module-1',
        lessonIndex: 5,
        title: 'Essential Terminology',
        subtitle: 'Key concepts and acronyms used throughout the Orion-9 ecosystem.',
        estimatedMinutes: 5,
        summary: 'A reference glossary of supply chain metrics, documents, and protocols.',
        keyTakeaways: [
          'ATP: Available-to-Promise calculated deterministically from stock on hand and allocations.',
          'ASN: Advance Shipping Notice electronic dispatch document detailing items in transit.',
          'GRN & 3-Way Match: Goods Received Note matched against Purchase Orders and Invoices.',
        ],
        content: `### Core SCM Acronyms in Orion-9

#### 1. ATP (Available-to-Promise)
The uncommitted portion of inventory available to fulfill incoming customer orders. Calculated deterministically:
$$\\text{ATP} = \\text{Stock On Hand} - \\text{Allocated Orders} + \\text{Scheduled Receipts} - \\text{Safety Stock}$$

#### 2. ASN (Advance Shipping Notice)
An electronic EDI document (EDI 856) sent by a supplier prior to physical arrival, detailing pallet counts, container numbers, and line-item quantities.

#### 3. BoL (Bill of Lading)
The legally binding contract between shipper and multimodal carrier documenting carriage terms, cargo description, and destination.

#### 4. GRN (Goods Received Note)
The receipt document issued at the warehouse intake dock confirming physical inspection, barcode scan, and carton count.

#### 5. 3-Way Invoicing Match
The accounting reconciliation pipeline validating:
$$\\text{Purchase Order (Unit Price)} \\equiv \\text{GRN (Received Quantity)} \\equiv \\text{Supplier Invoice (Billed Total)}$$`,
      },
    ],
  },
  {
    id: 'module-2',
    moduleIndex: 2,
    title: 'Getting Started',
    description: 'Learn how to authenticate, understand your role privileges, find tools, and customize your workspace.',
    iconName: 'UserCheck',
    category: 'Fundamentals',
    lessons: [
      {
        id: 'm2-l1',
        moduleId: 'module-2',
        lessonIndex: 1,
        title: 'Signing In and Accessing the OS',
        subtitle: 'Credentials, multi-factor authentication, and environment selection.',
        estimatedMinutes: 4,
        summary: 'Authenticate securely into Orion-9 using corporate credentials or Google Workspace SSO.',
        keyTakeaways: [
          'Sign in with corporate email or normalized username via Firebase Authentication.',
          'Select between LIVE Mode (Cloud Firestore tenant) and DEMO Mode (synthetic sandbox).',
          'Enterprise tokens enforce 60-minute cryptographic refresh lifecycles.',
        ],
        content: `### Authentication Workflow
To access Orion-9:
1. Navigate to \`/login\` or click **Sign In** in the top navigation bar.
2. Enter your registered **Username** or verified **Corporate Email Address**.
3. Choose **Remember Username** if using an assigned corporate workstation.
4. For single-click corporate access, click **Sign In with Google Workspace**.

### Environment Selection
* **LIVE Production**: Connects directly to your enterprise Cloud Firestore tenant. Every order, inventory update, and transit milestone is immutably committed.
* **DEMO Sandbox**: Loads deterministic synthetic scenarios (nominal supply chain flow, port disruption, autonomous bypass) for safe training without mutating live records.`,
      },
      {
        id: 'm2-l2',
        moduleId: 'module-2',
        lessonIndex: 2,
        title: 'Understanding Your User Account',
        subtitle: 'Role-Based Access Control (RBAC) and operational boundaries.',
        estimatedMinutes: 4,
        summary: 'Understand the permissions, capabilities, and boundaries assigned to your operator role.',
        keyTakeaways: [
          'Roles are assigned server-side in Cloud Firestore and custom claims.',
          'SCM Operators execute orders and shipments; Planners evaluate forecasts and scenarios.',
          'Administrators manage users, branding, system configurations, and security policies.',
        ],
        content: `### Orion-9 Role Matrix
Orion-9 enforces strict Role-Based Access Control (RBAC):

| Role | Operational Scope | Typical Responsibilities |
| :--- | :--- | :--- |
| **PLATFORM_ADMIN** | Global / All Tenants | Branding, tenant provisioning, system security rules |
| **TENANT_ADMIN** | Single Tenant | User onboarding, approval thresholds, integration endpoints |
| **SCM_OPERATOR** | Operations & Logistics | PO creation, receiving gate scanning, GRN issuance |
| **SCM_PLANNER** | Planning & Scenarios | Demand forecasting, scenario simulation, inventory safety buffers |
| **AUDITOR** | Compliance | Read-only ledger inspection, event fabric replay, SLA review |

### How to Check Your Permissions
Your active role and verification badge are visible in the top system bar and User Dashboard header. If a module displays *Access Denied*, contact your designated Tenant Administrator.`,
      },
      {
        id: 'm2-l3',
        moduleId: 'module-2',
        lessonIndex: 3,
        title: 'Navigating the Main Workspace',
        subtitle: 'Launching applications via the Command Palette, Launcher grid, and Dock.',
        estimatedMinutes: 4,
        summary: 'Speed up daily workflows with keyboard navigation and quick-switch gestures.',
        keyTakeaways: [
          'Press Alt+Space (or Cmd+Space) to invoke the Command Palette from anywhere.',
          'Type keywords or category hashtags like #ops, #ai, #admin to filter applications.',
          'Pin your most frequently used tools directly to the Dock for instant access.',
        ],
        content: `### Speed Navigation via Command Palette
The **Command Palette** is your fastest route to any tool in Orion-9:
1. Press \`Alt + Space\` on Windows or \`Cmd + Space\` on macOS.
2. Type partial names:
   * \`inv\` -> Opens Inventory Control
   * \`po\` -> Opens Purchase Order Manager
   * \`gate\` -> Opens Inbound Receiving Gate
   * \`copilot\` -> Opens Orion AI Assistant
3. Press \`Enter\` to launch immediately into the active viewport.

### Category Hashtags
* \`#ops\` — Operations (Command Center, Shipments, Warehouse)
* \`#plan\` — Planning & Analytics (Predictions, Scenarios, Demand Lift)
* \`#intel\` — Intelligence (Risk Radar, Corridor Topology)
* \`#gov\` — Governance (Approval Matrix, Audit Logs, Policies)`,
      },
      {
        id: 'm2-l4',
        moduleId: 'module-2',
        lessonIndex: 4,
        title: 'Finding Features and Tools',
        subtitle: 'An introduction to the 118-application modular catalog.',
        estimatedMinutes: 5,
        summary: 'Discover how 118 applications are organized across 6 functional domains.',
        keyTakeaways: [
          'Applications are grouped into Operations, Control, Platform, Intelligence, AI, and System.',
          'Each application declares its tenant boundaries, default layout, and supported device modes.',
          'Search the catalog directly in the Documentation Library or Launcher.',
        ],
        content: `### The 118-Application Catalog
Orion-9 provides a comprehensive suite of 118 dedicated tools:

* **Operations (26 Apps)**: Purchasing, ASN Tracking, Inbound Gate, Outbound Wave Picking, Stock Transfers, Cycle Counts.
* **Control (24 Apps)**: Autonomous Command, Policy Rules, Exceptions, Disruption Radar, SLA Compliance.
* **Platform (27 Apps)**: Integration Fabric, Master Data Center, Entity Registry, Sync Monitor, Audit Logs.
* **Intelligence (25 Apps)**: Demand Lift, Multi-Echelon Inventory Optimization, ESG Scope 1/2/3, Scenario Lab.
* **AI (5 Apps)**: Orion Copilot, Mission Engine, AI Workforce Center, Prompt Studio.
* **System (11 Apps)**: Personalization, Hardware Diagnostics, Display Preferences, About Orion-9.`,
      },
      {
        id: 'm2-l5',
        moduleId: 'module-2',
        lessonIndex: 5,
        title: 'Personalization and Preferences',
        subtitle: 'Themes, typography scaling, wallpaper gallery, and accessibility settings.',
        estimatedMinutes: 4,
        summary: 'Customize the visual environment to match your hardware setup and lighting conditions.',
        keyTakeaways: [
          'Choose between Deep Midnight, Cyber Slate, Obsidian Pure, and Horizon Day themes.',
          'Adjust UI scale (85% to 125%) and typography size for accessibility.',
          'Enable Reduced Motion to replace 3D kinetic transitions with instant fades.',
        ],
        content: `### Customizing Your Experience
Open **Settings** (\`/settings\`) or click the Theme Toggle icon:

1. **Enterprise Themes**:
   * *Deep Midnight*: Default dark canvas calibrated for low-glare control rooms.
   * *Obsidian Pure*: Pure #000000 black theme for OLED monitors and battery saving.
   * *Horizon Day*: Crisp high-contrast light theme for mobile field inspections.
2. **Accessibility Calibration**:
   * *UI Scaling*: Scale from 85% (dense data viewing) to 125% (large screen comfort).
   * *Reduced Motion*: Automatically respects your operating system preference, substituting subtle fades for dynamic transforms.`,
      },
    ],
  },
  {
    id: 'module-3',
    moduleIndex: 3,
    title: 'Working with the Interface',
    description: 'Master advanced layout controls, data tables, Dynamic Island status indicators, and shortcuts.',
    iconName: 'Layout',
    category: 'Interface',
    lessons: [
      {
        id: 'm3-l1',
        moduleId: 'module-3',
        lessonIndex: 1,
        title: 'Understanding Navigation and Panels',
        subtitle: 'System bar metrics, breadcrumbs, split panes, and side drawers.',
        estimatedMinutes: 4,
        summary: 'Learn how panels adapt across different screen sizes and operational tasks.',
        keyTakeaways: [
          'Top System Bar shows active app, network ping, time, and quick controls.',
          'Split panels allow side-by-side inspection of Purchase Orders and Invoices.',
          'Side drawers provide contextual detail without losing your primary working list.',
        ],
        content: `### Screen Anatomy
1. **Top System Bar (Height: 40px)**:
   * Left: Orion-9 logo, active application title, breadcrumb trail.
   * Center: Dynamic Island status capsule.
   * Right: Network ping, system clock, user operator pill, control center.
2. **Main Workspace Canvas**:
   * Free-form desktop or maximized single application.
3. **Bottom Application Dock (Height: 56px)**:
   * Pinned and running applications with glowing status dots.`,
      },
      {
        id: 'm3-l2',
        moduleId: 'module-3',
        lessonIndex: 2,
        title: 'Working with Tables, Cards, and Views',
        subtitle: 'Sorting, column customization, export options, and interactive cards.',
        estimatedMinutes: 4,
        summary: 'Efficiently filter, sort, and extract high-volume logistics data.',
        keyTakeaways: [
          'Click column headers to sort ascending or descending.',
          'Toggle between Table View (dense data) and Card View (visual status).',
          'Export filtered views directly to CSV, JSON, or audit-ready PDF.',
        ],
        content: `### Working with High-Volume Tables
Orion-9 data grids support thousands of SKUs and orders with zero latency:
* **Sorting**: Click any column header to sort. Shift-click to sort by secondary columns.
* **Column Visibility**: Click the table settings gear to show or hide specialized attributes (e.g. HS Code, Country of Origin, Weight).
* **Instant Export**: Export filtered datasets via the *Export* menu without waiting for server batch jobs.`,
      },
      {
        id: 'm3-l3',
        moduleId: 'module-3',
        lessonIndex: 3,
        title: 'Notifications and Status Indicators',
        subtitle: 'The Dynamic Island capsule, priority badges, and Disruption Radar.',
        estimatedMinutes: 5,
        summary: 'Interpret real-time operational alerts without getting overwhelmed by alert fatigue.',
        keyTakeaways: [
          'Dynamic Island provides ambient awareness without interrupting active tasks.',
          'Critical exceptions glow rose; nominal operations pulse with subtle cyan glow.',
          'Clicking any alert deep-links directly to the affected consignment or purchase order.',
        ],
        content: `### Ambient Telemetry via Dynamic Island
Positioned at the top-center of the interface, the **Dynamic Island** capsule provides real-time situational awareness:
\`\`\`
[ ● Corridor Nominal | 42.8k sig/s  —  2 Critical Exceptions ]
\`\`\`
* **Compact Idle**: Subtle pulse indicating healthy connection to Firestore event streams.
* **Active Disruption**: Turns amber or rose when an exception exceeds warning thresholds.
* **Expanded Inspection**: Hovering or clicking reveals a breakdown with direct jump buttons to resolve the issue.`,
      },
      {
        id: 'm3-l4',
        moduleId: 'module-3',
        lessonIndex: 4,
        title: 'Searching and Filtering Information',
        subtitle: 'Fuzzy searching, date ranges, and advanced Boolean filters.',
        estimatedMinutes: 4,
        summary: 'Locate any SKU, PO number, container, or supplier in seconds.',
        keyTakeaways: [
          'Global search index matches partial SKUs, carrier tracking codes, and city names.',
          'Use filter pills to constrain by facility, date range, or disruption status.',
          'Save custom filter sets for recurring operational reviews.',
        ],
        content: `### Search Techniques in Orion-9
* **SKU Search**: Enter partial code (e.g. \`SKU-892\`) or product description.
* **Consignment Code**: Search container numbers (e.g. \`MSKU-948271\`) or BoL numbers.
* **Corridor Filter**: Filter shipments specifically transiting the Suez Canal, Panama Canal, or Singapore Strait.`,
      },
      {
        id: 'm3-l5',
        moduleId: 'module-3',
        lessonIndex: 5,
        title: 'Accessibility and Responsive Usage',
        subtitle: 'Keyboard accessibility, screen reader support, and mobile viewports.',
        estimatedMinutes: 4,
        summary: 'Learn how Orion-9 adapts to mobile devices and assistive technologies.',
        keyTakeaways: [
          'Full keyboard accessibility: tab through controls and interact with Enter/Space.',
          'WCAG 2.1 AA compliant contrast ratios across dark and light palettes.',
          'On mobile (< 768px), windows automatically maximize into responsive app views.',
        ],
        content: `### Accessibility Standards
Orion-9 is certified against WCAG 2.1 AA accessibility standards:
* **Focus Rings**: High-visibility glowing cyan outline (\`focus-visible:ring-2\`).
* **Semantic HTML**: Proper ARIA landmarks, button roles, and live region announcements for real-time alerts.
* **Mobile Adaptations**: On smartphones, the multi-window desktop transforms into a streamlined mobile app shell with bottom tab bar.`,
      },
    ],
  },
  {
    id: 'module-4',
    moduleIndex: 4,
    title: 'Supply Chain Fundamentals',
    description: 'Learn fundamental supply chain management concepts: multi-echelon inventory, purchase orders, shipments, and risk.',
    iconName: 'Boxes',
    category: 'Workflows',
    lessons: [
      {
        id: 'm4-l1',
        moduleId: 'module-4',
        lessonIndex: 1,
        title: 'Understanding the Supply Chain Control Tower',
        subtitle: 'The 360-degree command view connecting inventory, freight, and suppliers.',
        estimatedMinutes: 5,
        summary: 'Understand the role of the Control Tower in unifying end-to-end supply chain visibility.',
        keyTakeaways: [
          'Connects raw material procurement, warehouse intake, fulfillment, and transit.',
          'Automates exception detection across 48 global multimodal corridors.',
          'Provides proactive disruption mitigation rather than reactive fire-fighting.',
        ],
        content: `### The Modern Control Tower
A traditional supply chain operates in functional silos: procurement does not know warehouse capacity, logistics does not know stockout urgency, and finance is unaware of transit damage until an invoice arrives.

The **Orion-9 Intelligent Control Tower** breaks down these barriers by establishing a **single shared operational truth**. Every order, shipment, and stock change publishes an immutable event, allowing all departments to act collaboratively.`,
      },
      {
        id: 'm4-l2',
        moduleId: 'module-4',
        lessonIndex: 2,
        title: 'Inventory Fundamentals',
        subtitle: 'Safety stock, reorder points, economic order quantity, and holding costs.',
        estimatedMinutes: 5,
        summary: 'Master the core formulas used by Orion-9 to balance inventory availability against holding costs.',
        keyTakeaways: [
          'Reorder Point (ROP) triggers automated replenishment requisitions.',
          'Safety stock acts as a buffer against demand volatility and supplier lead-time delays.',
          'Cash Conversion Cycle measures the velocity of capital through inventory.',
        ],
        content: `### Inventory Mathematics in Orion-9
Our deterministic inventory engine continuously calculates:

#### 1. Reorder Point (ROP)
$$\\text{ROP} = (\\text{Average Daily Usage} \\times \\text{Lead Time Days}) + \\text{Safety Stock}$$
When inventory on hand plus scheduled receipts drops below ROP, Orion-9 triggers a replenishment proposal.

#### 2. Days of Inventory Outstanding (DIO)
$$\\text{DIO} = \\frac{\\text{Average Inventory Value}}{\\text{Cost of Goods Sold (COGS)}} \\times 365$$
Helps enterprise planners minimize trapped working capital.`,
      },
      {
        id: 'm4-l3',
        moduleId: 'module-4',
        lessonIndex: 3,
        title: 'Purchase Orders',
        subtitle: 'Requisitions, approvals, supplier confirmation, and PO lifecycles.',
        estimatedMinutes: 5,
        summary: 'Understand the end-to-end lifecycle of purchase orders from draft to fulfillment.',
        keyTakeaways: [
          'POs transition through DRAFT, APPROVED, ISSUED, IN_TRANSIT, RECEIVED, and CLOSED.',
          'High-value POs (> $50k) automatically enter the Two-Party Human Approval matrix.',
          'Suppliers confirm PO line items via automated EDI 855 or portal interface.',
        ],
        content: `### Purchase Order Lifecycle
\`\`\`
[ DRAFT ] ---> [ APPROVAL MATRIX ] ---> [ ISSUED TO SUPPLIER ]
                                                |
[ COMPLETED / MATCHED ] <--- [ GRN RECEIVED ] <-- [ ASN & TRANSIT ]
\`\`\`
1. **Drafting**: Auto-generated by replenishment engines or manually created by SCM operators.
2. **Approval**: Enforces policy limits (e.g. POs over $50,000 require VP authorization).
3. **Transmission**: Transmitted via EDI 850 or direct API integration.
4. **Tracking**: Tied to carrier ASNs and tracking tokens until delivery.`,
      },
      {
        id: 'm4-l4',
        moduleId: 'module-4',
        lessonIndex: 4,
        title: 'Shipments and Advance Shipping Notices',
        subtitle: 'Carriers, multimodal transit, container tracking, and EDI 856.',
        estimatedMinutes: 5,
        summary: 'Track consignments across road, rail, ocean, and air freight corridors.',
        keyTakeaways: [
          'ASN (EDI 856) confirms dispatch before physical arrival at the intake dock.',
          'Multimodal consignments monitor intermediate geofences and transfer hubs.',
          'Bill of Lading numbers tie carriers directly to specific PO line items.',
        ],
        content: `### Advance Shipping Notices (ASN)
When a supplier loads a consignment onto a carrier vessel or truck, they transmit an **ASN (Advance Shipping Notice)**. 

The ASN informs the receiving warehouse:
* Expected date and estimated hour of arrival (ETA).
* Container, trailer, or flight number.
* Serial Shipping Container Codes (SSCC-18) for each pallet.
* Specific Purchase Order and line-item mappings.

This enables warehouse managers to schedule loading bays and labor *before* the truck arrives.`,
      },
      {
        id: 'm4-l5',
        moduleId: 'module-4',
        lessonIndex: 5,
        title: 'Supplier and Customer Orders',
        subtitle: 'Balancing supply commitments with customer demand promises.',
        estimatedMinutes: 4,
        summary: 'Coordinate supplier delivery lead times against committed customer delivery dates.',
        keyTakeaways: [
          'Inbound supplier orders replenish regional distribution centers.',
          'Outbound customer orders consume Available-to-Promise stock.',
          'Discrepancies trigger backorder management workflows.',
        ],
        content: `### Inbound vs Outbound Synchronization
A well-run supply chain harmonizes two opposing forces:
1. **Inbound Sourcing**: Long lead times (14 to 60 days for maritime shipping), bulk container economics, minimum order quantities (MOQ).
2. **Outbound Fulfillment**: Short lead times (24 to 48 hours for customer delivery), high SKU variety, small order quantities.

Orion-9 continuously synchronizes these flows to prevent either customer stockouts or excessive warehouse holding costs.`,
      },
      {
        id: 'm4-l6',
        moduleId: 'module-4',
        lessonIndex: 6,
        title: 'Exceptions and Operational Risks',
        subtitle: 'Identifying port strikes, weather delays, quality rejections, and stockouts.',
        estimatedMinutes: 5,
        summary: 'Learn how the Disruption Radar evaluates and scores supply chain anomalies.',
        keyTakeaways: [
          'Disruptions are categorized into Weather, Geopolitical, Labor, and Quality.',
          'Risk scores are calculated based on dollar value at risk and customer impact.',
          'Automated mitigation strategies simulate air bypass and secondary suppliers.',
        ],
        content: `### Risk Classification
The Disruption Radar classifies operational anomalies:

| Disruption Type | Typical Causes | Automated Mitigation in Orion-9 |
| :--- | :--- | :--- |
| **Port Congestion** | Berth shortage, customs hold | Simulate alternative port rerouting (e.g. Rotterdam -> Hamburg) |
| **Labor Disruption** | Port or rail strike | Reroute critical freight via air bypass |
| **Supplier Default** | Factory outage, insolvency | Reallocate purchase orders to qualified secondary vendor |
| **Quality Hold** | Damaged carton scan at GRN | Quarantine lot, issue Return to Vendor (RTV) notice |`,
      },
    ],
  },
  {
    id: 'module-5',
    moduleIndex: 5,
    title: 'Orion-9 Supply Chain Workflows',
    description: 'Step-by-step operational walkthroughs: monitoring inventory, tracking orders, resolving exceptions, and 3-way matching.',
    iconName: 'Workflow',
    category: 'Workflows',
    lessons: [
      {
        id: 'm5-l1',
        moduleId: 'module-5',
        lessonIndex: 1,
        title: 'Understanding the Data Flow',
        subtitle: 'From purchase requisition to warehouse receiving, invoice match, and telemetry.',
        estimatedMinutes: 5,
        summary: 'Follow the complete journey of data through the Orion Kernel Command Bus.',
        keyTakeaways: [
          'All mutations are submitted as typed commands through the Kernel Command Bus.',
          'Commands are authorized, validated, and executed in ACID transactions.',
          'State updates publish real-time Firestore snapshots to all connected clients.',
        ],
        content: `### The End-to-End Operational Pipeline
\`\`\`
[ 1. Requisition ] -> Generated via Demand Sensing or SCM Operator
[ 2. Purchase Order ] -> Issued to Supplier (EDI 850)
[ 3. ASN Dispatch ]  -> Carrier in-transit telemetry tracking (GPS/AIS)
[ 4. Intake Gate ]   -> Physical scan & Goods Received Note (GRN)
[ 5. 3-Way Match ]   -> Automated financial matching & payment release
\`\`\`
Every step is immutably logged in the **Event Fabric**, enabling instantaneous traceability.`,
      },
      {
        id: 'm5-l2',
        moduleId: 'module-5',
        lessonIndex: 2,
        title: 'Monitoring Inventory',
        subtitle: 'Using the Multi-Echelon Inventory module to inspect stock positions.',
        estimatedMinutes: 5,
        summary: 'Step-by-step guide to tracking stock on hand, allocated orders, and safety stock.',
        keyTakeaways: [
          'Open Inventory app (/inventory) to view stock across all regional warehouses.',
          'Inspect ATP counts before promising urgent inventory to enterprise accounts.',
          'Initiate inter-facility stock transfers to rebalance inventory across regions.',
        ],
        content: `### Step-by-Step: Inspecting Inventory
1. Open **Inventory** from the dock or launcher.
2. In the facility filter, choose your target distribution center (e.g., *DC-Frankfurt* or *DC-Singapore*).
3. Review the stock columns:
   * **On Hand**: Physical units counted in the warehouse bays.
   * **Allocated**: Units committed to pending customer delivery waves.
   * **ATP**: Units immediately available to promise for new orders.
4. If ATP drops below minimum safety stock, click **Reorder** to draft a replenishment PO.`,
      },
      {
        id: 'm5-l3',
        moduleId: 'module-5',
        lessonIndex: 3,
        title: 'Monitoring Purchase Orders',
        subtitle: 'Tracking procurement progress, delivery dates, and supplier confirmations.',
        estimatedMinutes: 5,
        summary: 'Learn how to filter and manage active purchase orders across suppliers.',
        keyTakeaways: [
          'View all active POs in the Procurement Dashboard (/procurement).',
          'Inspect line-item status, pricing, confirmed delivery dates, and ASN links.',
          'Flag delayed purchase orders for expedited carrier routing.',
        ],
        content: `### Step-by-Step: Managing POs
1. Open **Procurement** (\`/procurement\`).
2. Filter by status: \`ISSUED\`, \`IN_TRANSIT\`, or \`PENDING_APPROVAL\`.
3. Click any PO record to view:
   * Supplier profile & historical reliability score.
   * Line items, unit costs, and total extended value.
   * Linked Carrier Bill of Lading and current transit milestone.`,
      },
      {
        id: 'm5-l4',
        moduleId: 'module-5',
        lessonIndex: 4,
        title: 'Understanding Shipment Status',
        subtitle: 'Interpreting carrier tracking, AIS vessel positions, and flight schedules.',
        estimatedMinutes: 5,
        summary: 'Monitor ocean vessels, air cargo flights, and road transport in real time.',
        keyTakeaways: [
          'Corridor map shows real-time vessel positioning and weather radar.',
          'Estimated Time of Arrival (ETA) updates dynamically based on transit speed.',
          'Geofence entry alerts notify warehouse staff 4 hours prior to dock arrival.',
        ],
        content: `### Live Consignment Tracking
In the **Shipments** module (\`/shipments\`):
* **Maritime Freight**: Displays vessel IMO, current AIS coordinates, heading, and transit choke point ETAs.
* **Air Freight**: Tracks flight number, departure airport, and customs clearance status.
* **Road Freight**: Shows GPS location and estimated dock check-in window.`,
      },
      {
        id: 'm5-l5',
        moduleId: 'module-5',
        lessonIndex: 5,
        title: 'Identifying Exceptions',
        subtitle: 'Triage, evaluate impact, and execute autonomous or manual mitigations.',
        estimatedMinutes: 5,
        summary: 'How to handle supply chain disruptions using the Scenario Lab and mitigation engine.',
        keyTakeaways: [
          'Open Disruption Radar to review active corridor anomalies.',
          'Evaluate financial impact (capital exposure vs recovery cost).',
          'Execute pre-approved mitigation playbooks (e.g. Air Bypass).',
        ],
        content: `### Exception Resolution Playbook
When an alert appears:
1. Click the notification in the **Dynamic Island** or **Disruption Radar**.
2. Review the impact assessment:
   * Delayed units and affected customer orders.
   * Trapped capital and contractual SLA penalty risk.
3. Choose resolution:
   * *Option A (Default)*: Wait out delay if safety stock covers customer commitments.
   * *Option B (Reroute)*: Divert shipment to alternative uncongested port.
   * *Option C (Air Bypass)*: Expedite critical sub-assemblies via air freight.`,
      },
      {
        id: 'm5-l6',
        moduleId: 'module-5',
        lessonIndex: 6,
        title: 'Understanding Reconciliation and Data Quality',
        subtitle: 'Automated 3-Way Invoicing Match, GRN processing, and audit integrity.',
        estimatedMinutes: 5,
        summary: 'Master the automated financial reconciliation that protects company cash flow.',
        keyTakeaways: [
          'Goods Received Notes (GRN) are matched against PO quantities and Supplier Invoices.',
          'Tolerances within 0.5% quantity and 0.2% price automatically approve payment.',
          'Discrepancies are quarantined in the Approval Center for supervisor review.',
        ],
        content: `### The 3-Way Match Pipeline
\`\`\`
[ 1. PO: 1,000 units @ $45.00 ] <--- Matches ---> [ 2. GRN: 1,000 units received ]
                                     |
                          [ 3. Invoice: $45,000 ]
                                     |
                            [ AUTOMATIC APPROVAL ]
\`\`\`
If the supplier bills for 1,050 units, or at $46.50/unit:
* The invoice is immediately flagged with \`PRICE_VARIANCE\` or \`QUANTITY_OVERAGE\`.
* Payment is paused until the supplier issues a credit memo or a manager authorizes the variance.`,
      },
    ],
  },
  {
    id: 'module-6',
    moduleIndex: 6,
    title: 'AI Copilot and Intelligent Assistance',
    description: 'Learn how to collaborate with the Orion AI Copilot safely, ask effective questions, and validate recommendations.',
    iconName: 'Sparkles',
    category: 'Intelligence',
    lessons: [
      {
        id: 'm6-l1',
        moduleId: 'module-6',
        lessonIndex: 1,
        title: 'Introduction to the Orion-9 Copilot',
        subtitle: 'Architecture, tool capabilities, and security boundaries.',
        estimatedMinutes: 4,
        summary: 'Understand how the Orion AI Copilot connects to Google Gemini and authoritative SCM engines.',
        keyTakeaways: [
          'The Copilot is backed by Google Gemini via @google/genai.',
          'Operates under the governed AI_AGENT role with fail-closed tool permissions.',
          'Queries real databases; never fabricates inventory numbers or transit times.',
        ],
        content: `### How the Orion Copilot Works
Unlike consumer chatbots, the Orion AI Copilot is built on a **Zero-Hallucination Architecture**:

1. When you ask a question (e.g. *"What is the ATP for SKU-904 in Frankfurt?"*), the Copilot does not guess.
2. It invokes a registered tool (\`query_inventory_level\`) through the **Kernel Command Bus**.
3. The authoritative inventory engine computes the exact ATP from Cloud Firestore.
4. The Copilot synthesizes the verified answer into clear operational language.`,
      },
      {
        id: 'm6-l2',
        moduleId: 'module-6',
        lessonIndex: 2,
        title: 'Asking Effective Questions',
        subtitle: 'Prompt engineering for supply chain operators and planners.',
        estimatedMinutes: 4,
        summary: 'Learn best practices for structuring prompts to get precise operational answers.',
        keyTakeaways: [
          'Include specific identifiers: SKU numbers, PO IDs, facility names, or date ranges.',
          'Ask for specific output formats: summary table, risk ranking, or step-by-step action plan.',
          'Use operational verbs: "compare", "audit", "simulate", "calculate ATP".',
        ],
        content: `### High-Impact Prompt Examples

* ❌ Weak: *"How is my stock doing?"*
* ✅ Effective: *"List all SKUs at DC-Frankfurt where stock on hand is within 15% of the Reorder Point."*

* ❌ Weak: *"Any delays?"*
* ✅ Effective: *"Identify all maritime shipments transiting the Red Sea corridor with ETAs scheduled before Friday."*

* ❌ Weak: *"Fix the order."*
* ✅ Effective: *"Draft a replenishment purchase order for 500 units of SKU-104 from Tier-1 Supplier Apex Components."*`,
      },
      {
        id: 'm6-l3',
        moduleId: 'module-6',
        lessonIndex: 3,
        title: 'Understanding AI-Generated Recommendations',
        subtitle: 'How the Copilot evaluates trade-offs between speed, cost, and risk.',
        estimatedMinutes: 5,
        summary: 'Learn how to interpret recommendations generated by the Scenario Engine.',
        keyTakeaways: [
          'AI recommendations weigh financial cost against customer SLA penalties.',
          'Recommendations include confidence scores, assumptions, and alternative options.',
          'All high-consequence proposals require human confirmation before execution.',
        ],
        content: `### Decision Matrix Anatomy
When the Copilot proposes a disruption mitigation, it provides:
1. **Primary Recommendation**: The optimal balance of recovery speed and expense.
2. **Alternative Approaches**: Low-cost (slow) vs High-cost (expedited) options.
3. **Financial Impact**: Net cost difference vs protected customer revenue.
4. **Execution Command**: Ready to review and approve in the Approval Matrix.`,
      },
      {
        id: 'm6-l4',
        moduleId: 'module-6',
        lessonIndex: 4,
        title: 'Validating AI Responses',
        subtitle: 'Cross-checking recommendations against authoritative engines and audit logs.',
        estimatedMinutes: 4,
        summary: 'Techniques for verifying AI proposals against raw ledger records.',
        keyTakeaways: [
          'Never execute an unverified high-value action blindly.',
          'Check tool citation links to inspect raw Firestore records.',
          'Verify supplier lead-time assumptions against historical contracts.',
        ],
        content: `### Verification Checklist
Before authorizing any AI-generated proposal:
* [ ] Verify that referenced SKUs, facility IDs, and supplier contracts exist.
* [ ] Confirm that proposed reorder quantities do not violate minimum or maximum warehouse storage constraints.
* [ ] Check that unit prices match current negotiated procurement agreements.`,
      },
      {
        id: 'm6-l5',
        moduleId: 'module-6',
        lessonIndex: 5,
        title: 'Responsible Use of AI',
        subtitle: 'Human-in-the-loop governance and ethical automation boundaries.',
        estimatedMinutes: 4,
        summary: 'Understanding the ethical boundaries of AI automation in mission-critical operations.',
        keyTakeaways: [
          'AI provides decision intelligence, but humans retain ultimate accountability.',
          'Autonomous mode is restricted to low-risk, pre-approved operational boundaries.',
          'Every AI recommendation is immutably logged for audit compliance.',
        ],
        content: `### Human-in-the-Loop Governance
Orion-9 enforces strict boundaries on artificial intelligence:
* **No Autonomous PO Issuance above Threshold**: Purchase orders exceeding configured dollar thresholds strictly require human approval.
* **Audit Trail**: Every suggestion, prompt, and tool call is stored in \`audit_logs\` with timestamp and user ID.
* **Reversibility**: Operational actions provide audit rollback capabilities wherever possible.`,
      },
    ],
  },
  {
    id: 'module-7',
    moduleIndex: 7,
    title: 'Security and Account Management',
    description: 'Protect your account, understand session hygiene, learn role permissions, and handle sensitive SCM data.',
    iconName: 'Shield',
    category: 'Governance',
    lessons: [
      {
        id: 'm7-l1',
        moduleId: 'module-7',
        lessonIndex: 1,
        title: 'Protecting Your Account',
        subtitle: 'Password hygiene, phishing prevention, and credential security.',
        estimatedMinutes: 4,
        summary: 'Essential security measures to keep your enterprise operator account safe.',
        keyTakeaways: [
          'Use unique corporate passwords meeting Orion-9 complexity requirements.',
          'Never share operator credentials or leave workstations unlocked in shared facilities.',
          'Report suspicious login attempts immediately to your Security Administrator.',
        ],
        content: `### Account Security Fundamentals
Supply chain platforms are prime targets for industrial espionage and invoice redirection fraud. Protect your account:
* **Strong Passwords**: Minimum 8 characters with lowercase, uppercase, numbers, and symbols.
* **Workstation Lock**: Always press \`Win + L\` or \`Cmd + Ctrl + Q\` when stepping away from command consoles.
* **Zero Credential Sharing**: Individual operator accounts ensure cryptographic accountability in the audit ledger.`,
      },
      {
        id: 'm7-l2',
        moduleId: 'module-7',
        lessonIndex: 2,
        title: 'Authentication and Session Security',
        subtitle: 'Firebase ID tokens, automatic expiration, and session revocation.',
        estimatedMinutes: 4,
        summary: 'Understand how token-based authentication protects data in transit and rest.',
        keyTakeaways: [
          'Firebase ID tokens expire after 60 minutes and refresh automatically in active tabs.',
          'Closing browser windows on public computers terminates session persistence.',
          'Administrators can instantly revoke all active sessions for compromised accounts.',
        ],
        content: `### How Token Security Works
When you log in, Firebase issues an authenticated JSON Web Token (JWT):
* The token contains your user ID, tenant ID, and verified roles.
* Every request to Cloud Firestore or Cloudflare R2 verifies this token's cryptographic signature.
* Expired or revoked tokens cannot read or write data.`,
      },
      {
        id: 'm7-l3',
        moduleId: 'module-7',
        lessonIndex: 3,
        title: 'Understanding User Permissions',
        subtitle: 'Tenant isolation, least-privilege principles, and permission boundaries.',
        estimatedMinutes: 4,
        summary: 'Learn why least privilege ensures operational safety across multi-facility teams.',
        keyTakeaways: [
          'Tenant isolation guarantees you can only view data belonging to your organization.',
          'Role-based permissions prevent accidental modification of administrative settings.',
          'Request role upgrades through your platform administrator.',
        ],
        content: `### The Principle of Least Privilege
Users are provisioned with only the permissions necessary for their job:
* Warehouse operators have write access to intake gates and stock counts, but cannot modify corporate branding.
* Financial auditors have read-only access to invoice reconciliations, but cannot dispatch trucks.
* Administrators manage platform governance without viewing unredacted employee credentials.`,
      },
      {
        id: 'm7-l4',
        moduleId: 'module-7',
        lessonIndex: 4,
        title: 'Recognizing Sensitive Information',
        subtitle: 'Handling trade secrets, pricing agreements, supplier banking, and PII.',
        estimatedMinutes: 4,
        summary: 'Identify confidential data and understand your obligation to safeguard it.',
        keyTakeaways: [
          'Supplier unit pricing and rebate schedules are confidential corporate trade secrets.',
          'Supplier banking and wire routing numbers require restricted access.',
          'Never export sensitive financial files to unencrypted personal devices.',
        ],
        content: `### Data Classification Levels
1. **Public**: Marketing site, public documentation, general capability catalog.
2. **Internal**: Warehouse layout, facility codes, general standard operating procedures.
3. **Confidential**: Active PO quantities, inventory balances, supplier reliability ratings.
4. **Restricted**: Supplier bank details, executive pricing contracts, security credentials.`,
      },
      {
        id: 'm7-l5',
        moduleId: 'module-7',
        lessonIndex: 5,
        title: 'Responsible Data Access',
        subtitle: 'Audit logs, regulatory compliance, and responsible data usage.',
        estimatedMinutes: 4,
        summary: 'Understand how audit trails ensure accountability across global operations.',
        keyTakeaways: [
          'Every state change records your user ID, IP address, and timestamp.',
          'Audit logs in Cloud Firestore are strictly append-only and tamper-proof.',
          'Compliance reports verify SOX, GDPR, and ISO 27001 operational readiness.',
        ],
        content: `### The Immutable Audit Ledger
In Orion-9, there are no "silent changes":
* Modifying an order records who changed what, when, and why.
* Deleting records is prohibited; changes create tombstone events that preserve historical truth.
* Auditors can replay the exact state of any warehouse or order at any second in history.`,
      },
    ],
  },
  {
    id: 'module-8',
    moduleIndex: 8,
    title: 'Troubleshooting',
    description: 'Diagnose and resolve common navigation, synchronization, UI rendering, and network issues.',
    iconName: 'HelpCircle',
    category: 'Support',
    lessons: [
      {
        id: 'm8-l1',
        moduleId: 'module-8',
        lessonIndex: 1,
        title: 'Common Navigation Problems',
        subtitle: 'Window offscreen recovery, stuck modals, and viewport resizing.',
        estimatedMinutes: 3,
        summary: 'Quick fixes if an application window is lost off-screen or fails to open.',
        keyTakeaways: [
          'Right-click any dock icon and select "Restore" or "Center Window".',
          'Press Alt+Space and search for the app to refocus it immediately.',
          'Refresh your browser to reset window geometry to nominal coordinates.',
        ],
        content: `### Troubleshooting Window Geometry
* **Problem**: Window dragged partially offscreen or lost on multi-monitor setups.
  * **Fix 1**: Right-click the application icon in the bottom Dock -> Click **Center Window**.
  * **Fix 2**: Press \`Alt + Space\`, type the application name, and press \`Enter\`.
* **Problem**: Modal backdrop does not dismiss.
  * **Fix**: Press the \`Escape\` key or click the outer dimmed backdrop.`,
      },
      {
        id: 'm8-l2',
        moduleId: 'module-8',
        lessonIndex: 2,
        title: 'Understanding Loading States',
        subtitle: 'Firestore synchronization lag, offline buffering, and outbox queues.',
        estimatedMinutes: 4,
        summary: 'How to monitor offline queuing and diagnose slow network connections.',
        keyTakeaways: [
          'Orion-9 buffers state changes locally in IndexedDB when network drops.',
          'The Sync Monitor (/sync) displays pending outbox transactions.',
          'Do not clear browser storage while outbox mutations are pending.',
        ],
        content: `### Synchronization & Offline Outbox
If you see an amber sync pill in the top system bar:
1. Orion-9 has detected intermittent network latency.
2. Your work is **not lost**—mutations are safely queued in local IndexedDB (\`SC_DB\`).
3. Once internet connectivity is restored, the client outbox flushes automatically.
4. Open **Sync Monitor** (\`/sync\`) to inspect pending records.`,
      },
      {
        id: 'm8-l3',
        moduleId: 'module-8',
        lessonIndex: 3,
        title: 'Resolving Common UI Issues',
        subtitle: 'Web3D context loss, visual stutter, cache invalidation, and font scaling.',
        estimatedMinutes: 3,
        summary: 'Resolve graphic rendering anomalies and clear corrupted local caches.',
        keyTakeaways: [
          'Switch to Reduced Motion if experiencing GPU lag on low-power hardware.',
          'Hard reload (Ctrl+Shift+R / Cmd+Shift+R) clears stale client bundles.',
          'WebGL context resets automatically if your graphics driver sleeps.',
        ],
        content: `### Display & Performance Tips
* **Low Frame Rate**: If running on battery power or older integrated GPUs, open Settings and toggle **Low Power Mode / Reduced Motion**.
* **Visual Glitches**: Perform a hard refresh (\`Ctrl + F5\` or \`Cmd + Shift + R\`) to ensure the latest assets are cached.`,
      },
      {
        id: 'm8-l4',
        moduleId: 'module-8',
        lessonIndex: 4,
        title: 'Reporting Errors Effectively',
        subtitle: 'How to capture logs, correlation IDs, and submit actionable support tickets.',
        estimatedMinutes: 3,
        summary: 'Provide our engineering team with the diagnostic data needed for rapid resolution.',
        keyTakeaways: [
          'Copy the Request Correlation ID shown on any error banner.',
          'Note the exact step, SKU, or PO number you were working on.',
          'Submit bug reports through your designated tenant help desk.',
        ],
        content: `### Submitting an Actionable Bug Report
When reporting an issue:
1. **Endpoint / View**: Note the URL or application name (e.g., \`/dashboard/manual\`).
2. **Correlation ID**: Copy the safe diagnostic code from the error card.
3. **Reproduction Steps**: What sequence of clicks produced the unexpected behavior?
4. **Expected vs Actual**: What did you expect to happen, and what occurred instead?`,
      },
    ],
  },
];

export function getAllLessons(): Lesson[] {
  return ORION_LEARNING_CURRICULUM.flatMap((m) => m.lessons);
}

export function getLessonById(lessonId: string): Lesson | undefined {
  return getAllLessons().find((l) => l.id === lessonId);
}

export function getModuleById(moduleId: string): LearningModule | undefined {
  return ORION_LEARNING_CURRICULUM.find((m) => m.id === moduleId);
}

export function getAdjacentLessons(lessonId: string): { prevLesson?: Lesson; nextLesson?: Lesson } {
  const all = getAllLessons();
  const idx = all.findIndex((l) => l.id === lessonId);
  if (idx === -1) return {};
  return {
    prevLesson: idx > 0 ? all[idx - 1] : undefined,
    nextLesson: idx < all.length - 1 ? all[idx + 1] : undefined,
  };
}


export const LEARNING_MODULES: LearningModule[] = ORION_LEARNING_CURRICULUM.map((m) => {
  const totalMins = m.lessons.reduce((acc, curr) => acc + (curr.estimatedMinutes || 5), 0);
  const hours = Math.max(1, Math.ceil(totalMins / 60));
  return {
    ...m,
    code: `MOD-0${m.moduleIndex}`,
    level: m.category,
    estimatedHours: `~${hours}h`,
    lessons: m.lessons.map((l) => ({
      ...l,
      durationMinutes: l.estimatedMinutes || 5,
      objective: l.summary,
      level: m.category,
      scenarioCheck: {
        question: `How does "${l.title}" safeguard zero-client-authority deterministic execution in Orion-9?`,
        answer: l.keyTakeaways[0] || 'Enforces fail-closed authorization, immutable audit ledger tracking, and tenant isolation.',
      },
    })),
  };
});

export const ALL_LESSON_IDS: string[] = LEARNING_MODULES.flatMap((m) => m.lessons.map((l) => l.id));

export function findLessonById(lessonId: string): {
  lesson: Lesson & {
    durationMinutes: number;
    objective: string;
    level: string;
    scenarioCheck?: { question: string; answer: string };
  };
  module: LearningModule & {
    code: string;
    level: string;
    estimatedHours: string;
  };
  prevLessonId?: string;
  nextLessonId?: string;
} | undefined {
  const allLessons = LEARNING_MODULES.flatMap((m) => m.lessons);
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return undefined;

  const lesson = allLessons[idx] as Lesson & {
    durationMinutes: number;
    objective: string;
    level: string;
    scenarioCheck?: { question: string; answer: string };
  };

  const rawModule = LEARNING_MODULES.find((m) => m.id === lesson.moduleId) || LEARNING_MODULES[0];
  const module = {
    ...rawModule,
    code: rawModule.code || `MOD-0${rawModule.moduleIndex}`,
    level: rawModule.level || rawModule.category,
    estimatedHours: rawModule.estimatedHours || '~1h',
  };

  return {
    lesson,
    module,
    prevLessonId: idx > 0 ? allLessons[idx - 1].id : undefined,
    nextLessonId: idx < allLessons.length - 1 ? allLessons[idx + 1].id : undefined,
  };
}
