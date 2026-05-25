# Privacy Policy

**API Proxy Tool** (v1.5.29)

## Data Collection and Use

1. This extension does NOT collect, upload, or share any user data to remote servers.
2. All data is processed locally in the browser and never leaves the user's device.
3. User configurations are stored via chrome.storage.sync for syncing across browsers signed into the same account.
4. This extension does NOT read or store browsing history, bookmarks, passwords, or other personal information.
5. No data is sent to any third-party services.
6. No remote code is executed; all code is packaged within the extension.

## Permission Usage

| Permission                      | Purpose                                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `activeTab`                     | Gets the active tab's URL info, temporarily effective only when user clicks the extension icon       |
| `storage`                       | Persistently stores module configurations, API rules and settings                                    |
| `declarativeNetRequest`         | Uses declarative rules to intercept and redirect API requests, does not read request/response bodies |
| `declarativeNetRequestFeedback` | Retrieves rule matching results and debug info for displaying request match status in the UI         |
| `<all_urls>` (host_permissions) | Allows users to customize the domain scope for request interception in the configuration             |

## Data Retention

Users can revoke all data access by uninstalling the extension. Saved configuration data can be cleared via the extension options page at chrome://extensions.

## Updates

This privacy policy is updated as the extension version changes. Material changes will be communicated in the extension update notes.
