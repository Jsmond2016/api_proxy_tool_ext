# API Proxy Tool

> **Updated**: 2026-07-14; **Model**: Codex (GPT-5); **User**: Jsmond2016

---

<div align="center">
  <img src="public/icon-128.png" alt="API Proxy Tool Logo" width="128" height="128" />
  <p><strong>API Mock proxy extension for Chrome, Edge, and Firefox</strong></p>
  <p>Manage request redirection rules, synchronize Apifox APIs, archive iteration snapshots, and generate permission data.</p>

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vite.dev/)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-4285F4.svg)](https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak)

[中文](./README.md) · **English** · [Documentation](https://jsmond2016.github.io/api_proxy_tool_ext/)

</div>

## Features

- Redirect matching API requests to Mock URLs with Manifest V3 `declarativeNetRequest`.
- Organize APIs in modules with an aggregated All APIs view, search, and status sorting.
- Add, edit, clone, migrate, delete, batch-delete, test, and isolate individual APIs for debugging.
- Synchronize OpenAPI data from Apifox by project ID and tags, with conflict handling and refresh previews.
- Attach requirement, technical, prototype, test case, and schedule documents to iteration tags.
- Archive and restore complete workspace snapshots in IndexedDB.
- Generate CMS permission data for selected APIs, a module, or the complete workspace.
- Receive cross-extension `BATCH_QUICK_MOCK` requests and create enriched external Mock modules.
- Build Chrome/Edge and Firefox extensions from the same codebase.

See the [complete Chinese user guide](./docs/guide/extension-usage.md) for detailed workflows.

## Install

- [Chrome Web Store](https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN)

To build from source, use the versions pinned in `package.json`: Node.js `22.17.0` and pnpm `10.5.2`.

```bash
git clone https://github.com/Jsmond2016/api_proxy_tool_ext.git
cd api_proxy_tool_ext
pnpm install
pnpm build:chrome
```

Open `chrome://extensions/`, enable Developer mode, choose Load unpacked, and select `dist_chrome/`.

For Firefox:

```bash
pnpm build:firefox
```

Open `about:debugging#/runtime/this-firefox`, choose Load Temporary Add-on, and select `dist_firefox/manifest.json`.

## Quick Use

1. Open the extension popup, enable Global Mock, and open the configuration page.
2. Select the default module or create one from the module tabs.
3. Add an API with its original URL, display name, Mock URL, method, and match mode.
4. Enable the API row switch.
5. Test the Mock URL, then issue the actual request from the target page.

The current Apifox synchronization UI requires a numeric project ID, a personal Access Token, a cloud Mock token, and one or more tags.

> Never store Apifox tokens or other credentials in the repository, issues, screenshots, or shared documentation.

## Development

| Command              | Purpose                                |
| :------------------- | :------------------------------------- |
| `pnpm dev`           | Start Chrome development mode          |
| `pnpm dev:firefox`   | Start Firefox development mode         |
| `pnpm build:chrome`  | Build into `dist_chrome/`              |
| `pnpm build:firefox` | Build into `dist_firefox/`             |
| `pnpm test`          | Run Vitest tests                       |
| `pnpm lint`          | Lint TypeScript and React source files |
| `pnpm docs:dev`      | Start the VitePress documentation site |
| `pnpm docs:build`    | Build the documentation site           |

## Documentation

- [Getting Started](./docs/guide/getting-started.md)
- [Feature User Guide](./docs/guide/extension-usage.md)
- [Cross-extension Quick Mock Integration](./docs/api-reference/quick-mock-debug.md)
- [Architecture](./docs/architecture/index.md)
- [Release Process](./docs/publishing/release-guide.md)
- [Changelog](./CHANGELOG.md)

The documentation site is deployed to <https://jsmond2016.github.io/api_proxy_tool_ext/>.

## Data And Permissions

The extension uses browser storage for configuration and IndexedDB for archives and parsed API caches. It requires `declarativeNetRequest` and HTTP/HTTPS host access to create and apply request redirection rules.

See the [privacy statement](./docs/publishing/privacy.md) for details.

## License

[MIT](./LICENSE)
