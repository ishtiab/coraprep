module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E63B5',
        'light-blue': '#E6F0FA',
        'gradient-blue-start': '#1E63B5',
        'gradient-blue-end': '#6FAFE7',
        neutral: '#ffffff',
        'text-gray': '#475569',
        bg: '#ffffff'
      },
      borderRadius: {
        card: '20px',
        btn: '16px',
        '2xl': '1rem'
      }
    },
  },
  plugins: [],
}