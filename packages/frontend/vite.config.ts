import path from 'path';
import pluginReplace from '@rollup/plugin-replace';
import type { RollupReplaceOptions } from '@rollup/plugin-replace';
import pluginVue from '@vitejs/plugin-vue';
import { type UserConfig, defineConfig } from 'vite';

import locales from '../../locales/index.js';
import meta from '../../package.json';
import packageInfo from './package.json' assert { type: 'json' };
import pluginUnwindCssModuleClassName from './lib/rollup-plugin-unwind-css-module-class-name.js';
import pluginJson5 from './vite.json5.js';

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.json5', '.svg', '.sass', '.scss', '.css', '.vue', '.wasm'];

/**
 * Misskeyのフロントエンドにバンドルせず、CDNなどから別途読み込むリソースを記述する。
 * CDNを使わずにバンドルしたい場合、以下の配列から該当要素を削除orコメントアウトすればOK
 */
const externalPackages = [
	// shiki（コードブロックのシンタックスハイライトで使用中）はテーマ・言語の定義の容量が大きいため、それらはCDNから読み込む
	{
		name: 'shiki',
		match: /^shiki\/(?<subPkg>(langs|themes))$/,
		path(id: string, pattern: RegExp): string {
			const match = pattern.exec(id)?.groups;
			return match
				? `https://esm.sh/shiki@${packageInfo.dependencies.shiki}/${match['subPkg']}`
				: id;
		},
	},
];

const hash = (str: string, seed = 0): number => {
	let h1 = 0xdeadbeef ^ seed,
		h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}

	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const BASE62_DIGITS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function toBase62(n: number): string {
	if (n === 0) {
		return '0';
	}
	let result = '';
	while (n > 0) {
		result = BASE62_DIGITS[n % BASE62_DIGITS.length] + result;
		n = Math.floor(n / BASE62_DIGITS.length);
	}

	return result;
}

function iconsReplace(opts: RollupReplaceOptions) {
	return pluginReplace({
		...opts,
		preventAssignment: false,
		// only replace these strings at the start of strings, remove a
		// `ti-fw` it if happens to be just after, and make sure they're
		// followed by a word-boundary that's not a dash
		delimiters: ['(?<=["\'`])', '(?: ti-fw)?\\b(?!-)'],
	});
}

export function getConfig(): UserConfig {
	return {
		base: '/vite/',

		server: {
			port: 5173,
		},

		plugins: [
			pluginVue(),
			pluginUnwindCssModuleClassName(),
			pluginJson5(),
			iconsReplace({
				values: {
					'ti ti-alert-triangle': 'ph-warning ph-bold ph-lg',
				},
				exclude: [
					'**/components/MkAnnouncementDialog.*',
					'**/pages/announcement.*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-alert-triangle': 'ph-warning-circle ph-bold ph-lg',
				},
				include: [
					'**/components/MkAnnouncementDialog.*',
					'**/pages/announcement.*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-reload': 'ph-arrow-clockwise ph-bold ph-lg',
				},
				exclude: [
					'**/pages/settings/emoji-picker.*',
					'**/pages/flash/flash.*',
					'**/components/MkPageWindow.*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-reload': 'ph-arrow-counter-clockwise ph-bold ph-lg',
				},
				include: [
					'**/pages/settings/emoji-picker.*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-reload': 'ph-arrows-clockwise ph-bold ph-lg',
				},
				include: [
					'**/pages/flash/flash.*',
					'**/components/MkPageWindow.*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-photo': 'ph-image-square ph-bold ph-lg',
				},
				exclude: [
					'**/pages/admin-user.*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-photo': 'ph-image ph-bold ph-lg',
				},
				include: [
					'**/pages/admin-user.*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-repeat': 'ph-rocket-launch ph-bold ph-lg',
				},
				exclude: [
					'**/components/MkMedia*',
					'**/scripts/get-user-menu.*',
					'**/pages/gallery/post.*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-repeat': 'ph ph-repeat ph-bold ph-lg',
				},
				include: [
					'**/components/MkMedia*',
					'**/scripts/get-user-menu.*',
					'**/pages/gallery/post.*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-clock-play': 'ph-clock ph-bold ph-lg',
				},
				exclude: [
					'**/components/MkMedia*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-clock-play': 'ph ph-gauge ph-bold ph-lg',
				},
				include: [
					'**/components/MkMedia*',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-apps': 'ph-squares-four ph-bold ph-lg',
				},
				include: [
					'**/pages/**',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-apps': 'ph-stack ph-bold ph-lg',
				},
				include: [
					'**/ui/**',
				],
			}),
			iconsReplace({
				values: {
					'ti ti-terminal-2': 'ph-terminal-window ph-bold ph-lg',
					'ti ti-download': 'ph-download ph-bold ph-lg',
					'ti ti-circle-x': 'ph-x-circle ph-bold ph-lg',
					'ti ti-plus': 'ph-plus ph-bold ph-lg',
					'ti ti-planet': 'ph-planet ph-bold ph-lg',
					'ti ti-world-x': 'ph-planet ph-bold ph-lg',
					'ti ti-chevron-right': 'ph-caret-right ph-bold ph-lg',
					'ti ti-chevrons-right': 'ph-caret-right ph-bold ph-lg',
					'ti ti-dots': 'ph-dots-three ph-bold ph-lg',
					'ti ti-check': 'ph-check ph-bold ph-lg',
					'ti ti-device-floppy': 'ph-floppy-disk ph-bold ph-lg',
					'ti ti-shield': 'ph-shield ph-bold ph-lg',
					'ti ti-shield-lock': 'ph-shield ph-bold ph-lg',
					'ti ti-confetti': 'ph-confetti ph-bold ph-lg',
					'ti ti-home': 'ph-house ph-bold ph-lg',
					'ti ti-clock': 'ph-clock ph-bold ph-lg',
					'ti ti-pencil': 'ph-pencil-simple ph-bold ph-lg',
					'ti ti-arrow-right': 'ph-arrow-right ph-bold ph-lg',
					'ti ti-pin': 'ph-push-pin ph-bold ph-lg',
					'ti ti-heart': 'ph-heart ph-bold ph-lg',
					'ti ti-heart-filled': 'ph-heart ph-bold ph-lg',
					'ti ti-heart-plus': 'ph-heart ph-bold ph-lg',
					'ti ti-arrow-left': 'ph-arrow-left ph-bold ph-lg',
					'ti ti-settings': 'ph-gear ph-bold ph-lg',
					'ti ti-link': 'ph-link ph-bold ph-lg',
					'ti ti-key': 'ph-key ph-bold ph-lg',
					'ti ti-code': 'ph-code ph-bold ph-lg',
					'ti ti-star': 'ph-star ph-bold ph-lg',
					'ti ti-eye': 'ph-eye ph-bold ph-lg',
					'ti ti-eye-off': 'ti ti-eye-exclamation',
					'ti ti-eye-exclamation': 'ph-eye-slash ph-bold ph-lg',
					'ti ti-lock': 'ph-lock ph-bold ph-lg',
					'ti ti-users': 'ph-users ph-bold ph-lg',
					'ti ti-exclamation-circle': 'ph-warning-circle ph-bold ph-lg',
					'ti ti-user-exclamation': 'ph-warning-circle ph-bold ph-lg',
					'ti ti-info-circle': 'ph-info ph-bold ph-lg',
					'ti ti-checklist': 'ph-list-checks ph-bold ph-lg',
					'ti ti-plane-departure': 'ph-airplane-takeoff ph-bold ph-lg',
					'ti ti-minus': 'ph-minus ph-bold ph-lg',
					'ti ti-device-tv': 'ph-television ph-bold ph-lg',
					'ti ti-cookie': 'ph-cookie ph-bold ph-lg',
					'ti ti-copy': 'ph-copy ph-bold ph-lg',
					'ti ti-chevron-up': 'ph-caret-up ph-bold ph-lg',
 					'ti ti-chevron-down': 'ph-caret-down ph-bold ph-lg',
 					'ti ti-caret-down': 'ph-caret-down ph-bold ph-lg',
					'ti ti-help-circle': 'ph-question ph-bold ph-lg',
					'ti ti-x': 'ph-x ph-bold ph-lg',
					'ti ti-folder': 'ph-folder ph-bold ph-lg',
					'ti ti-folder-plus': 'ph-folder-plus ph-bold ph-lg',
					'ti ti-app-window': 'ph-app-window ph-bold ph-lg',
					'ti ti-forms': 'ph-textbox ph-bold ph-lg',
					'ti ti-trash': 'ph-trash ph-bold ph-lg',
					'ti ti-id': 'ph-identification-card ph-bold ph-lg',
					'ti ti-cloud': 'ph-cloud ph-bold ph-lg',
					'ti ti-upload': 'ph-upload ph-bold ph-lg',
					'ti ti-video': 'ph-video ph-bold ph-lg',
					'ti ti-file': 'ph-file ph-bold ph-lg',
					'ti ti-file-music': 'ph-file-audio ph-bold ph-lg',
					'ti ti-file-text': 'ph-file-text ph-bold ph-lg',
					'ti ti-file-zip': 'ph-file-zip ph-bold ph-lg',
					'ti ti-file-invoice': 'ph-newspaper-clipping ph-bold ph-lg',
					'ti ti-asterisk': 'ph-asterisk ph-bold ph-lg',
					'ti ti-mood-happy': 'ph-smiley ph-bold ph-lg',
					'ti ti-leaf': 'ph-leaf ph-bold ph-lg',
					'ti ti-hash': 'ph-hash ph-bold ph-lg',
					'ti ti-hourglass-empty': 'ph-hourglass ph-bold ph-lg',
					'ti ti-search': 'ph-magnifying-glass ph-bold ph-lg',
					'ti ti-external-link': 'ph-arrow-square-out ph-bold ph-lg',
					'ti ti-music': 'ph-music-notes ph-bold ph-lg',
					'ti ti-player-pause': 'ph-pause ph-bold ph-lg',
					'ti ti-player-pause-filled': 'ph-pause ph-bold ph-lg',
					'ti ti-player-play': 'ph-play ph-bold ph-lg',
					'ti ti-player-play-filled': 'ph-play ph-bold ph-lg',
					'ti ti-volume-3': 'ph-speaker-x ph-bold ph-lg',
					'ti ti-volume': 'ph-speaker-high ph-bold ph-lg',
					'ti ti-player-eject': 'ph-eject ph-bold ph-lg',
					'ti ti-player-stop': 'ph-stop ph-bold ph-lg',
					'ti ti-player-track-next': 'ph-skip-forward ph-bold ph-lg',
					'ti ti-rocket': 'ph-rocket-launch ph-bold ph-lg',
					'ti ti-rocket-off': 'ph-rocket ph-bold ph-lg',
					'ti ti-repeat-off': 'ph-repeat ph-bold ph-lg',
					'ti ti-movie': 'ph-film-strip ph-bold ph-lg',
					'ti ti-arrows-minimize': 'ph-arrows-in ph-bold ph-lg',
					'ti ti-arrows-maximize': 'ph-arrows-out ph-bold ph-lg',
					'ti ti-arrows-up': 'ph-arrow-line-up ph-bold ph-lg',
					'ti ti-arrows-sort': 'ph-arrows-down-up ph-bold ph-lg',
					'ti ti-arrows-move': 'ph-arrows-out-cardinal ph-bold ph-lg',
					'ti ti-arrow-bar-to-down': 'ph-arrow-line-down ph-bold ph-lg',
					'ti ti-arrow-narrow-up': 'ph-arrow-up ph-bold ph-lg',
					'ti ti-arrow-big-right': 'ph-arrow-fat-right ph-bold ph-lg',
					'ti ti-arrow-up': 'ph-arrow-up ph-bold ph-lg',
					'ti ti-arrow-down': 'ph-arrow-down ph-bold ph-lg',
					'ti ti-arrow-back-up': 'ph-arrow-u-up-left ph-bold ph-lg',
					'ti ti-quote': 'ph-quotes ph-bold ph-lg',
					'ti ti-send': 'ph-paper-plane-tilt ph-bold ph-lg',
					'ti ti-speakerphone': 'ph-megaphone ph-bold ph-lg',
					'ti ti-bolt': 'ph-lightning ph-bold ph-lg',
					'ti ti-mail': 'ph-envelope ph-bold ph-lg',
					'ti ti-paperclip': 'ph-paperclip ph-bold ph-lg',
					'ti ti-ban': 'ph-prohibit ph-bold ph-lg',
					'ti ti-chevron-double-right': 'ph-caret-double-right ph-bold ph-lg',
					'ti ti-at': 'ph-at ph-bold ph-lg',
					'ti ti-chart-arrows': 'ph-chart-bar-horizontal ph-bold ph-lg',
					'ti ti-medal': 'ph-trophy ph-bold ph-lg',
					'ti ti-trophy': 'ph-trophy ph-bold ph-lg',
					'ti ti-badges': 'ph-seal-check ph-bold ph-lg',
					'ti ti-badge': 'ph-seal-check ph-bold ph-lg',
					'ti ti-window-maximize': 'ph-frame-corners ph-bold ph-lg',
					'ti ti-password': 'ph-password ph-bold ph-lg',
					'ti ti-123': 'ph-numpad ph-bold ph-lg',
					'ti ti-world': 'ph-globe-hemisphere-west ph-bold ph-lg',
					'ti ti-plug': 'ph-plug ph-bold ph-lg',
					'ti ti-palette': 'ph-palette ph-bold ph-lg',
					'ti ti-text-caption': 'ph-text-indent ph-bold ph-lg',
					'ti ti-crop': 'ph-crop ph-bold ph-lg',
					'ti ti-crown': 'ph-crown ph-bold ph-lg',
					'ti ti-user': 'ph-user ph-bold ph-lg',
					'ti ti-brand-x': 'ph-twitter-logo ph-bold ph-lg',
					'ti ti-picture-in-picture': 'ph-picture-in-picture ph-bold ph-lg',
					'ti ti-user-edit': 'ph-user-list ph-bold ph-lg',
					'ti ti-user-plus': 'ph-user-plus ph-bold ph-lg',
					'ti ti-bell-plus': 'ph-bell-ringing ph-bold ph-lg',
					'ti ti-bell-ringing-2': 'ph-bell-ringing ph-bold ph-lg',
					'ti ti-maximize': 'ph-frame-corners ph-bold ph-lg',
					'ti ti-minimize': 'ph-arrows-in-simple ph-bold ph-lg',
					'ti ti-rectangle': 'ph-frame-corners ph-bold ph-lg',
					'icon ti ti-brand-youtube': 'icon ph-youtube-logo ph-bold ph-lg',
					'ti ti-snowflake': 'ph-snowflake ph-bold ph-lg',
					'ti ti-feather': 'ph-feather ph-bold ph-lg',
					'ti ti-dice-5': 'ph ph-dice-five ph-bold ph-lg',
					'ti ti-world-search': 'ph-binoculars ph-bold ph-lg',
					'ti ti-list': 'ph-list ph-bold ph-lg',
					'ti ti-antenna': 'ph-flying-saucer ph-bold ph-lg',
					'ti ti-news': 'ph-newspaper ph-bold ph-lg',
					'ti ti-device-gamepad': 'ph-game-controller ph-bold ph-lg',
					'ti ti-devices': 'ph-devices ph-bold ph-lg',
					'ti ti-user-shield': 'ph-newspaper-clipping ph-bold ph-lg',
					'ti ti-checkup-list': 'ph-list-checks ph-bold ph-lg',
					'ti ti-license': 'ph-notebook ph-bold ph-lg',
					'ti ti-notebook': 'ph-notebook ph-bold ph-lg',
					'ti ti-message': 'ph-envelope ph-bold ph-lg',
					'ti ti-messages': 'ph-envelope ph-bold ph-lg',
					'ti ti-user-circle': 'ph-user-circle ph-bold ph-lg',
					'ti ti-menu-2': 'ph-list ph-bold ph-lg',
					'ti ti-menu': 'ph-list ph-bold ph-lg',
					'ti ti-ad': 'ph-flag ph-bold ph-lg',
					'ti ti-paint': 'ph-paint-roller ph-bold ph-lg',
					'ti ti-database': 'ph-database ph-bold ph-lg',
					'ti ti-whirl': 'ph-globe-hemisphere-west ph-bold ph-lg',
					'ti ti-lock-open': 'ph-lock-open ph-bold ph-lg',
					'ti ti-photo-plus': 'ph-image-square ph-bold ph-lg',
					'ti ti-universe': 'ph-rocket-launch ph-bold ph-lg',
					'ti ti-sparkles': 'ph-sparkle ph-bold ph-lg',
					'ti ti-ghost': 'ph-ghost ph-bold ph-lg',
					'ti ti-adjustments': 'ph-faders ph-bold ph-lg',
					'ti ti-chevrons-left': 'ph-caret-dobule-left ph-bold ph-lg',
					'ti ti-chevron-left': 'ph-caret-left ph-bold ph-lg',
					'ti ti-dice': 'ph ph-dice-five ph-bold ph-lg',
					'ti ti-pencil-plus': 'ph-plus ph-bold pg-lg',
					'ti ti-mood-smile': 'ph-smiley ph-bold pg-lg',
					'ti ti-bell': 'ph-bell ph-bold ph-lg',
					'ti ti-bell-off': 'ph-bell ph-bold ph-lg',
					'ti ti-tool': 'ph-wrench ph-bold ph-lg',
					'ti ti-refresh': 'ph-arrows-counter-clockwise ph-bold ph-lg',
					'ti ti-section': 'ph-selection-all ph-bold ph-lg',
					'ti ti-selector': 'ph-caret-up-down ph-bold ph-lg',
					'ti ti-chart-line': 'ph-chart-line ph-bold ph-lg',
					'ti ti-stack-2': 'ph-stack ph-bold ph-lg',
					'ti ti-server': 'ph-hard-drives ph-bold ph-lg',
					'ti ti-cpu': 'ph-cpu ph-bold ph-lg',
					'ti ti-rss': 'ph-rss ph-bold ph-lg',
					'ti ti-camera': 'ph-camera ph-bold ph-lg',
					'ti ti-note': 'ph-note ph-bold ph-lg',
					'ti ti-cake': 'ph-cake ph-bold ph-lg',
					'ti ti-circle-minus': 'ph-minus-circle ph-bold ph-lg',
					'ti ti-dashboard': 'ph-gauge ph-bold ph-lg',
					'ti ti-grid-dots': 'ph-dots-nine ph-bold ph-lg',
					'ti ti-presentation': 'ph-presentation ph-bold ph-lg',
					'ti ti-bulb': 'ph-libghtbulb ph-bold ph-lg',
					'ti ti-link-off': 'ph-link-break ph-bold ph-lg',
					'ti ti-messages-off': 'ph-envelope-open ph-bold ph-lg',
					'ti ti-share': 'ph-share-network ph-bold ph-lg',
					'ti ti-edit': 'ph-pencil-simple-line ph-bold ph-lg',
					'ti ti-list-search': 'ph-list ph-bold ph-lg-search',
					'ti ti-equal-not': 'ph-prohibit ph-bold ph-lg',
					'ti ti-world-download': 'ph-cloud-arrow-down ph-bold ph-lg',
					'ti ti-world-upload': 'ph-cloud-arrow-up ph-bold ph-lg',
					'ti ti-access-point': 'ph-broadcast ph-bold ph-lg',
					'ti ti-point': 'ph-circle ph-bold ph-lg',
					'ti ti-checkbox': 'ph-check ph-bold ph-lg',
					'ti ti-flare': 'ph-fire ph-bold ph-lg',
					'ti ti-calendar-time': 'ph-calendar ph-bold ph-lg',
					'ti ti-calendar': 'ph-calendar ph-bold ph-lg',
					'ti ti-comet': 'ph-shooting-star ph-bold ph-lg',
					'ti ti-apple': 'ph-orange-slice ph-bold ph-lg',
					'ti ti-bookmark': 'ph-bookmark ph-bold ph-lg',
					'ti ti-heart-off': 'ph-heart-break ph-bold ph-lg',
					'ti ti-filter': 'ph-funnel ph-bold ph-lg',
					'ti ti-align-left': 'ph-text-align-left ph-bold ph-lg',
					'ti ti-clock-edit': 'ph-pencil-simple ph-bold ph-lg',
					'ti ti-circle-filled': 'ph-circle-half ph-bold ph-lg',
					'ti ti-circle': 'ph-circle ph-bold ph-lg',
					'ti ti-circle-check': 'ph-seal-check ph-bold ph-lg',
					'ti ti-switch-horizontal': 'ph-arrows-left-right ph-bold ph-lg',
					'ti ti-api': 'ph-key ph-bold ph-lg',
					'ti ti-webhook': 'ph-webhooks-logo ph-bold ph-lg',
					'ti ti-package': 'ph-package ph-bold ph-lg',
					'ti ti-plane': 'ph-airplane ph-bold ph-lg',
					'ti ti-power': 'ph-power ph-bold ph-lg',
					'ti ti-plane-arrival': 'ph-airplane-landing ph-bold ph-lg',
					'ti ti-equal-double': 'ph-equals ph-bold ph-lg',
					'ti ti-planet-off': 'ph-globe-simple ph-bold ph-lg',
					'ti ti-flask': 'ph-flask ph-bold ph-lg',
					'ti ti-map-pin': 'ph-map-pin ph-bold ph-lg',
					'ti ti-sun': 'ph-sun ph-bold ph-lg',
					'ti ti-moon': 'ph-moon ph-bold ph-lg',
					'ti ti-user-check': 'ph-check ph-bold ph-lg',
					'ti ti-user-search': 'ph-user-circle ph-bold ph-lg',
					'ti ti-activity': 'ph-pulse ph-bold ph-lg',
					'ti ti-robot': 'ph-robot ph-bold ph-lg',
					'ti ti-backspace': 'ph-backspace ph-bold ph-lg',
					'ti ti-language-hiragana': 'ph-translate ph-bold ph-lg',
					'ti ti-star-off': 'ph-star-half ph-bold ph-lg',
					'ti ti-message-off': 'ph-bell-slash ph-bold ph-lg',
					'ti ti-pinned-off': 'ph-push-pin-slash ph-bold ph-lg',
					'ti ti-user-off': 'ph-user-minus ph-bold ph-lg',
					'ti ti-columns': 'ph-text-columns ph-bold ph-lg',
					'ti ti-device-mobile': 'ph-device-mobile ph-bold ph-lg',
					'ti ti-device-tablet': 'ph-device-tablet ph-bold ph-lg',
					'ti ti-device-desktop': 'ph-desktop ph-bold ph-lg',
					'ti ti-align-box-left-top': 'ph-arrow-up-left ph-bold ph-lg',
					'ti ti-align-box-right-top': 'ph-arrow-up-right ph-bold ph-lg',
					'ti ti-align-box-left-bottom': 'ph-arrow-down-left ph-bold ph-lg',
					'ti ti-align-box-right-bottom': 'ph-arrow-down-right ph-bold ph-lg',
					'ti ti-carousel-vertical': 'ph-split-vertical ph-bold ph-lg',
					'ti ti-carousel-horizontal': 'ph-split-horizontal ph-bold ph-lg',
				},
			}),
			...process.env.NODE_ENV === 'production'
				? [
					pluginReplace({
						preventAssignment: true,
						values: {
							'isChromatic()': JSON.stringify(false),
						},
					}),
				]
				: [],
		],

		resolve: {
			extensions,
			alias: {
				'@/': __dirname + '/src/',
				'/client-assets/': __dirname + '/assets/',
				'/static-assets/': __dirname + '/../backend/assets/',
				'/fluent-emojis/': __dirname + '/../../fluent-emojis/dist/',
				'/tossface/': __dirname + '/../../tossface-emojis/dist/',
				'/fluent-emoji/': __dirname + '/../../fluent-emojis/dist/',
			},
		},

		css: {
			modules: {
				generateScopedName(name, filename, _css): string {
					const id = (path.relative(__dirname, filename.split('?')[0]) + '-' + name).replace(/[\\\/\.\?&=]/g, '-').replace(/(src-|vue-)/g, '');
					const shortId = id.replace(/^(components(-global)?|widgets|ui(-_common_)?)-/, '');
					return shortId + '-' + toBase62(hash(id)).substring(0, 4);
				},
			},
		},

		define: {
			_VERSION_: JSON.stringify(meta.version),
			_LANGS_: JSON.stringify(Object.entries(locales).map(([k, v]) => [k, v._lang_])),
			_ENV_: JSON.stringify(process.env.NODE_ENV),
			_DEV_: process.env.NODE_ENV !== 'production',
			_PERF_PREFIX_: JSON.stringify('Misskey:'),
			_DATA_TRANSFER_DRIVE_FILE_: JSON.stringify('mk_drive_file'),
			_DATA_TRANSFER_DRIVE_FOLDER_: JSON.stringify('mk_drive_folder'),
			_DATA_TRANSFER_DECK_COLUMN_: JSON.stringify('mk_deck_column'),
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: false,
		},

		build: {
			target: [
				'chrome116',
				'firefox116',
				'safari16',
			],
			manifest: 'manifest.json',
			rollupOptions: {
				input: {
					app: './src/_boot_.ts',
				},
				external: externalPackages.map(p => p.match),
				output: {
					manualChunks: {
						vue: ['vue'],
						photoswipe: ['photoswipe', 'photoswipe/lightbox', 'photoswipe/style.css'],
					},
					chunkFileNames: process.env.NODE_ENV === 'production' ? '[hash:8].js' : '[name]-[hash:8].js',
					assetFileNames: process.env.NODE_ENV === 'production' ? '[hash:8][extname]' : '[name]-[hash:8][extname]',
					paths(id) {
						for (const p of externalPackages) {
							if (p.match.test(id)) {
								return p.path(id, p.match);
							}
						}

						return id;
					},
				},
			},
			cssCodeSplit: true,
			outDir: __dirname + '/../../built/_vite_',
			assetsDir: '.',
			emptyOutDir: false,
			sourcemap: process.env.NODE_ENV === 'development',
			reportCompressedSize: false,

			// https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
			commonjsOptions: {
				include: [/misskey-js/, /misskey-reversi/, /misskey-bubble-game/, /node_modules/],
			},
		},

		worker: {
			format: 'es',
		},

		test: {
			environment: 'happy-dom',
			deps: {
				optimizer: {
					web: {
						include: [
							// XXX: misskey-dev/browser-image-resizer has no "type": "module"
							'browser-image-resizer',
						],
					},
				},
			},
			includeSource: ['src/**/*.ts'],
		},
	};
}

const config = defineConfig(({ command, mode }) => getConfig());

export default config;
