/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // เพิ่มส่วนนี้เข้าไปครับ
      fontFamily: {
        sans: ['Prompt', 'sans-serif'], // กำหนดให้ font-sans คือ Prompt
        sarabun: ['Sarabun', 'sans-serif'], // กำหนดให้ font-sarabun คือ Sarabun
      }
    },
  },
  plugins: [],
}