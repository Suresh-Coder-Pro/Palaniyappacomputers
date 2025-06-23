// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust the paths based on your project structure
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00ADB5',    // Accent (e.g., buttons, icons)
        light: '#fff',      // Container / form background
        dark: '#222831',       // Base text or borders
        secondary: '#393E46',  // Card background or secondary elements
      },
    },
  },
  plugins: [],
};

