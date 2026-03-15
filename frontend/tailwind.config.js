/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "rgb(15 23 42)", 
        surface: "rgb(2 6 23)",
        accent: "rgb(56 189 248)"
      }
    }
  },
  plugins: []
};

