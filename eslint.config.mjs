import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends("eslint:recommended"),
    {
        languageOptions: {
            globals: {
                ...globals.node,
                Atomics: "readonly",
                SharedArrayBuffer: "readonly",
            },
            ecmaVersion: "latest",
            sourceType: "module",
        },
        
        rules: {
            // Error prevention
            "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
            "no-console": ["error", { allow: ["warn", "error"] }],
            "no-return-await": "error",
            
            // Style consistency
            "semi": ["error", "always"],
            "quotes": ["error", "single"],
            "indent": ["error", 2],
            
            // Modern JavaScript
            "prefer-const": "error",
            "arrow-body-style": ["error", "as-needed"],
            "object-shorthand": "error",
            
            // Async/Promise handling
            "require-await": "error",
            "no-async-promise-executor": "error",
            "no-promise-executor-return": "error"
        },
    }
];