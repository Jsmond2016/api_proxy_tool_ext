# Chrome Extension Store Submission Guide

## Extension Info

| Field           | Value                                                      |
| --------------- | ---------------------------------------------------------- |
| **Name**        | API Proxy Tool                                             |
| **Version**     | 1.5.29                                                     |
| **Description** | A browser extension for proxying API requests to mock URLs |
| **Category**    | Developer Tools                                            |
| **Language**    | English (en)                                               |

## Pre-publish Checklist

- [ ] Extension icon 128x128 ready (`public/icon-128.png`)
- [ ] At least 1 feature screenshot prepared (3-5 screenshots at 1280x800 recommended)
- [ ] Screenshot files exist in `public/screenshots/` directory
- [ ] Detailed description completed
- [ ] Category set to "Developer Tools"
- [ ] Permission justification provided for each permission
- [ ] Data privacy declaration states "no user data collected"
- [ ] ZIP package ready
- [ ] Version number confirmed
- [ ] Functionality tested locally
- [ ] Edge add-ons extras: search terms, age rating, publisher info

## Permissions Justification

| Permission                      | Purpose                                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTab`                     | Gets the current active tab's URL information, temporarily effective only when user clicks the extension icon, used to quickly fill in the current site address in the configuration page |
| `storage`                       | Persistently stores user's module configurations, API rules and settings; uses `chrome.storage.sync` to sync settings across devices signed into the same account                         |
| `declarativeNetRequest`         | Uses declarative network request rules to intercept and redirect API requests to mock servers without reading request/response bodies                                                     |
| `declarativeNetRequestFeedback` | Retrieves matching results and debug info of network request rules, used to display which rules matched a request in the UI                                                               |
| `<all_urls>` (host_permissions) | Allows users to customize the domain scope for interception in the configuration; the extension only intercepts requests under domains explicitly configured by the user                  |

## Build & Package

```bash
# Build
pnpm build:chrome

# Package
cd dist_chrome && zip -r ../extension-v1.5.29.zip . && cd ..
```

## Submission Process

### Chrome Web Store

1. Visit https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. Upload the ZIP package and fill in the form

### Edge Add-ons

1. Visit https://partner.microsoft.com/ → "Edge Add-ons"
2. Sign in with your Microsoft account
3. Upload the ZIP package, fill in the form (align with Chrome):
   - Search terms: API Proxy, Mock, frontend development, API interception, proxy tool
   - Pricing: Free
   - Visibility: Public
   - Age rating: 3+
