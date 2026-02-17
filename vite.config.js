import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1000, // เพิ่มลิมิตเล็กน้อย
    rollupOptions: {
      output: {
        manualChunks(id) {
          // แยก Library ของ Node Modules ออกเป็นไฟล์แยก
          if (id.includes('node_modules')) {
            // แยก React และ Router ออกมาเป็นไฟล์ react-vendor
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            // แยก Supabase ออกมา (ถ้ามี)
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // แยก Lucide Icon ออกมา (ถ้ามี)
            if (id.includes('lucide-react')) {
              return 'lucide-vendor';
            }
            // Library อื่นๆ ให้รวมเป็น vendor
            return 'vendor';
          }
        },
      },
    },
  },
})