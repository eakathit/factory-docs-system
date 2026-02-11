import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  ExternalLink, 
  Clock, 
  Wrench, 
  ShieldCheck, 
  Database 
} from 'lucide-react'

const FactoryPortal = () => {
    
    // รายการ Web app
    const apps = [
        {
            id: 1,
            title: "ระบบลงเวลาทำงาน (Time Tracker)",
            description: "ระบบบันทึกเวลาเข้า-ออกงาน",
            url: "https://timetracker-f1e11.web.app/",
            icon: Clock,
            color: "bg-orange-500",
            gradient: "from-orange-500 to-red-500"
        },
        {
            id: 2,
            title: "ระบบสต๊อกสินค้า (StockCheck)",
            description: "เช็คสต๊อกสินค้าในโรงงาน",
            url: "https://stockapppwa.web.app/",
            icon: Wrench,
            color: "bg-blue-600",
            gradient: "from-blue-600 to-indigo-600"
        }

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
              {/* Decorative Background */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${app.gradient} opacity-5 rounded-bl-[100px] -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`} />

              {/* Icon & Title */}
              <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${app.gradient} flex items-center justify-center text-white shadow-lg shadow-gray-200`}>
                    <app.icon size={28} />
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