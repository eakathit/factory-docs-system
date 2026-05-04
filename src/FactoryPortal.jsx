import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  ExternalLink
} from 'lucide-react'

const FactoryPortal = () => {
  
  // รายการเว็บแอปพลิเคชัน (แก้ไขลิงก์และชื่อตรงนี้ได้เลย)
  const apps = [
    {
      id: 1,
      title: "ระบบลงเวลาทำงาน (Time Tracking)", // โปรเจกต์ Firebase 1
      description: "ระบบบันทึกเวลาเข้า-ออกงาน",
      url: "https://timetracker-f1e11.web.app/?openExternalBrowser=1", // 🔴 ใส่ Link จริงตรงนี้
      iconSrc: "/portal-icons/time-tracker.png",
      iconAlt: "Time Tracking app icon",
      color: "bg-orange-300",
      gradient: "from-orange-400 to-red-400"
    },
    {
      id: 2,
      title: "ระบบสต๊อกสินค้า (StockCheck)", // โปรเจกต์ Firebase 2
      description: "ระะบบเช็คสต๊อกสินค้าในโรงงาน",
      url: "https://stockapppwa.web.app/", // 🔴 ใส่ Link จริงตรงนี้
      iconSrc: "/portal-icons/stock-check.png",
      iconAlt: "StockCheck app icon",
      color: "bg-blue-600",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      id: 3,
      title: "ระบบจองรถบริษัท (Car Booking)",
      description: "ระบบจองและจัดการการใช้งานรถบริษัท",
      url: "https://haru-carbooking.web.app/?openExternalBrowser=1",
      iconSrc: "/portal-icons/car-booking.svg",
      iconAlt: "Car Booking app icon",
      color: "bg-sky-500",
      gradient: "from-sky-500 to-blue-600"
    },

  ]

  return (
    <div className="min-h-screen bg-slate-50/50">
      
      {/* Container */}
      <div className="w-full max-w-[96%] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        
        {/* Header: ปุ่มย้อนกลับ + หัวข้อ */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/" 
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Factory Portal</h1>
            <p className="text-slate-500">รวมเว็บแอปพลิเคชันและระบบงานภายใน</p>
          </div>
        </div>

        {/* Grid แสดงรายการ App */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((app) => (
            <a 
              key={app.id}
              href={app.url}
              target="_blank" // เปิดแท็บใหม่
              rel="noopener noreferrer" // เพื่อความปลอดภัย
              className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col min-h-[200px]"
            >
              {/* Icon & Title */}
              <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-lg shadow-slate-200/80 overflow-hidden">
                    <img
                      src={app.iconSrc}
                      alt={app.iconAlt}
                      className="h-14 w-14 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ExternalLink size={20} />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                  {app.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {app.description}
                </p>
              </div>

              {/* Footer ของการ์ด */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-sm font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
                <span>เปิดใช้งานระบบ</span>
              </div>
            </a>
          ))}
          
          {/* Card เปล่าสำหรับโปรเจกต์ในอนาคต */}
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center min-h-[200px] text-slate-400">
             <div className="w-12 h-12 rounded-full bg-slate-100 mb-3 flex items-center justify-center">
               <span className="text-2xl">+</span>
             </div>
             <p>ระบบอื่นๆ เร็วๆ นี้</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default FactoryPortal
