/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "hsl(var(--primary) / <alpha-value>)",
                "primary-light": "hsl(var(--primary-light) / <alpha-value>)",
                "bg-main": "hsl(var(--bg-main) / <alpha-value>)",
                "bg-secondary": "hsl(var(--bg-secondary) / <alpha-value>)",
                "border-color": "hsl(var(--border-color) / <alpha-value>)",
            },
        },
    },
    plugins: [],
}
