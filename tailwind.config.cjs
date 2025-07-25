// tailwind.config.cjs
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': '#00bcd4',
        'background-color': '#181a20',
        'panel-bg': '#22252a',
        'card-background': '#23272f',
        'text-color': '#e0e6ed',
        'border-color': '#2c313a',
        'hover-background': '#283040',
        'hover-border': '#00bcd4',
        'selected-border': '#00bcd4',
        'selected-shadow': '#00bcd488',
        'card-title-color': '#fff',
        'input-bg': '#23272f',
        'input-border': '#2c313a',
        'input-text': '#e0e6ed',
        'disabled-bg': '#23272f',
        'disabled-text': '#6c7a89',
        'success-color': '#26c6da',
        'warning-color': '#ffa726',
        'danger-color': '#ef5350',
        'light-text-color': '#b0b8c1',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.3)',
        'selected': '0 2px 8px #00bcd488',
      }
    },
  },
  plugins: [],
}