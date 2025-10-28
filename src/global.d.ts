declare global {
	interface HTMLElementTagNameMap {
		"table-of-contents": HTMLElement & {
			init?: () => void;
		};
	}

	interface Window {
		// Define swup type directly since @swup/astro doesn't export AstroIntegration
		swup: any;
		live2dModelInitialized?: boolean;
		spineModelInitialized?: boolean;
		spinePlayerInstance?: any;
		pagefind: {
			search: (query: string) => Promise<{
				results: Array<{
					data: () => Promise<SearchResult>;
				}>;
			}>;
		};

		mobileTOCInit?: () => void;

		// Custom scroll detection properties
		semifullScrollHandler?: ((event: Event) => void) | null;
		initSemifullScrollDetection?: () => void;

		// Icon loader
		__iconifyLoader?: {
			load: () => Promise<void>;
		};

		// CMS Config
		CMS_CONFIG?: any;
	}
}

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}

export {};
