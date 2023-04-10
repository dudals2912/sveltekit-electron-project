import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { viteStaticCopy } from "vite-plugin-static-copy";

const config: UserConfig = {
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{ src: "node_modules/scichart/_wasm/scichart2d.data", dest: "" },
				{ src: "node_modules/scichart/_wasm/scichart2d.wasm", dest: "" },
			],
		}),
	]
};

export default config;
