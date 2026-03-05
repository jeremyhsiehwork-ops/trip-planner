# Trip Planner App Specification

## Overview
A mobile-friendly trip planner application with Japanese minimal design aesthetics. The app allows users to create custom trips, choose from templates with preview functionality, plan events with map integration, manage expenses, and organize their travel itineraries.

## Design System

### Color Palette (Japanese Earth Tones - 日系大地色)
- **Primary Background**: `#E7E4DD` (Cream/Beige - 奶油米)
- **Text Color**: `#707070` (Medium Gray - 中灰)
- **Accent Color**: `#A67C52` (Earth Brown)
- **Accent Light**: `#D4C4B0` (Light Brown)
- **Surface/White**: `#FFFFFF`
- **Secondary Text**: `#8E8E93`
- **Border Color**: `#D4D0C8`

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif
- **Japanese-inspired minimal typography**
- Letter-spacing: 0.05em - 0.15em for headers

### Design Principles
- Japanese minimal (日系) aesthetic
- Clean, uncluttered interfaces
- Subtle shadows and rounded corners
- Earth-tone color palette
- Generous whitespace

## App Structure

### Navigation Modes

The app has two navigation modes:

#### Landing Mode (3 buttons)
Used when viewing trip list, add trip, or settings.

| Icon | Label | Page | Description |
|------|-------|------|-------------|
| `list` | Trip List | Schedules | Trip list (default page) |
| `plus-circle` | Add Trip | Add Trip | Create new trips with templates |
| `settings` | Settings | Settings | App settings including language |

#### Trip Editor Mode (6 buttons)
Used when editing a trip. Shows shared planner header with back button.

| Icon | Label | Page | Description |
|------|-------|------|-------------|
| `calendar-days` | Schedule | Schedule Editor | Full-page event list |
| `map` | Map | Map Editor | Full-page map view |
| `plus-circle` | Add Event | Add Event Modal | Quick add event |
| `dollar-sign` | Track | Track | Expense tracking |
| `check-square` | Checklist | Checklist | Packing checklist |
| `settings` | Settings | Settings | App settings |

### Page Details

#### 1. Schedules Page (行程表)
**Default View - Trip List:**
- Page header with Japanese title "あなたの旅" (Your Trips)
- List of saved trips with:
  - Trip name
  - Date range
  - Event count
  - Continue and Delete buttons
- Empty state when no trips exist
- Creates new trip via "Add Trip" page

**Trip Planner View (when trip selected):**
- **Shared Planner Header** (fixed at top):
  - Back button (returns to trip list)
  - Trip title with date range
  - Add event button
- **Planner Main Layout**:
  - On desktop: Side-by-side map and events
  - On mobile: Stacked layout with map occupying remaining height
- **Map Section**:
  - Interactive Leaflet map
  - Location search bar
  - Custom markers for events
  - Collapse/expand toggle
- **Events Section**:
  - Collapsible filters (date/category)
  - Scrollable event list
  - Event items with category color coding
  - **Date display includes day of week** (e.g., "Mon, Mar 4")

#### 2. Checklist Page (準備)
- Packing checklist with categories:
  - 證件 (Documents): 護照, 身份證, 回鄉證
  - 金錢 (Money): 錢, 銀聯提款卡, 信用卡
  - 電子產品 (Electronics): 手機, 耳筒, 上網卡, etc.
  - 袋/收納 (Bags): 膠袋, 洗衫袋, 細袋
  - 洗漱用品 (Toiletries): 牙膏, 牙刷, 面巾, etc.
  - 個人護理 (Personal Care): 髮夾, 指甲鉗, 梳, etc.
  - 防曬/配件 (Sun Protection): 防曬, 太陽眼鏡, 傘, 帽
  - 衣物 (Clothing): 拖鞋, 睡衣, 外套, 衫, 褲, etc.
  - 食物/飲品 (Food): 零食, 早餐, 水
  - 藥品 (Medicine): 止暈, 幸福傷風素, 必理痛, etc.
- Progress tracker (checked/total)
- Add custom items
- Swipe to delete
- Check/uncheck items
- Shared checklist for all trips

#### 3. Add Trip Page (加新行程)
- Page header with Japanese title "新しい旅を作る" (Create New Trip)
- Create Custom Trip button
- Template section:
  - Japan Toyama 4-Day Trip template
  - More templates can be added

#### 4. Track Page (記賬)
- **Expense Summary Card**:
  - Total spent (in HKD)
  - Per person split
  - Person count
- **Add Expense Button**
- **Expense List**:
  - Grouped by date
  - Category icons and colors
  - Original currency + HKD conversion
  - Payer information
  - Linked event indicator
- **Multi-step Expense Wizard** (4 steps)
- **Settings Integration**:
  - Number of persons
  - Person names
  - Default currency
  - Exchange rates

#### 5. Settings Page (設置)
- **Expense Settings**:
  - Number of Persons (stepper)
  - Person Names (editable inputs)
  - Default Currency (dropdown)
  - Exchange Rates (editable rates to HKD)
- **Language Selection** (Language 言語):
  - English (🇬🇧)
  - 繁體中文 (🇹🇼)
- **Data Management** (Data データ):
  - Clear All Data button

## Modals

### Multi-Step Event Wizard
A 4-step wizard for creating/editing events:

**Step 1: Category Selection**
- Visual category grid with icons
- Categories: Hotel, Breakfast, Lunch, Dinner, View, Activity, Transport
- Click to select

**Step 2: Name & Location**
- Event name input (required)
- Location input with map button
- Mini map for location picking
- Notes textarea (optional)

**Step 3: Date & Time**
- **Date Scroller**: Horizontal scrollable date buttons showing:
  - Day of week (SUN, MON, TUE, etc.)
  - Month and date (Mar 4)
  - Based on trip date range
- **Time Picker**: 
  - Hour spinner (up/down buttons, 1-12)
  - Minute spinner (up/down, 15-min intervals)
  - AM/PM toggle button
- **Quick Time Buttons**: Morning, Noon, Afternoon, Evening

**Step 4: Review & Confirm**
- Category badge with icon
- Event name
- Location
- Date with day of week
- Time
- Notes
- Mini map preview

### Multi-Step Expense Wizard
A 4-step wizard for tracking expenses:

**Step 1: Category Selection**
- Visual category grid
- Categories: Transport, Meal, Souvenir, Drink, Living, Entertainment, Shopping, Others

**Step 2: Item & Amount**
- Item name input
- Amount input with currency symbol
- Currency selector
- Exchange rate display
- HKD conversion preview
- Link to event (optional)

**Step 3: Who Paid & When**
- Payer selection (checkboxes)
- Split summary calculation
- **Date Scroller** (same as event wizard)
- **Time Picker** (same as event wizard)
- Notes (optional)

**Step 4: Review & Confirm**
- Category badge
- Item name
- Original amount + converted amount
- Payers list
- Date with day of week
- Linked event

### Event Detail Modal
- Read-only event view
- Category badge with color
- Edit and Delete buttons
- Click to focus map on event location

### Expense Detail Modal
- Category badge with icon
- Item name and amounts
- Payer information
- Date with day of week
- Linked event (with view button)
- Notes
- Edit and Delete buttons

### New Trip Modal
- Create custom trip with name and date range
- Date validation (end date >= start date)

### Template Preview Modal
- Shows template details before saving:
  - Template name and description
  - Duration (number of days)
  - Number of events
  - Day-by-day itinerary preview
- Save form with:
  - Custom trip name input
  - Start and end date selection
- **Smart Date Mapping**:
  - Events mapped to selected dates
  - Day 1 → Start Date
  - Day 2 → Start Date + 1 day
  - If more events than days, excess placed on last day

## Technical Stack

### Frontend
- **HTML5** - Semantic structure
- **CSS3** - Custom properties, Flexbox, Grid
- **JavaScript (ES6+)** - Vanilla JS, no framework
- **Tailwind CSS** (CDN) - Utility classes

### Icons
- **Lucide Icons** - Minimal, clean SVG icons
- Used via CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`

### Map
- **Leaflet.js** - Interactive maps
- **OpenStreetMap** - Map tiles
- **Photon API** - Location search (better CORS support)

### Data Storage
- **localStorage** - Client-side persistence
- Stores: trips, events, expenses, language preference, checklist, expense settings

## Event Categories & Colors

| Category | Color Code | Border Color |
|----------|------------|--------------|
| Hotel | `#6B8E6B` | Green |
| Breakfast | `#C4A35A` | Gold |
| Lunch | `#7BA3A8` | Teal |
| Dinner | `#B87A7A` | Rose |
| View/Attraction | `#8B7BA8` | Purple |
| Activity/Play | `#C49A6C` | Orange |
| Transportation | `#7A9AB8` | Blue |

## Expense Categories & Colors

| Category | Icon | Color |
|----------|------|-------|
| Transport | 🚗 | Blue |
| Meal | 🍽️ | Orange |
| Souvenir | 🎁 | Pink |
| Drink | 🍹 | Teal |
| Living | 🏨 | Purple |
| Entertainment | 🎬 | Yellow |
| Shopping | 🛍️ | Green |
| Others | 📦 | Gray |

## Responsive Design

### Mobile-First
- Optimized for mobile devices (375px+)
- Touch-friendly targets (min 44px)
- Bottom navigation for easy thumb access

### Breakpoints
- **Mobile**: < 768px (default)
  - Stacked layout: map and events vertically
  - Map occupies remaining viewport height
- **Tablet/Desktop**: ≥ 768px
  - Side-by-side map and events layout
  - Map takes remaining width
  - Centered modal dialogs

## File Structure

```
trip-advisor/
├── index.html      # Main HTML structure
├── styles.css      # Japanese earth tone styling
├── navigation.js   # Bottom navigation controller (dual mode)
├── spec.md         # This specification
└── js/
    ├── config.js   # Configuration, translations, templates, categories
    ├── storage.js  # LocalStorage operations and state management
    ├── map.js      # Map initialization and marker management
    ├── events.js   # Event CRUD with multi-step wizard
    ├── expenses.js # Expense tracking with multi-step wizard
    ├── trips.js    # Trip management and template handling
    ├── ui.js       # UI functions, filters, language settings
    ├── search.js   # Map search functionality
    ├── checklist.js # Packing checklist management
    ├── onboarding.js # Tutorial/onboarding system
    └── main.js     # Application initialization
```

### Module Architecture

The application is organized into modular JavaScript files for better maintainability:

| Module | Purpose | Key Exports |
|--------|---------|-------------|
| `config.js` | Constants, translations, templates, categories | `translations`, `eventCategories`, `expenseCategories`, `currencyOptions` |
| `storage.js` | State management, localStorage operations | `Storage.events`, `Storage.expenses`, `Storage.savedTrips`, `Storage.currentTrip`, `Storage.expenseSettings` |
| `map.js` | Leaflet map operations | `MapModule.initMap()`, `MapModule.addMarker()`, `MapModule.refreshMap()` |
| `events.js` | Event CRUD with wizard | `Events.renderEvents()`, `Events.openAddEventForm()`, `Events.viewEvent()` |
| `expenses.js` | Expense tracking with wizard | `ExpenseTracker.init()`, `ExpenseTracker.render()`, `ExpenseTracker.openModal()` |
| `trips.js` | Trip lifecycle management | `Trips.createTripFromTemplate()`, `Trips.continueTrip()` |
| `ui.js` | UI updates, filters, language | `UI.setLanguage()`, `UI.setupHomePage()`, `UI.filterEventsByDate()` |
| `search.js` | Location search | `Search.setupMapSearch()`, `Search.searchLocation()` |
| `checklist.js` | Packing checklist | `Checklist.init()`, `Checklist.addItem()`, `Checklist.toggleCheck()` |
| `onboarding.js` | Tutorial/onboarding system | `Onboarding.init()`, `Onboarding.start()`, `Onboarding.toggle()`, `Onboarding.checkTripEditorOnboarding()` |
| `main.js` | App initialization | DOMContentLoaded handler, expense settings setup |

## Onboarding System

### Overview
The app includes a tutorial/onboarding system that guides first-time users through key features. The onboarding uses spotlight highlighting and tooltips to explain UI elements.

### Flows

#### Landing Onboarding (3 steps)
1. **Welcome** - Points to trip list header, introduces the app
2. **Create Trip** - Points to center add button, explains creating trips
3. **Settings** - Points to settings button, explains customization options

#### Trip Editor Onboarding (6 steps)
1. **Trip Header** - Points to the shared planner header
2. **Quick Add** - Points to the add event button in header
3. **Map View** - Points to the map button in bottom nav
4. **Schedule** - Points to events section
5. **Expense Tracker** - Points to track button in bottom nav
6. **Packing Checklist** - Points to checklist button in bottom nav

### Behavior
- Onboarding shows automatically for first-time users
- **Persistence**: Shows on every page load until user dismisses it
- User can skip at any time with "Skip" or "X" button
- Settings page has "Show Tutorial" buttons to re-enable tutorials
- Toggle buttons in settings turn tutorials on/off for next visit

### Technical Implementation
- `js/onboarding.js` - Onboarding module
- Spotlight overlay with positioned tooltips
- LocalStorage flags: `onboardingLandingCompleted`, `onboardingTripEditorCompleted`
- Functions: `initOnboarding()`, `startOnboarding()`, `toggleOnboarding()`, `checkTripEditorOnboarding()`

## Features

### Implemented
- ✅ Dual navigation modes (Landing + Trip Editor)
- ✅ Shared planner header in trip editor mode
- ✅ Trip creation and management
- ✅ Interactive map with markers (remaining height on desktop)
- ✅ Location search
- ✅ Event CRUD operations with multi-step wizard
- ✅ Category-based color coding
- ✅ **Date/time picker with day of week display**
- ✅ **Date scroller with horizontal scroll**
- ✅ **Time picker with spinner controls**
- ✅ Local storage persistence
- ✅ Language toggle (EN/繁體中文)
- ✅ Japanese minimal design
- ✅ Lucide icons integration
- ✅ Template preview modal
- ✅ Smart date mapping for template events
- ✅ Event detail modal
- ✅ Map marker popups with event info
- ✅ Packing checklist with categories
- ✅ Swipe to delete checklist items
- ✅ Checklist progress tracking
- ✅ **Expense tracking with multi-step wizard**
- ✅ **Multi-currency support with exchange rates**
- ✅ **Per-person expense splitting**
- ✅ **Link expenses to events**
- ✅ **Expense summary with totals**

## UI Components

### Wizard Progress Indicator
- Progress bar showing current step
- Step number indicators (1, 2, 3, 4)
- Active/completed states

### Date Scroller
- Horizontal scrollable container
- Left/right scroll buttons
- Date buttons showing:
  - Day of week (SUN, MON, TUE, etc.)
  - Month and date (Mar 4)
- Selected state highlighting
- Based on trip date range

### Time Picker
- Hour spinner (1-12 with up/down)
- Minute spinner (0-45 in 15-min intervals)
- AM/PM toggle button
- Quick time buttons (Morning, Noon, Afternoon, Evening)

### Shared Planner Header
- Fixed position at top
- Background: Text color (#707070)
- Contains: Back button, Trip title, Add event button
- Only visible in trip editor mode
- Hidden when returning to trip list

### Buttons
- **Primary**: Text color background, white text
- **Secondary**: White background, border
- **Danger**: Red border/text, red fill on hover

### Cards
- White background
- Subtle shadow (0 1px 3px rgba(0,0,0,0.06))
- Rounded corners (12px)
- 1px border (#D4D0C8)

### Modals
- Slide-up animation on mobile
- Dark header with white text
- Form inputs with rounded corners
- Large modal for template preview (scrollable)

### Navigation
- Fixed bottom bar (70px height)
- Icon + label format
- Active state: darker text color
- Smooth transitions
- Center floating action button for add

## Data Models

### Trip
```javascript
{
  id: 'trip_timestamp',
  name: 'Trip Name',
  template: 'custom' | 'japan-toyama',
  startDate: 'YYYY-MM-DD',
  endDate: 'YYYY-MM-DD',
  events: []
}
```

### Event
```javascript
{
  id: 'event_id',
  name: 'Event Name',
  location: 'Location string',
  time: 'YYYY-MM-DDTHH:mm',
  description: 'Notes',
  category: 'hotel'|'breakfast'|'lunch'|'dinner'|'view'|'play'|'transportation',
  latLng: [lat, lng]
}
```

### Expense
```javascript
{
  id: 'expense_id',
  category: 'transport'|'meal'|'souvenir'|'drink'|'living'|'entertainment'|'shopping'|'others',
  itemName: 'Item name',
  amount: 1000,
  currency: 'JPY',
  exchangeRate: 0.053,
  amountHKD: 53.00,
  linkedEventId: null | 'event_id',
  payers: [0, 1], // Array of person indices
  date: 'YYYY-MM-DD',
  time: 'HH:mm',
  notes: 'Optional notes'
}
```

### Expense Settings
```javascript
{
  persons: ['Person 1', 'Person 2'],
  defaultCurrency: 'JPY',
  exchangeRates: {
    'JPY': { symbol: '¥', rate: 0.053 },
    'TWD': { symbol: 'NT$', rate: 0.25 },
    // ... more currencies
  }
}
```

### Checklist Item
```javascript
{
  id: 'item_timestamp',
  text: 'Item name',
  category: 'documents'|'money'|'electronics'|'bags'|'toiletries'|'personal'|'sun'|'clothing'|'food'|'medicine',
  checked: false
}
```

### Template
```javascript
{
  id: 'template-id',
  name: 'Template Name',
  description: 'Template description',
  days: 4,
  events: [
    {
      name: 'Event Name',
      location: 'Location',
      category: 'view',
      time: 'HH:mm',  // Time only, date calculated from trip dates
      latLng: [lat, lng]
    }
  ]
}
```

## Localization

### Supported Languages
- **English (en)** - Default
- **Traditional Chinese (zh-TW)** - 繁體中文

### Translatable Elements
- Page titles and headers
- Button labels
- Form labels and placeholders
- Category names
- Empty state messages
- Modal titles
- Navigation labels
- Wizard step headers

## User Flows

### Create Event (Multi-Step Wizard)
1. User clicks add event button or taps on map
2. Step 1: User selects category from visual grid
3. Step 2: User enters name, location (can pick from mini map), notes
4. Step 3: User selects date from scroller, time from spinner
5. Step 4: User reviews all details
6. User clicks "Add Event" to save

### Create Expense (Multi-Step Wizard)
1. User clicks "Add Expense" button
2. Step 1: User selects category from visual grid
3. Step 2: User enters item name, amount, currency; sees conversion preview
4. Step 3: User selects payers, date, time
5. Step 4: User reviews all details
6. User clicks "Add Expense" to save

### Create Trip from Template
1. User navigates to "Add Trip" page
2. User clicks on template card or "選択" button
3. Template Preview Modal opens showing:
   - Template info (name, description, duration)
   - Itinerary preview with all events
4. User enters custom trip name
5. User selects start and end dates
6. User clicks "Save Trip"
7. Events are mapped to selected dates
8. User is redirected to trip planner (schedule page) with events loaded

### Create Custom Trip
1. User navigates to "Add Trip" page
2. User clicks "Create Custom Trip" button
3. New Trip Modal opens
4. User enters trip name and selects dates
5. User is redirected to trip planner (schedule page)

### Edit Trip
1. User clicks on saved trip card or continue button
2. App switches to trip editor mode
3. Shared planner header appears
4. Schedule page shows with event list
5. User can navigate to Map, Add Event, Track, Checklist, or Settings

### Return to Trip List
1. User clicks back button in shared planner header
2. App switches to landing mode
3. Shared planner header is hidden
4. Trip list is displayed

---

*Last Updated: March 2026*
*Design: Japanese Earth Tones (日系大地色)*