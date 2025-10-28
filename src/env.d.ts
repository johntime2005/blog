/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

// Extend ImportMetaEnv if needed
interface ImportMetaEnv {}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

