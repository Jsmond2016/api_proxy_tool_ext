import fs from "fs"
import { resolve } from "path"
import type { PluginOption } from "vite"

// plugin to remove dev icons from prod build
export function stripDevIcons(isDev: boolean) {
  if (isDev) return null

  return {
    name: "strip-dev-icons",
    resolveId(source: string) {
      return source === "virtual-module" ? source : null
    },
    renderStart(outputOptions: { dir: string }) {
      const outDir = outputOptions.dir
      fs.rm(resolve(outDir, "dev-icon-32.png"), () =>
        console.log(`Deleted dev-icon-32.png from prod build`)
      )
      fs.rm(resolve(outDir, "dev-icon-128.png"), () =>
        console.log(`Deleted dev-icon-128.png from prod build`)
      )
    },
  }
}

// plugin to clean .vite folder after build
export function cleanViteFolder(): PluginOption {
  return {
    name: "clean-vite-folder",
    closeBundle() {
      const outDir = process.env.VITE_OUT_DIR || "dist_chrome"
      const viteFolderPath = resolve(outDir, ".vite")

      if (fs.existsSync(viteFolderPath)) {
        fs.rmSync(viteFolderPath, { recursive: true, force: true })
        console.log(`Cleaned .vite folder from ${outDir}`)
      }
    },
  }
}

// plugin to support i18n
export function crxI18n(options: {
  localize: boolean
  src: string
}): PluginOption {
  if (!options.localize) return null

  const getJsonFiles = (dir: string): Array<string> => {
    const files = fs.readdirSync(dir, { recursive: true }) as string[]
    return files.filter((file) => !!file && file.endsWith(".json"))
  }
  const entry = resolve(__dirname, options.src)
  const localeFiles = getJsonFiles(entry)
  const files = localeFiles.map((file) => {
    return {
      id: "",
      fileName: file,
      source: fs.readFileSync(resolve(entry, file)),
    }
  })
  return {
    name: "crx-i18n",
    enforce: "pre",
    buildStart: {
      order: "post",
      handler() {
        files.forEach((file) => {
          const refId = this.emitFile({
            type: "asset",
            source: file.source,
            fileName: "_locales/" + file.fileName,
          })
          file.id = refId
        })
      },
    },
  }
}

// plugin to copy injector scripts to output directory
export function copyInjectorScripts(): PluginOption {
  return {
    name: "copy-injector-scripts",
    enforce: "pre",
    buildStart: {
      order: "post",
      handler() {
        const injectorPath = resolve(
          __dirname,
          "src/injectors/globalResponseInjector.js"
        )
        if (fs.existsSync(injectorPath)) {
          const source = fs.readFileSync(injectorPath, "utf-8")
          this.emitFile({
            type: "asset",
            source: source,
            fileName: "globalResponseInjector.js",
          })
          console.log("Copied globalResponseInjector.js to build output")
        }
      },
    },
  }
}
