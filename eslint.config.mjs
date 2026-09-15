import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({ baseDirectory: path.dirname(fileURLToPath(import.meta.url)) });
const config = [
  { ignores: [".next/**", "out/**", "node_modules/**", "worker/**", "src/lib/*.generated.ts", "coverage/**"] },
  ...compat.extends("next/core-web-vitals"),
  { rules: { "@typescript-eslint/no-explicit-any": "off", "@typescript-eslint/no-unused-vars": "off", "react/no-unescaped-entities": "off" } },
];
export default config;
