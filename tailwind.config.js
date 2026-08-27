/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          darkGreen: '#064e3b', // Deep Forest / Construction Emerald
          green: '#059669',     // Vivid Lunayve Emerald
          lightGreen: '#10b981', // Accent Green
          softGreen: '#ecfdf5',  // Mint tint
          darkBlue: '#0f172a',  // Deep Steel Slate / Midnight
          navy: '#1e293b',      // Navy card / container
          blue: '#0284c7',      // Lunayve Cyan/Blue
          lightBlue: '#38bdf8', // Blue accent
          softBlue: '#f0f9ff',  // Blue tint
          gray: '#64748b',      // Metallic Silver / Slate text
          lightGray: '#f8fafc', // Background canvas
          border: '#e2e8f0',    // Clean border
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'premium': '0 20px 25px -5px rgba(6, 78, 59, 0.08), 0 10px 10px -5px rgba(2, 132, 199, 0.04)',
      },
    },
  },
  plugins: [],
}
