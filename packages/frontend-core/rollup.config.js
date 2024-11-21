import svelte from "rollup-plugin-svelte"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import postcss from "rollup-plugin-postcss"
import alias from "@rollup/plugin-alias"
import image from "@rollup/plugin-image"
import typescript from "@rollup/plugin-typescript"
import { sveltePreprocess } from "svelte-preprocess"
import copy from "rollup-plugin-copy"
import path from "path"
import { createRequire } from "module"
const packageJson = createRequire(import.meta.url)("./package.json")

const production = !process.env.ROLLUP_WATCH
const devPaths = production
  ? []
  : [
      {
        find: "@budibase/bbui",
        replacement: path.resolve("../bbui"),
      },
      {
        find: "@budibase/shared-core",
        replacement: path.resolve("../shared-core"),
      },
      {
        find: "@budibase/string-templates",
        replacement: path.resolve("../string-templates"),
      },
      {
        find: "@budibase/types",
        replacement: path.resolve("../types"),
      },
    ]

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.exports["."].import,
        format: "esm",
      },
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "EVAL") {
        return
      }
      warn(warning)
    },
    plugins: [
      alias({
        entries: devPaths,
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
        extensions: [".js", ".ts", ".svelte"],
        exportConditions: ["svelte"],
      }),
      svelte({
        compilerOptions: {
          dev: !production,
        },
        emitCss: true,
        preprocess: sveltePreprocess(),
        extensions: [".svelte"],
      }),
      typescript({
        include: ["src/**/*"],
        sourceMap: false,
        outputToFilesystem: false,
      }),
      commonjs(),
      postcss(),
      image(),
      copy({
        targets: [
          { src: "assets", dest: "dist" },
          { src: "themes", dest: "dist" },
        ],
      }),
    ],
  },
]
