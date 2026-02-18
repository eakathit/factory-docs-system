// src/OperationReportForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ChevronLeft, Printer, ClipboardList, Loader2, Save } from 'lucide-react'
import { supabase } from './supabaseClient'

const OperationReportForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // เตรียมข้อมูลเริ่มต้น (Initial State)
  const initialData = location.state || {
    jobNo: '',
    issuedDate: new Date().toISOString().split('T')[0],
    
    // Checkboxes (Service Type)
    isWarranty: false,
    isUrgent: false, // PDF says "UPGENT"
    isAfterService: false,
    isOther: false,
    otherDetail: '',

    // Expense
    expense: 'NO HAVE', // 'HAVE' or 'NO HAVE'

    // Information
    customerName: '',
    contactName: '',
    startTime: '',
    finishTime: '',
    operationPerson: '',

    // Problem Info
    problem: '',
    receivedInfoDate: '',
    receivedInfoTime: '',

    // Details
    reason: '',
    solution: '', // Detail of Operation or Solution
    comment: '',
    placeProject: ''
  }


  
  const [formData, setFormData] = useState(initialData)

  // useEffect สำหรับรับค่ากรณีแก้ไข (ถ้ามี)
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
      // แปลงชื่อฟิลด์ให้ตรงกับ Database (สมมติว่าคุณมีตาราง doc_operation_reports)
      const dbData = {
        job_no: formData.jobNo,
        issued_date: formData.issuedDate,
        service_type: {
          warranty: formData.isWarranty,
          urgent: formData.isUrgent,
          after_service: formData.isAfterService,
          other: formData.isOther,
          other_detail: formData.otherDetail
        },
        expense: formData.expense,
        customer_name: formData.customerName,
        contact_name: formData.contactName,
        start_time: formData.startTime,
        finish_time: formData.finishTime,
        operation_person: formData.operationPerson,
        problem: formData.problem,
        received_info_date: formData.receivedInfoDate,
        received_info_time: formData.receivedInfoTime,
        reason: formData.reason,
        solution: formData.solution,
        comment: formData.comment,
        place_project: formData.placeProject
      }

      const { error } = await supabase
        .from('doc_operation_reports') // *** อย่าลืมสร้างตารางนี้ใน Supabase ***
        .insert([dbData])
        .select()

      if (error) throw error

      // บันทึกเสร็จแล้วไปหน้า Print (คุณอาจต้องสร้างหน้า Print เพิ่มเติม)
      // navigate('/operation-report-print', { state: formData }) 
      alert('บันทึกข้อมูลเรียบร้อย (Saved Successfully)')
      navigate('/') // ชั่วคราว: กลับหน้าหลัก

    } catch (error) {
      console.error('Error saving report:', error)
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-full bg-white border shadow-sm hover:bg-slate-50">
            <ChevronLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-violet-500" />
              Operation Report
            </h1>
            <p className="text-slate-500">รายงานการปฏิบัติงาน</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Header Info */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">JOB NO.</label>
                <input 
                  type="text" 
                  name="jobNo"
                  value={formData.jobNo}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                  placeholder="Enter Job No."
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">ISSUED DATE</label>
                <input 
                  type="date" 
                  name="issuedDate"
                  value={formData.issuedDate}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Service Type & Expense */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">SERVICE TYPE & EXPENSE</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isWarranty" checked={formData.isWarranty} onChange={handleChange} className="w-5 h-5 accent-violet-600 rounded" />
                    <span className="text-slate-700">WARRANTY</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isUrgent" checked={formData.isUrgent} onChange={handleChange} className="w-5 h-5 accent-violet-600 rounded" />
                    <span className="text-slate-700">URGENT SERVICE</span> {/* Corrected spelling from PDF 'UPGENT' */}
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isAfterService" checked={formData.isAfterService} onChange={handleChange} className="w-5 h-5 accent-violet-600 rounded" />
                    <span className="text-slate-700">AFTER SERVICE</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="isOther" checked={formData.isOther} onChange={handleChange} className="w-5 h-5 accent-violet-600 rounded" />
                      <span className="text-slate-700">OTHER</span>
                    </label>
                    <input 
                      type="text" 
                      name="otherDetail"
                      disabled={!formData.isOther}
                      value={formData.otherDetail}
                      onChange={handleChange}
                      placeholder="Specify other..."
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Expense (Radio) */}
                <div className="bg-slate-50 p-4 rounded-xl">
                  <label className="text-sm font-bold text-slate-700 block mb-3">EXPENSE</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="expense" 
                        value="HAVE" 
                        checked={formData.expense === 'HAVE'} 
                        onChange={handleChange}
                        className="w-5 h-5 accent-violet-600" 
                      />
                      <span className="text-slate-700">HAVE</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="expense" 
                        value="NO HAVE" 
                        checked={formData.expense === 'NO HAVE'} 
                        onChange={handleChange}
                        className="w-5 h-5 accent-violet-600" 
                      />
                      <span className="text-slate-700">NO HAVE</span>
                    </label>
                  </div>
                </div>
             </div>
          </div>

          {/* Section 3: Information */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">INFORMATION</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">CUSTOMER NAME</label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">CONTACT NAME</label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">START TIME</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">FINISH TIME</label>
                  <input type="time" name="finishTime" value={formData.finishTime} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">OPERATION PERSON</label>
                <input type="text" name="operationPerson" value={formData.operationPerson} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Section 4: Details & Problem */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">DETAILS</h3>

            <div className="space-y-6">
              {/* Problem */}
              <div className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100">
                <div className="mb-4">
                  <label className="text-sm font-bold text-slate-800 block mb-2">PROBLEM</label>
                  <textarea name="problem" value={formData.problem} onChange={handleChange} rows="3" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" placeholder="Describe the problem..."></textarea>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200 w-fit">
                  <span className="font-semibold">Received Info. From:</span>
                  <div className="flex items-center gap-2">
                    <span>Date:</span>
                    <input type="date" name="receivedInfoDate" value={formData.receivedInfoDate} onChange={handleChange} className="p-1 border rounded bg-slate-50" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Time:</span>
                    <input type="time" name="receivedInfoTime" value={formData.receivedInfoTime} onChange={handleChange} className="p-1 border rounded bg-slate-50" />
                  </div>
                </div>
              </div>

              {/* Other Textareas */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">REASON</label>
                  <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"></textarea>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">DETAIL OF OPERATION OR SOLUTION</label>
                  <textarea name="solution" value={formData.solution} onChange={handleChange} rows="4" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"></textarea>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">COMMENT</label>
                  <textarea name="comment" value={formData.comment} onChange={handleChange} rows="2" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"></textarea>
                </div>
              </div>

              {/* Footer Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                 <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">PLACE / PROJECT</label>
                    <input type="text" name="placeProject" value={formData.placeProject} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" />
                 </div>
                 {/* Acknowledge By / Issued By มักจะเป็นการเซ็นชื่อ หรือ Auto from login, ในฟอร์มนี้อาจจะยังไม่ต้องกรอก หรือเพิ่มถ้าต้องการ */}
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 size={20} className="animate-spin" /> Saving...</>
              ) : (
                <><Save size={20} /> Save Report</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default OperationReportForm