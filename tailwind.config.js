/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: We added "./app" here because that is where your index.tsx is
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "(tabs)/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        yogapurple: '#5B2D82',
        yogagreen: '#192D1E',
      }
    },
  },
  plugins: [],
}