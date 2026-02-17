// src/CompletionReportForm.jsx
import React, { useState, useEffect } from 'react' // เพิ่ม useEffect
import { useNavigate, useLocation, Link } from 'react-router-dom' // เพิ่ม useLocation
import { ChevronLeft, Printer, FileCheck, Loader2 } from 'lucide-react'
import { supabase } from './supabaseClient'

const CompletionReportForm = () => {
  const navigate = useNavigate()
  const location = useLocation() // เรียกใช้ useLocation
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ตรวจสอบว่ามีข้อมูลส่งกลับมาแก้ไขหรือไม่ ถ้าไม่มีให้ใช้ค่าเริ่มต้น
  const initialData = location.state || {
    date: new Date().toISOString().split('T')[0],
    projectName: '',
    projectNo: '',
    location: '',
    finishTime: '',
    isComplete: true,
    remark: ''
  }

  const [formData, setFormData] = useState(initialData)

  // ใช้ useEffect เพื่ออัปเดตฟอร์มถ้า location.state เปลี่ยนแปลง (กันเหนียว)
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

      const { error } = await supabase
        .from('doc_completion_reports') 
        .insert([dbData])
        .select()

      if (error) throw error

      navigate('/completion-report-print', { state: formData })

    } catch (error) {
      console.error('Error saving report:', error)
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-full bg-white border shadow-sm hover:bg-slate-50">
            <ChevronLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="text-orange-500" />
              Completion Report
            </h1>
            <p className="text-slate-500">รายงานเสร็จสิ้นโครงการ</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* วันที่ */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">วันที่ / Date / 記入日</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                required
              />
            </div>

            {/* เวลา */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">เวลา / Time / 終わた時間</label>
              <input 
                type="time" 
                name="finishTime"
                value={formData.finishTime}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* ชื่อโครงการ */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">ชื่อโครงการ / Project Name / 工事名</label>
              <input 
                type="text" 
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="ระบุชื่อโครงการ..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                required
              />
            </div>

            {/* รหัสโครงการ */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">รหัส / Project No. / 工事番号</label>
              <input 
                type="text" 
                name="projectNo"
                value={formData.projectNo}
                onChange={handleChange}
                placeholder="ระบุรหัสโครงการ..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* สถานที่ */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">สถานที่ / Place / 工事場所</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="ระบุสถานที่..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* หมายเหตุ */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">หมายเหตุ / Remark / 備考</label>
              <textarea 
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              ></textarea>
            </div>

            {/* สถานะความสำเร็จ */}
            <div className="md:col-span-2 border-t border-slate-100 pt-6">
              <label className="text-sm font-medium text-slate-700 mb-3 block">ผลการดำเนินงาน</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.isComplete ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
                    {formData.isComplete && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                  <input 
                    type="radio" 
                    name="status" 
                    checked={formData.isComplete} 
                    onChange={() => setFormData(prev => ({...prev, isComplete: true}))}
                    className="hidden" 
                  />
                  <span className={`font-medium ${formData.isComplete ? 'text-green-600' : 'text-slate-500'}`}>Complete</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${!formData.isComplete ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                    {!formData.isComplete && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                  <input 
                    type="radio" 
                    name="status" 
                    checked={!formData.isComplete} 
                    onChange={() => setFormData(prev => ({...prev, isComplete: false}))}
                    className="hidden" 
                  />
                  <span className={`font-medium ${!formData.isComplete ? 'text-red-600' : 'text-slate-500'}`}>Not Complete</span>
                </label>
              </div>
            </div>

          </div>

          {/* ปุ่ม Action */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> กำลังบันทึก...
                  </>
              ) : (
                  <>
                    <Printer size={20} /> บันทึกและสร้างใบรายงาน
                  </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CompletionReportForm