// src/OperationReportForm.jsx
// UX: กรอกฟอร์ม → Preview (จำลอง A4 จริง) → ยืนยัน Save → Print
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronLeft, ClipboardList, Loader2, Save,
  Home, ChevronRight, Info, Clock, MapPin, X,
  Eye, CheckCircle2, AlertCircle,
} from "lucide-react";
import { supabase } from "./supabaseClient";

// ─────────────────────────────────────────────────────────────
// PreviewModal — จำลอง layout เหมือน OperationReportPrint.jsx
// ─────────────────────────────────────────────────────────────
const PreviewModal = ({ isOpen, onClose, onConfirm, data, isSaving }) => {
  if (!isOpen) return null;

  const formatDate = (s) => {
    if (!s) return "—";
    return new Date(s).toLocaleDateString("en-GB");
  };

  const CheckBox = ({ checked, label }) => (
    <div className="flex items-center gap-1.5">
      <div className="w-3.5 h-3.5 border border-black flex items-center justify-center text-[11px] font-bold flex-shrink-0 leading-none">
        {checked ? "✓" : ""}
      </div>
      <span className="text-[11px] text-black leading-none">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900/70 backdrop-blur-sm">
      
      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <Eye size={18} className="text-violet-400" />
          <div>
            <p className="text-sm font-black tracking-wide">ตัวอย่างเอกสาร</p>
            <p className="text-[10px] text-slate-400 mt-0.5">ตรวจสอบให้ครบก่อนกด "ยืนยันบันทึก"</p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={isSaving}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Scrollable A4 Preview ── */}
      <div className="flex-1 overflow-y-auto bg-slate-800 px-4 py-6">

        {/* Notice strip */}
        <div className="max-w-[210mm] mx-auto mb-3 flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold px-3 py-2 rounded-lg">
          <AlertCircle size={14} className="flex-shrink-0" />
          นี่คือตัวอย่างเอกสาร — ยังไม่ได้บันทึก กรุณาตรวจสอบให้ครบก่อนกดยืนยัน
        </div>

        {/* A4 Paper */}
        <div className="w-full max-w-[210mm] mx-auto bg-white shadow-2xl text-black font-sans text-[12px] p-[12mm]">

          {/* HEADER */}
          <table className="w-full border-collapse mb-0">
            <tbody>
              <tr>
                <td className="align-top">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0">
                      <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                    </div>
                    <div>
                      <h1 className="font-bold text-[13px] leading-tight">HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.</h1>
                      <p className="text-[10px] mt-0.5">47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140</p>
                    </div>
                  </div>
                </td>
                <td className="align-bottom w-[1%] pb-0">
                  <table className="border-collapse ml-auto">
                    <tbody>
                      <tr>
                        <td className="text-[12px] px-2 py-0.5 text-right whitespace-nowrap">JOB NO.</td>
                        <td className="text-[12px] border border-black px-1 py-0.5 text-center w-[90px] min-w-[90px]">{data.jobNo || "—"}</td>
                      </tr>
                      <tr>
                        <td className="text-[12px] px-2 py-0.5 text-right whitespace-nowrap">ISSUED DATE</td>
                        <td className="text-[12px] border border-black px-1 py-0.5 text-center w-[90px]">{formatDate(data.issuedDate)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* TITLE */}
          <div className="text-center py-1 mb-1">
            <h2 className="text-[15px] font-bold tracking-wider">OPERATION REPORT</h2>
          </div>

          {/* Service Type & Expense */}
          <div className="flex border border-black mb-1">
            <div className="flex-1 grid grid-cols-2 gap-y-1.5 p-2">
              <CheckBox checked={data.isWarranty} label="WARRANTY" />
              <CheckBox checked={data.isUrgent} label="URGENT SERVICE" />
              <CheckBox checked={data.isAfterService} label="AFTER SERVICE" />
              <CheckBox checked={data.isOther} label="OTHER" />
            </div>
            <div className="w-[28%] border-l border-black p-2 pl-3 flex items-start gap-2">
              <span className="text-[11px] leading-none mt-0.5">EXPENSE</span>
              <div className="flex flex-col gap-1">
                <CheckBox checked={data.expense === "HAVE"} label="HAVE" />
                <CheckBox checked={data.expense === "NO HAVE"} label="NO HAVE" />
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="border border-black mb-1">
            <div className="bg-gray-100 border-b border-black text-center py-0.5 text-[11px] font-semibold">INFORMATION</div>
            <div className="flex">
              <div className="w-1/2 border-r border-black">
                <div className="flex border-b border-black">
                  <div className="w-24 bg-gray-100 p-1 border-r border-black text-[11px] flex items-center">CUSTOMER NAME</div>
                  <div className="flex-1 p-1 text-[12px] flex items-center">{data.customerName || "—"}</div>
                </div>
                <div className="flex">
                  <div className="w-24 bg-gray-100 p-1 border-r border-black text-[11px] flex items-center">CONTACT NAME</div>
                  <div className="flex-1 p-1 text-[12px] flex items-center">{data.contactName || "—"}</div>
                </div>
              </div>
              <div className="w-1/2">
                <div className="flex border-b border-black">
                  <div className="w-16 bg-gray-100 p-1 border-r border-black text-[11px] flex items-center">PLACE</div>
                  <div className="flex-1 p-1 text-[12px] flex items-center">{data.place || "—"}</div>
                </div>
                <div className="flex">
                  <div className="w-16 bg-gray-100 p-1 border-r border-black text-[11px] flex items-center">PROJECT</div>
                  <div className="flex-1 p-1 text-[12px] flex items-center">{data.project || "—"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Time & Person */}
          <div className="flex border border-black mb-1">
            <div className="w-[40%] border-r border-black">
              <div className="flex border-b border-black">
                <div className="w-[100px] bg-gray-100 p-1 border-r border-black text-[11px] flex items-center">START TIME</div>
                <div className="flex-1 p-1 text-center text-[12px]">{data.startTime || "—"}</div>
              </div>
              <div className="flex">
                <div className="w-[100px] bg-gray-100 p-1 border-r border-black text-[11px] flex items-center">FINISH TIME</div>
                <div className="flex-1 p-1 text-center text-[12px]">{data.finishTime || "—"}</div>
              </div>
            </div>
            <div className="w-[60%] flex">
              <div className="w-[22%] bg-gray-100 p-1 border-r border-black text-[10px] text-center flex items-center justify-center leading-tight">OPERATION<br />PERSON</div>
              <div className="flex-1 grid grid-cols-2 grid-rows-2">
                <div className="border-r border-b border-black p-1 text-[12px] text-center flex items-center justify-center">{data.operationPerson || "—"}</div>
                <div className="border-b border-black" />
                <div className="border-r border-black" />
                <div />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="border border-black">
            {/* Problem */}
            <div className="border-b border-black min-h-[60px] flex flex-col">
              <div className="p-1 px-2 flex gap-2 items-center bg-gray-50 border-b border-black">
                <span className="text-[11px] font-semibold">PROBLEM</span>
                <span className="text-[10px] text-slate-500">(Received Info. From)</span>
                <span className="text-[10px]">Date: {formatDate(data.receivedInfoDate)}</span>
                <span className="text-[10px]">Time: {data.receivedInfoTime || "—"}</span>
              </div>
              <div className="p-2 text-[12px] whitespace-pre-wrap leading-relaxed min-h-[40px]">{data.problem || <span className="text-slate-300 italic">ไม่ระบุ</span>}</div>
            </div>
            {/* Reason */}
            <div className="border-b border-black min-h-[40px] flex flex-col">
              <div className="p-1 px-2 bg-gray-50 border-b border-black text-[11px] font-semibold">REASON</div>
              <div className="p-2 text-[12px] whitespace-pre-wrap leading-relaxed min-h-[28px]">{data.reason || <span className="text-slate-300 italic">ไม่ระบุ</span>}</div>
            </div>
            {/* Solution */}
            <div className="border-b border-black min-h-[80px] flex flex-col">
              <div className="p-1 px-2 bg-gray-50 border-b border-black text-[11px] font-semibold">DETAIL OF OPERATION OR SOLUTION</div>
              <div className="p-2 text-[12px] whitespace-pre-wrap leading-relaxed min-h-[60px]">{data.solution || <span className="text-slate-300 italic">ไม่ระบุ</span>}</div>
            </div>
            {/* Comment */}
            <div className="border-b border-black min-h-[36px] flex flex-col">
              <div className="p-1 px-2 bg-gray-50 border-b border-black text-[11px] font-semibold">COMMENT</div>
              <div className="p-2 text-[12px] whitespace-pre-wrap min-h-[24px]">{data.comment || <span className="text-slate-300 italic">—</span>}</div>
            </div>
            {/* Signatures */}
            <div className="flex min-h-[60px]">
              <div className="w-1/2 border-r border-black flex flex-col">
                <div className="p-1 text-center text-[11px] font-semibold bg-gray-50 border-b border-black">ACKNOWLEDGE BY</div>
                <div className="flex-1" />
              </div>
              <div className="w-1/2 flex flex-col">
                <div className="p-1 text-center text-[11px] font-semibold bg-gray-50 border-b border-black">ISSUED BY</div>
                <div className="flex-1" />
              </div>
            </div>
          </div>

          {/* Preview watermark */}
          <div className="mt-2 text-center text-[9px] text-slate-300 uppercase tracking-widest font-bold">
            ── PREVIEW ONLY — ยังไม่ได้บันทึกในระบบ ──
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <ChevronLeft size={16} /> แก้ไขข้อมูล
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-800">{data.customerName || "—"}</p>
            <p className="text-[10px] text-slate-400">Job: {data.jobNo || "—"}</p>
          </div>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-violet-600 text-white rounded-xl font-black shadow-lg shadow-violet-500/30 hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><CheckCircle2 size={18} /> ยืนยันบันทึก</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// OperationReportForm — Main
// ─────────────────────────────────────────────────────────────
const OperationReportForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const initialData = {
    jobNo: "", issuedDate: new Date().toISOString().split("T")[0],
    isWarranty: false, isUrgent: false, isAfterService: false, isOther: false,
    otherDetail: "", expense: "NO HAVE",
    customerName: "", contactName: "",
    startTime: "", finishTime: "", operationPerson: "",
    problem: "", receivedInfoDate: "", receivedInfoTime: "",
    reason: "", solution: "", comment: "",
    place: "", project: "",
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (location.state) setFormData((prev) => ({ ...prev, ...location.state }));
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // ขั้นตอนที่ 1: กด "Preview & Save" → เปิด Modal
  const handlePreviewClick = (e) => {
    e.preventDefault();
    setShowPreview(true);
  };

  // ขั้นตอนที่ 2: กด "ยืนยันบันทึก" ใน Modal → Save จริง
  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    try {
      const dbData = {
        job_no: formData.jobNo,
        issued_date: formData.issuedDate,
        service_type: {
          warranty: formData.isWarranty, urgent: formData.isUrgent,
          after_service: formData.isAfterService, other: formData.isOther,
        },
        expense: formData.expense,
        customer_name: formData.customerName,
        contact_name: formData.contactName,
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
        comment: formData.comment,
      };

      const { data, error } = await supabase
        .from("doc_operation_reports")
        .insert([dbData])
        .select();

      if (error) throw error;

      setShowPreview(false);
      navigate("/operation-report-print", {
        state: { ...formData, id: data[0].id },
      });
    } catch (error) {
      console.error("Error saving report:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormLabel = ({ label, subLabel, required }) => (
    <label className="block mb-1.5">
      <span className="text-slate-800 font-bold text-sm mr-2 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {subLabel && <span className="text-slate-400 text-xs font-normal">{subLabel}</span>}
    </label>
  );

  // ── ตรวจว่ากรอก field บังคับครบยัง (แสดงบน progress bar) ──
  const requiredFields = [
    { key: "jobNo", label: "Job No." },
    { key: "customerName", label: "Customer" },
    { key: "operationPerson", label: "Operation Person" },
    { key: "problem", label: "Problem" },
  ];
  const filledCount = requiredFields.filter((f) => formData[f.key]?.toString().trim()).length;
  const progressPct = Math.round((filledCount / requiredFields.length) * 100);

  return (
    <>
      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => !isSubmitting && setShowPreview(false)}
        onConfirm={handleConfirmSave}
        data={formData}
        isSaving={isSubmitting}
      />

      <div className="min-h-screen bg-slate-50/50 pb-24">

        {/* Sticky Navbar */}
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <ChevronLeft size={18} />
              </Link>
              <div className="h-5 w-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-1 text-[13px] font-medium">
                <Link to="/" className="text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                  <Home size={13} /> หน้าแรก
                </Link>
                <ChevronRight size={11} className="text-slate-300" />
                <span className="text-slate-800 font-bold">Operation Report</span>
              </div>
            </div>

            {/* Progress indicator in navbar */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5">
                {requiredFields.map((f) => (
                  <div
                    key={f.key}
                    title={f.label}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      formData[f.key]?.toString().trim() ? "bg-violet-500 scale-110" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full transition-colors ${
                progressPct === 100 ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
              }`}>
                {filledCount}/{requiredFields.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </nav>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Page Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20 rotate-3">
              <ClipboardList size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Operation Report</h1>
              <p className="text-slate-500 text-sm font-medium">Operation Record / รายงานการปฏิบัติงาน</p>
            </div>
          </div>

          <form onSubmit={handlePreviewClick} className="space-y-6">

            {/* Section 1: Basic Info */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel label="Job No." required />
                  <input type="text" name="jobNo" value={formData.jobNo} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none transition-all font-mono"
                    required />
                </div>
                <div>
                  <FormLabel label="Issued Date" required />
                  <input type="date" name="issuedDate" value={formData.issuedDate} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
                    required />
                </div>
              </div>
            </div>

            {/* Section 2: Service Type & Expense */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Info size={18} className="text-slate-400" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Service Type & Expense</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "isWarranty", label: "Warranty" },
                    { id: "isUrgent", label: "Urgent Service" },
                    { id: "isAfterService", label: "After Service" },
                    { id: "isOther", label: "Other" },
                  ].map((item) => (
                    <label key={item.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      formData[item.id]
                        ? "bg-violet-50 border-violet-300 ring-1 ring-violet-300"
                        : "bg-slate-50/50 border-slate-100 hover:border-violet-200"
                    }`}>
                      <input type="checkbox" name={item.id} checked={formData[item.id]} onChange={handleChange}
                        className="w-5 h-5 accent-violet-600 rounded cursor-pointer" />
                      <span className={`text-sm font-bold uppercase tracking-tight ${formData[item.id] ? "text-violet-700" : "text-slate-500"}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex flex-col justify-center">
                  <FormLabel label="Expense" subLabel="(Select one)" />
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5 mt-1">
                    {["HAVE", "NO HAVE"].map((val) => (
                      <button key={val} type="button"
                        onClick={() => setFormData((p) => ({ ...p, expense: val }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                          formData.expense === val ? "bg-white text-violet-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                        }`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Information */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <MapPin size={18} className="text-slate-400" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel label="Customer Name" required />
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 outline-none"
                    placeholder="ชื่อบริษัทลูกค้า" required />
                </div>
                <div>
                  <FormLabel label="Contact Name" />
                  <input type="text" name="contactName" value={formData.contactName} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 outline-none"
                    placeholder="ชื่อผู้ติดต่อ" />
                </div>
                <div>
                  <FormLabel label="Place" />
                  <input type="text" name="place" value={formData.place} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 outline-none"
                    placeholder="ระบุสถานที่ปฏิบัติงาน" />
                </div>
                <div>
                  <FormLabel label="Project" />
                  <input type="text" name="project" value={formData.project} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 outline-none"
                    placeholder="ระบุชื่อโครงการ" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel label="Start Time" />
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 outline-none" />
                  </div>
                  <div>
                    <FormLabel label="Finish Time" />
                    <input type="time" name="finishTime" value={formData.finishTime} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 outline-none" />
                  </div>
                </div>
                <div>
                  <FormLabel label="Operation Person" required />
                  <input type="text" name="operationPerson" value={formData.operationPerson} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 outline-none"
                    placeholder="ชื่อผู้ปฏิบัติงาน" required />
                </div>
              </div>
            </div>

            {/* Section 4: Operation Details */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Clock size={18} className="text-slate-400" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Operation Details</h3>
              </div>
              <div className="space-y-5">
                <div className="bg-violet-50/50 p-5 rounded-2xl border border-violet-100">
                  <div className="mb-4">
                    <FormLabel label="Problem" required />
                    <textarea name="problem" value={formData.problem} onChange={handleChange} rows="3"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none resize-none"
                      placeholder="รายละเอียดปัญหา..." required />
                  </div>
                  <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-xl border border-violet-100">
                    <span className="text-xs font-black uppercase text-slate-600">Received Info From:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Date</span>
                      <input type="date" name="receivedInfoDate" value={formData.receivedInfoDate} onChange={handleChange}
                        className="px-2 py-1 text-sm border rounded bg-slate-50 outline-none focus:border-violet-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Time</span>
                      <input type="time" name="receivedInfoTime" value={formData.receivedInfoTime} onChange={handleChange}
                        className="px-2 py-1 text-sm border rounded bg-slate-50 outline-none focus:border-violet-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <FormLabel label="Reason" />
                  <textarea name="reason" value={formData.reason} onChange={handleChange} rows="2"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none resize-none focus:bg-white transition-colors" />
                </div>
                <div>
                  <FormLabel label="Detail of Operation or Solution" />
                  <textarea name="solution" value={formData.solution} onChange={handleChange} rows="4"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none resize-none focus:bg-white transition-colors" />
                </div>
                <div>
                  <FormLabel label="Comment" />
                  <textarea name="comment" value={formData.comment} onChange={handleChange} rows="2"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none resize-none focus:bg-white transition-colors" />
                </div>
              </div>
            </div>

            {/* ── Sticky Bottom Action Bar ── */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-6 py-4">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">

                {/* ซ้าย: สถานะการกรอก */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={18} className={progressPct === 100 ? "text-violet-600" : "text-slate-400"} />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-black text-slate-700">
                      {progressPct === 100 ? "พร้อม Preview แล้ว ✓" : `กรอกแล้ว ${filledCount}/${requiredFields.length} ช่องบังคับ`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {progressPct === 100 ? "กดปุ่มขวาเพื่อดูตัวอย่างเอกสาร" : `ยังขาด: ${requiredFields.filter(f => !formData[f.key]?.toString().trim()).map(f => f.label).join(", ")}`}
                    </p>
                  </div>
                </div>

                {/* ขวา: ปุ่ม */}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => navigate("/")}
                    className="px-5 py-2.5 text-sm text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors border border-slate-200">
                    ยกเลิก
                  </button>

                  {/* ปุ่มหลัก: Preview & Save */}
                  <button type="submit"
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${
                      progressPct === 100
                        ? "bg-violet-600 text-white shadow-violet-500/30 hover:bg-violet-700 hover:-translate-y-0.5"
                        : "bg-slate-800 text-white shadow-slate-800/20 hover:bg-black hover:-translate-y-0.5"
                    }`}>
                    <Eye size={20} />
                    Preview & Save
                  </button>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default OperationReportForm;