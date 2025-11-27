/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'cyber-black': '#050505',
				'cyber-dark': '#0a0a12',
				'cyber-gray': '#1a1a24',
				'neon-blue': '#00f3ff',
				'neon-purple': '#bc13fe',

				/* Theme tokens mapped to CSS variables (Teal/Cyan) */
				primary: 'var(--color-primary)',
				accent: 'var(--color-accent)',
				bg: 'var(--bg)',
				surface: 'var(--bg-surface)',
				card: 'var(--card)',
				text: 'var(--text)',
				muted: 'var(--muted)',
			},
			boxShadow: {
				'neon': 'var(--shadow-neon)',
				'neon-purple': '0 0 10px rgba(188, 19, 254, 0.5), 0 0 20px rgba(188, 19, 254, 0.3)',
			}
		},
	},
	plugins: [],
}