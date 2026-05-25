# Chrome Web Store Listing Details

> Content for Chrome Web Store developer console listing.

## Short Description

API request interception and mock data management tool with declarative network request redirection.

## Detailed Description

API Proxy Tool is a powerful browser extension designed to streamline frontend development by providing seamless API request interception and redirection capabilities.

**Features:**

- Smart API Interception: Automatically intercepts API requests and redirects to specified mock servers
- Modular Management: Organize API configurations into multiple modules for different projects
- Flexible Matching: Supports contains, exact match, and regex URL matching methods
- Response Control: Configure response delays to simulate real network conditions
- Direct Mock Responses: Return mock data directly without external servers
- Batch Operations: Enable/disable entire modules or individual APIs
- Real-time Search: Quickly locate APIs by name or URL
- Apifox Sync: Sync API configurations from Apifox

**Use Cases:**

- Frontend development with mock data
- API testing and debugging
- Microservices development
- Team collaboration on API interfaces
- Rapid prototyping and demos

## Category

Developer Tools

## Language

English (en)

## Screenshot Descriptions

| Screenshot   | Content                                   |
| ------------ | ----------------------------------------- |
| Screenshot 1 | Extension popup main interface            |
| Screenshot 2 | Module management and API rule list       |
| Screenshot 3 | Add/edit API proxy rule                   |
| Screenshot 4 | Apifox sync configuration                 |
| Screenshot 5 | Global settings and permission management |

## Permission Justifications

| Permission                      | Purpose                                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `activeTab`                     | Gets the active tab's URL info, temporarily effective only when user clicks the extension icon       |
| `storage`                       | Persistently stores module configurations, API rules and settings                                    |
| `declarativeNetRequest`         | Uses declarative rules to intercept and redirect API requests, does not read request/response bodies |
| `declarativeNetRequestFeedback` | Retrieves rule matching results for display in the interface                                         |
| `<all_urls>`                    | Allows users to customize the domain scope for request interception                                  |
