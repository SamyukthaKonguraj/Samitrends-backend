import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import tailwind from "eslint-plugin-tailwindcss";

export default defineConfig({
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:tailwindcss/recommended"
  ],
  plugins: {
    react,
    tailwind
  },
  rules: {
    "no-unused-vars": "warn"
  },
  settings: {
    react: { version: "detect" }
  }
});
