// src/CompletionReportForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ChevronLeft, Printer, Loader2, FileCheck } from 'lucide-react'
import { supabase } from './supabaseClient'

const CompletionReportForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Helper: ดึงเวลาปัจจุบัน HH:mm
  const getCurrentTime = () => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  }

  // เตรียมข้อมูลเริ่มต้น (รองรับทั้ง Create และ Edit)
  const initialData = {
    id: null, // เพิ่ม id เข้ามาเพื่อเช็คสถานะ
    date: new Date().toISOString().split('T')[0],
    projectName: '',
    projectNo: '',
    location: '',
    finishTime: getCurrentTime(),
    isComplete: true,
    remark: ''
  }

  const [formData, setFormData] = useState(initialData)

  // ดึงข้อมูลจาก State (กรณีแก้ไข หรือ ย้อนกลับมาจากหน้า Print)
  useEffect(() => {
    if (location.state) {
      setFormData(prev => ({ ...prev, ...location.state }))
    }
  }, [location.state])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const dbData = {
        date: formData.date,
        project_name: formData.projectName,
        project_no: formData.projectNo,
        location: formData.location,
        finish_time: formData.finishTime,
        is_complete: formData.isComplete,
        remark: formData.remark
      }

      let resultData = null;

      // --- LOGIC สำคัญ: เช็คว่ามี ID หรือไม่ ---
      if (formData.id) {
        // 1. กรณีมี ID = อัปเดตของเดิม (Update)
        const { data, error } = await supabase
          .from('doc_completion_reports') 
          .update(dbData)
          .eq('id', formData.id) // อ้างอิง ID เดิม
          .select()
          
        if (error) throw error
        resultData = data[0]

      } else {
        // 2. กรณีไม่มี ID = สร้างใหม่ (Insert)
        const { data, error } = await supabase
          .from('doc_completion_reports') 
          .insert([dbData])
          .select() // select() เพื่อขอ ID ที่เพิ่งสร้างกลับมา

        if (error) throw error
        resultData = data[0]
      }

      // ส่งข้อมูลไปหน้า Print (รวมถึง ID ที่ได้มาด้วย เพื่อให้กดย้อนกลับมาแก้ถูกใบ)
      navigate('/completion-report-print', { 
        state: { 
          ...formData, 
          id: resultData.id, // สำคัญ: อัปเดต ID กลับเข้าไปใน State
          created_at: resultData.created_at // เผื่อใช้แสดงเลขที่เอกสาร
        } 
      })

    } catch (error) {
      console.error('Error saving report:', error)
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ... (ส่วน Render Form เหมือนเดิมเป๊ะ ไม่ต้องแก้) ...
  // Component ย่อยสำหรับ Label (แบบเรียบง่าย)
  const FormLabel = ({ label, subLabel, required }) => (
    <label className="block mb-1.5">
      <span className="text-slate-800 font-medium text-base mr-2">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <span className="text-slate-400 text-xs font-normal font-mono">
        {subLabel}
      </span>
    </label>
  )

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="w-full max-w-3xl mx-auto px-6 py-10">
        
        {/* --- Header --- */}
        <div className="flex items-center gap-5 mb-8">
          <Link 
            to="/" 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-orange-500 hover:shadow-md hover:border-orange-200 transition-all duration-300 group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <FileCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Completion Report
              </h1>
              <p className="text-slate-500 text-sm">แบบฟอร์มรายงานเสร็จสิ้นโครงการ</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* วันที่ */}
            <div>
              <FormLabel label="วันที่" subLabel="Date / 記入日" required />
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" required />
            </div>

            {/* เวลา */}
            <div>
              <FormLabel label="เวลาที่เสร็จ" subLabel="Finish Time / 終わた時間" />
              <input type="time" name="finishTime" value={formData.finishTime} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>

            {/* ชื่อโครงการ */}
            <div className="md:col-span-2">
              <FormLabel label="ชื่อโครงการ" subLabel="Project Name / 工事名" required />
              <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-300" placeholder="ระบุชื่อโครงการ" required />
            </div>

            {/* รหัสโครงการ */}
            <div>
              <FormLabel label="รหัสโครงการ" subLabel="Project No. / 工事番号" />
              <input type="text" name="projectNo" value={formData.projectNo} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-300" placeholder="ระบุรหัส (ถ้ามี)" />
            </div>

            {/* สถานที่ */}
            <div>
              <FormLabel label="สถานที่" subLabel="Place / 工事場所" />
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-300" placeholder="ระบุสถานที่" />
            </div>

            {/* สถานะความสำเร็จ */}
            <div className="md:col-span-2 pt-2">
              <FormLabel label="สถานะงาน" subLabel="Status / 状態" />
              <div className="flex w-full bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button type="button" onClick={() => setFormData(prev => ({...prev, isComplete: true}))} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${formData.isComplete ? 'bg-white text-green-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>Complete (เสร็จสมบูรณ์)</button>
                <button type="button" onClick={() => setFormData(prev => ({...prev, isComplete: false}))} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${!formData.isComplete ? 'bg-white text-red-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>Not Complete (ยังไม่เสร็จ)</button>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="md:col-span-2">
              <FormLabel label="หมายเหตุ" subLabel="Remark / 備考" />
              <textarea name="remark" value={formData.remark} onChange={handleChange} rows="3" className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-300 resize-none" placeholder="ระบุรายละเอียดเพิ่มเติม..."></textarea>
            </div>
          </div>

          {/* ปุ่ม Action */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/')} className="px-5 py-2.5 text-sm text-slate-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-lg font-medium shadow-sm hover:bg-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> บันทึก...</> : <><Printer size={18} /> บันทึกและพิมพ์</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompletionReportForm