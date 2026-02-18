// src/OperationReportForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronLeft,
  Printer,
  ClipboardList,
  Loader2,
  Save,
  Home,
  ChevronRight,
  Info,
  Clock,
  MapPin,
} from "lucide-react";
import { supabase } from "./supabaseClient";

const OperationReportForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // เตรียมข้อมูลเริ่มต้น
  const initialData = {
    jobNo: "",
    issuedDate: new Date().toISOString().split("T")[0],
    isWarranty: false,
    isUrgent: false,
    isAfterService: false,
    isOther: false,
    otherDetail: "",
    expense: "NO HAVE",
    customerName: "",
    contactName: "",
    startTime: "",
    finishTime: "",
    operationPerson: "",
    problem: "",
    receivedInfoDate: "",
    receivedInfoTime: "",
    reason: "",
    solution: "",
    comment: "",
    place: '',
    project: '',
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({ ...prev, ...location.state }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    // เตรียมข้อมูลให้ตรงกับคอลัมน์ในตาราง doc_operation_reports
    const dbData = {
      job_no: formData.jobNo,
      issued_date: formData.issuedDate,
      
      // Mapping Service Type ตาม UI ใหม่ (เป็น Boolean ทั้งหมด)
      service_type: {
        warranty: formData.isWarranty,
        urgent: formData.isUrgent,
        after_service: formData.isAfterService,
        other: formData.isOther
      },
      
      expense: formData.expense,
      customer_name: formData.customerName,
      contact_name: formData.contactName,
      
      // ข้อมูลสถานที่และโครงการที่แยกจากกัน
      place: formData.place, 
      project: formData.project,
      
      start_time: formData.startTime,
      finish_time: formData.finishTime,
      operation_person: formData.operationPerson,
      
      problem: formData.problem,
      received_info_date: formData.receivedInfoDate,
      received_info_time: formData.receivedInfoTime,
      
      reason: formData.reason,
      solution: formData.solution,
      comment: formData.comment
    }

    const { data, error } = await supabase
      .from('doc_operation_reports')
      .insert([dbData])
      .select()

    if (error) throw error

    alert('บันทึกข้อมูลเรียบร้อยแล้ว')
    
    // ส่งต่อไปหน้า Print พร้อมข้อมูลที่บันทึกสำเร็จ
    navigate('/operation-report-print', { 
      state: { ...formData, id: data[0].id } 
    })

  } catch (error) {
    console.error('Error saving report:', error)
    alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message)
  } finally {
    setIsSubmitting(false)
  }
};

  // Component ย่อยสำหรับ Label
  const FormLabel = ({ label, subLabel, required }) => (
    <label className="block mb-1.5">
      <span className="text-slate-800 font-bold text-sm mr-2 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {subLabel && (
        <span className="text-slate-400 text-xs font-normal">{subLabel}</span>
      )}
    </label>
  );

  // ส่วนของ Modal Preview (วางไว้ก่อนหน้าคำสั่ง return หลักของหน้าฟอร์ม)
const PreviewModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 fade-in">
      <div className="bg-white w-full h-full sm:max-w-4xl sm:h-[90vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header ของ Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Preview เอกสาร</h3>
            <p className="text-xs text-slate-500">ตรวจสอบข้อมูลก่อนสั่งพิมพ์</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* พื้นที่แสดงตัวอย่างเอกสาร (จำลองหน้า A4) */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
          <div className="bg-white mx-auto shadow-sm w-full max-w-[210mm] min-h-[297mm] p-[10mm] sm:p-[15mm] text-black font-sans origin-top transform scale-[0.95] sm:scale-100">
             {/* --- ส่วนนี้คือการจำลอง Layout เหมือนหน้า Print --- */}
             <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tighter">Operation Report</h2>
                <div className="text-right text-[10px] font-bold text-slate-400">PREVIEW ONLY</div>
             </div>

             <div className="grid grid-cols-2 gap-4 text-[12px] mb-6">
                <div>
                   <p className="text-slate-400 uppercase font-bold text-[10px]">Customer Name</p>
                   <p className="font-semibold border-b border-slate-100 pb-1">{data.customerName || '-'}</p>
                </div>
                <div>
                   <p className="text-slate-400 uppercase font-bold text-[10px]">Job No.</p>
                   <p className="font-semibold border-b border-slate-100 pb-1">{data.jobNo || '-'}</p>
                </div>
                <div className="col-span-2">
                   <p className="text-slate-400 uppercase font-bold text-[10px]">Project / Place</p>
                   <p className="font-semibold border-b border-slate-100 pb-1">{data.project} / {data.place}</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                   <p className="text-[10px] font-black text-violet-600 mb-2 uppercase">Problem & Details</p>
                   <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{data.problem || 'ไม่มีข้อมูลรายละเอียดปัญหา'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-violet-500">
                   <p className="text-[10px] font-black text-violet-600 mb-2 uppercase">Solution / Operation</p>
                   <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{data.solution || '-'}</p>
                </div>
             </div>

             <div className="mt-12 pt-8 border-t border-dashed border-slate-200 grid grid-cols-2 gap-20 text-center">
                <div className="border-b border-slate-300 pb-2 text-[11px] text-slate-400 italic">Acknowledge By</div>
                <div className="border-b border-slate-300 pb-2 text-[11px] text-slate-400 italic">Issued By</div>
             </div>
          </div>
        </div>

        {/* Footer ของ Modal (ปุ่มปิด) */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-black transition-all">
              ตกลง ตรวจสอบแล้ว
           </button>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* --- Sticky Navbar --- */}
      <nav className="relative sm:sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="h-5 sm:h-6 w-[1px] bg-slate-200 mx-1" />

            <div className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-sm font-medium">
              <Link
                to="/"
                className="text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Home size={14} /> หน้าแรก
              </Link>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 font-bold">Operation Report</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center gap-5 mb-10 fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20 rotate-3">
            <ClipboardList size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
              Operation Report
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Operation Record / รายงานการปฏิบัติงาน
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel label="Job No." required />
                <input
                  type="text"
                  name="jobNo"
                  value={formData.jobNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-mono"
                  placeholder=""
                  required
                />
              </div>
              <div>
                <FormLabel label="Issued Date" required />
                <input
                  type="date"
                  name="issuedDate"
                  value={formData.issuedDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Service Type & Expense */}
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <div className="flex items-center gap-2 mb-6  border-b border-slate-100 pb-4">
              <Info size={20} />
              <h3 className="font-bold uppercase tracking-wider text-sm sm:text-base">
                Service Type & Expense
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Service Type Checkboxes - ปรับ Other ให้เป็นติ๊กเหมือนช่องอื่น */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "isWarranty", label: "Warranty" },
                  { id: "isUrgent", label: "Urgent Service" },
                  { id: "isAfterService", label: "After Service" },
                  { id: "isOther", label: "Other" },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group ${
                      formData[item.id]
                        ? "bg-violet-50 border-violet-300 shadow-sm ring-1 ring-violet-300"
                        : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-violet-200"
                    }`}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        name={item.id}
                        checked={formData[item.id]}
                        onChange={handleChange}
                        className="w-5 h-5 accent-violet-600 rounded border-slate-300 cursor-pointer"
                      />
                    </div>
                    <span
                      className={`text-sm font-bold uppercase tracking-tight transition-colors ${
                        formData[item.id]
                          ? "text-violet-700"
                          : "text-slate-500 group-hover:text-slate-700"
                      }`}
                    >
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Expense Selection - ปรับให้เลือกง่ายแบบ Segmented Control */}
              <div className="flex flex-col justify-center">
                <FormLabel label="Expense" subLabel="(Select one option)" />
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5 mt-1">
                  {["HAVE", "NO HAVE"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, expense: val }))
                      }
                      className={`flex-1 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                        formData.expense === val
                          ? "bg-white text-violet-600 shadow-md ring-1 ring-black/5"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {val === "HAVE" ? "HAVE" : "NO HAVE"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Information */}
<div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 fade-in-up" style={{animationDelay: '200ms'}}>
  <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
      <MapPin size={20} />
      <h3 className="font-bold uppercase tracking-wider text-sm sm:text-base">Information</h3>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <FormLabel label="Customer Name" />
      <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none" placeholder="ชื่อบริษัทลูกค้า" />
    </div>
    <div>
      <FormLabel label="Contact Name" />
      <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none" placeholder="ชื่อผู้ติดต่อ" />
    </div>

    {/* แยกเป็น 2 ช่องตามคำขอ */}
    <div>
      <FormLabel label="Place"/>
      <input type="text" name="place" value={formData.place} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none" placeholder="ระบุสถานที่ปฏิบัติงาน" />
    </div>
    <div>
      <FormLabel label="Project"/>
      <input type="text" name="project" value={formData.project} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none" placeholder="ระบุชื่อโครงการ" />
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <FormLabel label="Start Time" />
        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none" />
      </div>
      <div>
        <FormLabel label="Finish Time" />
        <input type="time" name="finishTime" value={formData.finishTime} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none" />
      </div>
    </div>
    <div>
      <FormLabel label="Operation Person" />
      <input type="text" name="operationPerson" value={formData.operationPerson} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none" placeholder="ชื่อผู้ปฏิบัติงาน" />
    </div>
  </div>
</div>

          {/* Section 4: Details & Problem */}
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 fade-in-up"
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Clock size={20} />
              <h3 className="font-bold uppercase tracking-wider">
                Operation Details
              </h3>
            </div>

            <div className="space-y-6">
              <div className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100">
                <div className="mb-6">
                  <FormLabel label="Problem"/>
                  <textarea
                    name="problem"
                    value={formData.problem}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none resize-none shadow-inner"
                    placeholder="รายละเอียดปัญหา..."
                  ></textarea>
                </div>

                <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-violet-100 shadow-sm">
                  <span className="text-xs font-black uppercase">
                    Received Info From:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Date
                    </span>
                    <input
                      type="date"
                      name="receivedInfoDate"
                      value={formData.receivedInfoDate}
                      onChange={handleChange}
                      className="px-2 py-1 text-sm border rounded bg-slate-50 outline-none focus:border-violet-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Time
                    </span>
                    <input
                      type="time"
                      name="receivedInfoTime"
                      value={formData.receivedInfoTime}
                      onChange={handleChange}
                      className="px-2 py-1 text-sm border rounded bg-slate-50 outline-none focus:border-violet-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <FormLabel label="Reason"/>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none resize-none transition-all focus:bg-white"
                  ></textarea>
                </div>
                <div>
                  <FormLabel
                    label="Detail of Operation or Solution"
                  />
                  <textarea
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none resize-none transition-all focus:bg-white"
                  ></textarea>
                </div>
                <div>
                  <FormLabel label="Comment"/>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none resize-none transition-all focus:bg-white"
                  ></textarea>
                </div>

                {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 mt-10 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2.5 text-sm text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:bg-black hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={22} className="animate-spin" /> SAVING...
                </>
              ) : (
                <>
                  <Save size={22} /> SAVE REPORT
                </>
              )}
            </button>
          </div>
              </div>
            </div>
          </div>

          
        </form>
      </div>
    </div>
  );
};

export default OperationReportForm;
