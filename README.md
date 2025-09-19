<div align="center">
<img src="public/icon-128.png" alt="API Proxy Tool Logo" width="128" height="128"/>
<h1>API Proxy Tool - Chrome Extension</h1>

<h3>Modern Browser Extension with React + Vite + TypeScript + TailwindCSS</h3>

<p>A powerful Chrome extension for intercepting and redirecting API requests to Mock servers, providing convenient interface proxy tools for frontend development.</p>

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.26.5-0170FE.svg)](https://ant.design/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.8-38B2AC.svg)](https://tailwindcss.com/)

<p><strong>📖 中文文档: <a href="README_CN.md">README_CN.md</a></strong></p>

</div>

## 📋 Table of Contents

- [Project Introduction](#project-introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
  - [Requirements](#requirements)
  - [Install Dependencies](#install-dependencies)
  - [Development Mode](#development-mode)
  - [Production Build](#production-build)
- [Install Extension](#install-extension)
- [User Guide](#user-guide)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Configuration Format](#configuration-format)
- [Notes](#notes)
- [License](#license)
- [Contributing](#contributing)


## 🚀 Project Introduction

API Proxy Tool is a Chrome browser extension developed based on modern frontend technology stack, mainly used for API interface proxy and Mock data management during frontend development. This extension is built based on the [vite-web-extension](https://github.com/JohnBra/vite-web-extension) template, providing a complete Chrome extension development solution.

### Core Values
- **Improve Development Efficiency**: Quickly configure API proxy, switch Mock data without modifying code
- **Modular Management**: Support multi-project, multi-module API configuration management
- **Modern Interface**: Intuitive operation interface based on Ant Design
- **Flexible Configuration**: Support multiple matching methods and custom responses

## ✨ Features

### 🎯 Core Features
- **API Request Interception**: Automatically intercept API requests in pages and redirect to specified Mock URLs
- **Modular Management**: Support creating multiple modules to categorize different API configurations
- **Flexible Matching**: Support multiple URL matching methods (contains, exact, regex)
- **Delay Control**: Configurable API response delay time to simulate real network environment
- **Mock Response**: Support direct Mock data return without external server

### 🔧 Management Features
- **Interface Management**: Add, edit, delete, clone API configurations
- **Batch Operations**: Support module-level batch switch and reset
- **Import/Export**: Support JSON format configuration import/export
- **Global Control**: One-click enable/disable all proxy functions
- **Real-time Search**: Support quick search by interface name and address

### 🎨 User Interface
- **Full-screen Configuration**: Click extension icon to open configuration interface in new tab
- **Modern UI**: Modern interface design based on Ant Design
- **Responsive Layout**: Adapt to different screen sizes
- **Intuitive Operations**: Drag-and-drop sorting, one-click copy and other convenient operations
- **Real-time Preview**: Configuration changes take effect immediately

## 🛠 Tech Stack

### Frontend Framework
- **React 18.3.1** - Modern user interface library
- **TypeScript 5.8.3** - Type-safe JavaScript superset
- **Ant Design 5.26.5** - Enterprise-level UI design language and component library

### Build Tools
- **Vite 6.3.5** - Fast build tool and development server
- **@crxjs/vite-plugin** - Chrome extension Vite plugin
- **TailwindCSS 4.1.8** - Utility-first CSS framework

### Development Tools
- **ESLint** - Code quality checking tool
- **Nodemon** - File change monitoring and auto-restart
- **pnpm** - Efficient package manager

### Extension APIs
- **Chrome Extension Manifest V3** - Latest extension manifest format
- **declarativeNetRequest** - Declarative network request interception
- **Chrome Storage API** - Data persistence storage

## 🚀 Quick Start

### Requirements

- **Node.js**: >= 16.0.0
- **pnpm**: >= 8.0.0 (Recommended to use pnpm)
- **Chrome**: >= 88.0.0 (Supports Manifest V3)

### Install Dependencies

```bash
# Clone project
git clone <repository-url>
cd vite-web-extension

# Install dependencies
pnpm install
```

### Development Mode

```bash
# Start Chrome extension development mode (hot reload)
pnpm run dev

# Or specify browser
pnpm run dev:chrome
pnpm run dev:firefox
```

Development mode will:
- Automatically monitor file changes
- Real-time rebuild extension
- Generate development version in `dist_chrome` directory

### Production Build

```bash
# Build Chrome extension
pnpm run build

# Or specify browser
pnpm run build:chrome
pnpm run build:firefox
```

Production build will:
- Optimize code and resources
- Generate compressed version
- Generate production version in `dist_chrome` directory

## 📦 Install Extension

### Chrome Browser

1. Open Chrome browser
2. Visit `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked extension"
5. Select the project's `dist_chrome` directory
6. Extension will appear in toolbar after installation

### Firefox Browser

1. Open Firefox browser
2. Visit `about:debugging#/runtime/this-firefox`
3. Click "Load temporary Add-on"
4. Select any file in `dist_firefox` directory (e.g., `manifest.json`)

## 📖 User Guide

### 1. Open Configuration Interface
- Click the extension icon in Chrome toolbar
- System will automatically open configuration interface in new tab
- Default will have a "Default Module" example

### 2. Create Module
- Click the "+" button on the right side of module tabs
- Enter module name (e.g., order.management)
- Module will automatically switch to new module after creation

### 3. Add API Configuration
Click "Add" button in the module and fill in the following information:

- **Interface Address**: Original API address (supports relative paths and complete URLs)
- **Redirect Address**: Mock server address
- **Interface Name**: Easy-to-identify name
- **Request Method**: GET, POST, PUT, DELETE, PATCH
- **Matching Method**: contains (contains), exact (exact), regex (regex)
- **Delay Time**: Response delay (milliseconds)
- **Mock Method**: redirect (redirect) or mockResponse (direct data return)

### 4. Manage API
- **Switch Control**: Click switch button to enable/disable individual API
- **Edit**: Click "Edit" button to modify API configuration
- **Clone**: Click "Clone" button to quickly copy API configuration
- **Delete**: Click "Delete" button to remove API configuration

### 5. Global Control
- **Global Switch**: Top switch controls all proxy functions
- **Module Switch**: Can individually control proxy for a specific module
- **Reset Function**: Support module reset and global reset

### 6. Import/Export
- **Export**: Click "Export" button to download current configuration as JSON file
- **Import**: Click "Import" button to upload JSON configuration file

## 📁 Project Structure

```
vite-web-extension/
├── public/                     # Static resources
│   ├── icon-128.png           # Extension icon
│   └── icon-32.png
├── src/                       # Source code
│   ├── assets/                # Resource files
│   │   ├── img/              # Image resources
│   │   └── styles/           # Style files
│   ├── locales/              # Internationalization files
│   ├── pages/                # Extension pages
│   │   ├── background/       # Background Script
│   │   ├── options/          # Configuration page
│   │   │   ├── components/   # Configuration page components
│   │   │   ├── index.html    # Configuration page HTML
│   │   │   └── index.tsx     # Configuration page entry
│   │   └── popup/            # Popup page (deprecated)
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── global.d.ts           # Global type declarations
├── dist_chrome/              # Chrome extension build output
├── dist_firefox/             # Firefox extension build output
├── manifest.json             # Extension manifest file
├── vite.config.base.ts       # Vite base configuration
├── vite.config.chrome.ts     # Chrome build configuration
├── vite.config.firefox.ts    # Firefox build configuration
├── tailwind.config.js        # TailwindCSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependency configuration
```

## 🔧 Development Guide

### Main Features
1. **Extension Behavior**: Click icon to open configuration interface in new tab instead of popup
2. **Default Module**: Automatically create default module with example API on startup
3. **Full-screen Layout**: Configuration interface uses full-screen layout for better operation experience
4. **Hot Reload**: Support automatic rebuild on file changes in development mode

### Adding New Features
1. Define types in `src/types/index.ts`
2. Add utility functions in `src/utils/`
3. Create components in `src/pages/options/components/`
4. Update main interface to integrate new features

### Debugging Tips
- Use Chrome DevTools to view Background Script logs
- Use React DevTools in configuration page
- Check Network panel to view request interception effects
- Use `console.log` to debug in Background Script

### Custom Configuration
- Modify `manifest.json` to adjust extension permissions and configuration
- Update `vite.config.*.ts` to customize build behavior
- Edit `tailwind.config.js` to customize style theme

## 📄 Configuration Format

### Import Format Example

- Reference project file: `example-config.json` for import example file;
- Example json:

```json
[
  {
    "apiDocKey": "order.management",
    "label": "Order Management",
    "apiArr": [
      {
        "apiKey": "/api/orders",
        "apiName": "Get Order List",
        "apiUrl": "http://localhost:3000/api/orders",
        "redirectURL": "http://127.0.0.1:4523/mock/api/orders",
        "method": "get",
        "filterType": "contains",
        "delay": 0,
        "isOpen": true,
        "mockWay": "redirect",
        "statusCode": 200
      }
    ]
  }
]
```

### Configuration Field Description
- `apiDocKey`: Module unique identifier
- `label`: Module display name
- `apiKey`: API unique identifier
- `apiName`: API display name
- `apiUrl`: Original API address
- `redirectURL`: Redirect target address
- `method`: HTTP request method
- `filterType`: URL matching method
- `delay`: Response delay time (milliseconds)
- `isOpen`: Whether enabled
- `mockWay`: Mock method (redirect/mockResponse)

## ⚠️ Notes

### Permission Requirements
- Extension needs access to all websites to intercept API requests
- Requires `declarativeNetRequest` permission for network request interception
- Requires `storage` permission to save configuration data

### Usage Limitations
- Some HTTPS websites may limit extension functionality
- Large number of API interceptions may affect page performance
- Do not use sensitive data Mock configuration in production environment

### Browser Compatibility
- Chrome >= 88.0.0 (Supports Manifest V3)
- Firefox >= 109.0.0 (Supports Manifest V3)
- Other Chromium-based browsers

### Development Recommendations
- Use `pnpm` as package manager for better performance
- Use `pnpm run dev` to start hot reload during development
- Regularly backup important configuration data
- Test with different websites to verify functionality

## 📄 License

MIT License

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

### Contributing Guide
1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Environment Setup
1. Clone repository
2. Run `pnpm install`
3. Run `pnpm run dev`
4. Load extension in Chrome for testing

---

<div align="center">
<p>If this project helps you, please give it a ⭐️ Star!</p>
<p>Made with ❤️ by the development team</p>
</div>
