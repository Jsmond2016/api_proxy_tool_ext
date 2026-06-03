<div align="center">
<img src="public/icon-128.png" alt="API Proxy Tool Logo" width="128" height="128"/>
<h1>API Proxy Tool</h1>

<h3>Chrome & Firefox Extension — Intercept & Redirect API Requests to Mock Servers</h3>

<p>A powerful browser extension for frontend development, supporting API proxy, Mock management, Apifox integration, quick mock, archive, and permission point management.</p>

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6.0.0-0170FE.svg)](https://ant.design/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.8-38B2AC.svg)](https://tailwindcss.com/)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-4285F4.svg)](https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak)
[![Edge Add-ons](https://img.shields.io/badge/Edge-Addons-0078D7.svg)](https://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN)

<p><strong>📖 中文文档: <a href="README_CN.md">README_CN.md</a></strong></p>

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Install Extension](#-install-extension)
- [User Guide](#-user-guide)
- [Project Structure](#-project-structure)
- [Configuration Format](#-configuration-format)
- [Browser Stores](#-browser-stores)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Proxy Features

- **API Request Interception** — Intercept page API requests via `declarativeNetRequest` and redirect to Mock URLs
- **Multiple Match Modes** — Supports `contains`, `exact`, and `regex` URL matching
- **Multi-Level Toggle** — Global on/off, module-level batch toggle, individual API on/off with visual feedback
- **Global Mock** — One-click enable/disable all proxy rules, with icon switch indicator

### 📦 Module Management

- **Multi-Module Tabs** — Create, rename, reorder modules via tab interface
- **Module-Specific Configuration** — Each module supports `apiDocUrl`, `dataWrapper`, `pageDomain`, `requestHeaders`
- **Default Module** — Auto-creates a default module with example API on first run

### 🔍 Search & Navigation

- **Real-Time Search** — Filter APIs by name, URL, redirect URL, and page route with persistent keyword
- **API Highlighting** — Auto-scroll and highlight matched APIs when navigating from batch operations or external links

### 🔄 Apifox Integration

- **Sync OpenAPI Data** — Parse Apifox export URLs (OpenAPI/Swagger format) to auto-import API definitions
- **Tag-Based Filtering** — Select specific tags from Apifox to import only relevant APIs
- **Tag History** — Remembers the last 10 tag selections
- **Apifox URL Cache** — Persists Apifox URL across sessions
- **Smart Auto-Fill** — Automatically fills Apifox fields (group name, API type, run-in-Apifox link) when adding/editing APIs
- **Swagger Data Caching** — Caches parsed Swagger data for offline access

### ⚡ Quick Mock (Rapid Debugging)

- **Preset Responses** — Predefine reusable JSON mock responses and assign them to APIs
- **Custom Per-API Mock** — On-the-fly custom response for individual APIs
- **Batch Quick Mock** — Cross-extension batch Quick Mock via extension external messaging
- **Job Tracking** — Batch operations create jobs with status tracking and detailed results

### 📋 Iteration & Document Management

- **Tag-Based Iteration Info** — Attach requirement docs, technical docs, prototype links, test cases, and schedule docs to Apifox tags
- **Visual Info Bar** — Displays iteration docs and API tags in a collapsible alert bar
- **Copy Iteration Info** — One-click copy iteration info with CR release date selector

### 🗃️ Archive & Snapshot

- **Archive by Tag** — Save module snapshots by Apifox tag into IndexedDB
- **Archive List** — Browse, view, and restore previous archive records
- **Iteration Snapshot** — Includes Quick Mock configs and Apifox config snapshots

### 🔐 Permission Point Management

- **Copy Permission Points** — Extract permission points from API routes with CMS menu path format
- **Batch Permission Copy** — Generate permission data for all APIs across all modules
- **Group Name Validation** — Validates module label format (e.g., `a.b.c`) before permission copy

### 🛠️ API Operations

- **Add / Edit / Clone / Delete** — Full CRUD with form validation
- **Batch Delete** — Select multiple APIs and delete in bulk
- **Migrate Between Modules** — Move APIs from one module to another
- **Test Mock** — Test redirect URL with mock toggle status check
- **Clone with Options** — Clone within same module or across modules
- **Copy URL & Mock URL** — One-click copy API URL or Mock redirect URL
- **Pagination** — Configurable page size with persistent selection state

### 🔧 Configuration Management

- **Import / Export** — JSON format config import and export
- **Conflict Detection** — When syncing from Apifox, detects tag label conflicts and offers merge strategies (overwrite / merge)
- **Module Reset** — Reset individual module or all modules
- **Popup Back Navigation** — When opened from popup, shows a back button to return to source tab

---

## 🛠 Tech Stack

### Frontend

- **React 18.3.1** — UI library
- **TypeScript 5.8.3** — Type-safe JavaScript
- **Ant Design 6.0.0** — Component library
- **TailwindCSS 4.1.8** — Utility-first CSS

### State & Data

- **Zustand** — Lightweight state management with Chrome Storage persistence
- **IndexedDB** — Archive record storage
- **Chrome Storage API** — Config persistence

### Build & Development

- **Vite 6.3.5** — Build tool
- **@crxjs/vite-plugin** — Chrome extension Vite plugin
- **pnpm 10.5.2** — Package manager
- **ESLint + Prettier** — Code quality

### Extension APIs

- **Manifest V3** — Latest extension spec
- **declarativeNetRequest** — Declarative network request interception
- **Chrome Storage API** — Data persistence
- **externally_connectable** — Cross-extension messaging

---

## 🚀 Quick Start

### Requirements

- **Node.js** >= 16.0.0
- **pnpm** >= 8.0.0
- **Chrome** >= 88 / **Firefox** >= 109

### Install & Run

```bash
# Install dependencies
pnpm install

# Start Chrome dev mode with hot reload
pnpm dev

# Build for production
pnpm build        # Chrome
pnpm build:chrome # Chrome (explicit)
pnpm build:firefox # Firefox
```

### Load Extension

**Chrome:**

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist_chrome/` directory

**Firefox:**

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load temporary Add-on"
3. Select `manifest.json` from `dist_firefox/`

---

## 📖 User Guide

### 1. Open Configuration Page

- Click the extension icon in the browser toolbar
- The options page opens in a new tab

### 2. Module Management

- **Add Module**: Click "+" in the tab bar, enter a name (e.g., `order.api`)
- **Switch Module**: Click any tab to view its APIs
- **Edit Module**: Right-click or use module edit to set `apiDocUrl`, `dataWrapper`, `pageDomain`
- **Import APIs**: Use "Sync from Apifox" to auto-import API definitions by tag

### 3. Add & Configure an API

Click "Add" and fill in:

- **API URL** — Original request URL (supports relative paths or full URLs)
- **Redirect URL** — Mock server URL
- **Name** — Display name
- **Method** — GET, POST, PUT, DELETE, PATCH
- **Match Mode** — `contains`, `exact`, or `regex`
- **Mock Way** — `redirect` or `mock`

### 4. Quick Mock (Rapid Debugging)

- **Global Setting**: Click the gear icon to configure preset JSON mock responses
- **Per-API Toggle**: On each API, enable Quick Mock and select a preset or custom response
- **Batch Quick Mock**: External extensions can send API URLs via `chrome.runtime.sendMessage` to batch-create Quick Mock configurations

### 5. Sync from Apifox

1. Click "Sync from Apifox" button in the top bar
2. Enter your Apifox OpenAPI export URL
3. Select the tags you want to import
4. Choose merge strategy (overwrite / merge) when conflicts exist
5. APIs are auto-created with redirect URLs based on your Mock prefix

### 6. Archive Snapshots

1. Configure Apifox and select iteration tags
2. Click "Archive" → "Archive" to save current module state
3. Browse archives via "View Archives"
4. Restore a previous archive when needed

### 7. Permission Management

- Click "Copy Permission Points" to extract CMS permission data from your APIs
- Module labels must follow `a.b.c` format for valid permission group names

### 8. Test Mock

- Click the lightning icon on any API row
- The test calls the Mock URL and displays the response (status, headers, body)

---

## 📁 Project Structure

```
api_proxy_tool_ext/
├── public/                         # Static assets (icons)
├── scripts/
│   └── generate-changelog.mjs     # Changelog generator
├── src/
│   ├── assets/
│   │   ├── img/
│   │   └── styles/                # Global CSS
│   ├── constant/
│   │   ├── apifoxFields.ts        # Apifox custom field names
│   │   ├── constant.ts            # Default config, log/error messages
│   │   └── model.ts               # Model action constants (CRUD)
│   ├── locales/en/                # i18n messages
│   ├── pages/
│   │   ├── background/            # Service Worker
│   │   │   └── index.ts           # Rule management, messaging, icon control
│   │   ├── options/               # Main options page
│   │   │   ├── components/
│   │   │   │   ├── listTable/     # API table with actions (clone, migrate, test, delete)
│   │   │   │   ├── navButtons/    # Top bar buttons (sync, archive, permissions, reset)
│   │   │   │   ├── operateButtons/# Per-module buttons (add, batch delete, permissions, reset)
│   │   │   │   ├── ModuleInfoBar.tsx    # Tag & iteration info bar
│   │   │   │   ├── ModuleTabs.tsx       # Module tab interface
│   │   │   │   ├── SearchSelect.tsx     # Real-time search
│   │   │   │   └── BatchQuickMockBanner.tsx # Batch import result banner
│   │   │   └── Options.tsx        # Main layout
│   │   └── popup/                 # Popup page (opens options in new tab)
│   ├── store/                     # Zustand stores
│   ├── types/                     # TypeScript definitions
│   └── utils/
│       ├── archiveUtil.ts         # IndexedDB archive operations
│       ├── batchQuickMock.ts      # Cross-extension batch Quick Mock
│       ├── chromeApi.ts           # Chrome API wrapper
│       ├── configUtil.tsx         # Config save/load helpers
│       ├── dataProcessor.ts       # Data processing utilities
│       ├── docUtils.ts            # Document link parsing
│       ├── logger.ts              # Console logger
│       └── permissionUtils.ts     # Permission point extraction
├── manifest.json                  # Extension manifest
├── package.json
├── vite.config.chrome.ts
├── vite.config.firefox.ts
└── README.md
```

---

## 📄 Configuration Format

### Import/Export JSON Example

```json
[
  {
    "apiDocKey": "order.management",
    "label": "Order Management",
    "apiDocUrl": "https://docs.example.com/order",
    "dataWrapper": "data",
    "pageDomain": "https://admin.example.com",
    "requestHeaders": "X-Custom-Header: value",
    "apiArr": [
      {
        "apiKey": "/api/orders",
        "apiName": "Get Order List",
        "apiUrl": "https://api.example.com/orders",
        "redirectURL": "http://127.0.0.1:4523/mock/orders",
        "method": "get",
        "filterType": "contains",
        "delay": 0,
        "isOpen": true,
        "mockWay": "redirect",
        "statusCode": 200,
        "authPointKey": "order.queryList",
        "pageRoute": "/order/list"
      }
    ]
  }
]
```

### Field Descriptions

| Field            | Description                                |
| ---------------- | ------------------------------------------ |
| `apiDocKey`      | Module unique identifier                   |
| `label`          | Module display name                        |
| `apiDocUrl`      | Module documentation URL                   |
| `dataWrapper`    | Response data wrapper path                 |
| `pageDomain`     | Page domain for route matching             |
| `requestHeaders` | Custom request headers                     |
| `apiKey`         | API unique identifier                      |
| `apiName`        | API display name                           |
| `apiUrl`         | Original API URL                           |
| `redirectURL`    | Mock redirect target                       |
| `method`         | HTTP method (get/post/put/delete/patch)    |
| `filterType`     | URL matching method (contains/exact/regex) |
| `delay`          | Response delay in ms                       |
| `isOpen`         | Whether enabled                            |
| `mockWay`        | Mock mode (redirect/mockResponse)          |
| `authPointKey`   | Permission point key                       |
| `pageRoute`      | Page route identifier                      |

---

## 🏪 Browser Stores

- **[Chrome Web Store](https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak)** — Install from Chrome Web Store
- **[Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN)** — Install from Edge Add-ons

---

## 📄 License

MIT License

---

<div align="center">
<p>If this project helps you, please give it a ⭐️ Star!</p>
<p>Made with ❤️ by Jsmond2016</p>
</div>
