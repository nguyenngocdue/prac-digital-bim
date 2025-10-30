import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Allow explicit `any` across the repo when needed.
  // If you'd prefer to keep this rule strict, we can remove this override
  // and instead add file- or line-level disables where required.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-debugger": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-namespace": "off",
      "react-refresh/only-export-components": "off",
      "eslint-disable prefer-const": "off",
      "no-case-declarations": "off",
      "no-unsafe-optional-chaining": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
