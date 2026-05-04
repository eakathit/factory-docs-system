// src/CompletionReportForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChevronLeft, Loader2, Home, ChevronRight, Save, FileText, Eye } from "lucide-react";
import { supabase } from "./supabaseClient";
import toast from "react-hot-toast";
import CompletionReportDocumentView from "./CompletionReportDocumentView";
import FormHeader from "./FormHeader";

export default function CompletionReportForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("form");

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const initialData = {
    id: null,
    date: new Date().toISOString().split("T")[0],
    projectName: "",
    projectNo: "",
    location: "",
    finishTime: getCurrentTime(),
    isComplete: true,
    remark: "",
    status: "Pending",
  };

  const [formData, setFormData] = useState(initialData);

  const previewDoc = {
    ...formData,
    approver_signature: formData.approver_signature || null,
  };

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
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dbData = {
        date: formData.date,
        project_name: formData.projectName,
        project_no: formData.projectNo,
        location: formData.location,
        finish_time: formData.finishTime,
        is_complete: formData.isComplete,
        remark: formData.remark,
        status: formData.status || "Pending",
      };
      
      let resultData = null;
      
      if (formData.id) {
        const { data, error } = await supabase
          .from("doc_completion_reports")
          .update(dbData)
          .eq("id", formData.id)
          .select();
        if (error) throw error;
        resultData = data[0];
      } else {
        const { data, error } = await supabase
          .from("doc_completion_reports")
          .insert([dbData])
          .select();
        if (error) throw error;
        resultData = data[0];
      }

      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว!');
      navigate("/completion-report-print", {
        state: {
          ...formData,
          id: resultData.id,
          created_at: resultData.created_at,
        },
      });

    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <FormHeader
        title="Construction Completion Report"
        isEditing={!!formData.id}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accent="orange"
      />

      <div className="min-w-0 xl:flex xl:h-[calc(100vh-64px)]">
        <div className={`min-w-0 xl:w-[45%] xl:overflow-y-auto pb-20 ${activeTab === "preview" ? "hidden xl:block" : ""}`}>
          <div className="max-w-2xl mx-auto px-4 pt-8 min-w-0">
        
        {/* ── Page heading (Minimalist Style) ── */}
        <div className="mb-7">
          <h1 className="text-lg sm:text-xl font-bold text-stone-800 tracking-normal sm:tracking-tight uppercase leading-snug break-words">
            CONSTRUCTION COMPLETION REPORT
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">รายงานเสร็จสิ้นโครงการ</p>
          <div className="mt-3 h-px bg-stone-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ════════════════════════════════════════════════
               Section 1 — Project Information
          ════════════════════════════════════════════════ */}
          <Card title="ข้อมูลโครงการ (Project Information)">
            <Row2>
              <Field label="สถานที่โครงการ" hint="Place / 工事場所">
                <input type="text" name="location" value={formData.location} onChange={handleChange} 
                  className={inp()} placeholder="ระบุสถานที่โครงการ..." />
              </Field>
              <Field label="วันที่" hint="Date / 記入日" required>
                <input type="date" name="date" value={formData.date} onChange={handleChange} 
                  className={inp()} required />
              </Field>
            </Row2>

            <Row2>
              <Field label="ชื่อโครงการ" hint="Project Name / 工事名" required>
                <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} 
                  className={inp()} placeholder="ระบุชื่อโครงการ..." required />
              </Field>
              <Field label="รหัสโครงการ" hint="Project No. / 工事番号">
                <input type="text" name="projectNo" value={formData.projectNo} onChange={handleChange} 
                  className={inp('font-sens')} placeholder="เช่น PRJ-202X-01" />
              </Field>
            </Row2>

            <Row2>
              <Field label="เวลาที่เสร็จสิ้น" hint="Time / 終わた時間">
                <input type="time" name="finishTime" value={formData.finishTime} onChange={handleChange} 
                  className={inp()} />
              </Field>
              <Field label="ผลการดำเนินงาน" hint="Complete / Not Complete">
                <div className="flex bg-stone-100 p-1.5 rounded-xl border border-stone-200 gap-1.5 mt-2">
                  <button type="button" onClick={() => setFormData((prev) => ({ ...prev, isComplete: true }))}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                      formData.isComplete ? "bg-white text-emerald-600 shadow-sm ring-1 ring-stone-200" : "text-stone-400 hover:text-stone-600"
                    }`}>
                    Complete
                  </button>
                  <button type="button" onClick={() => setFormData((prev) => ({ ...prev, isComplete: false }))}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                      !formData.isComplete ? "bg-white text-red-500 shadow-sm ring-1 ring-stone-200" : "text-stone-400 hover:text-stone-600"
                    }`}>
                    Not Complete
                  </button>
                </div>
              </Field>
            </Row2>
          </Card>

          {/* ════════════════════════════════════════════════
               Section 2 — Remarks
          ════════════════════════════════════════════════ */}
          <Card title="หมายเหตุ (Remark)">
            <Field label="หมายเหตุ" hint="Remark / 備考">
              <textarea name="remark" value={formData.remark} onChange={handleChange} rows="3"
                className={txtInp()} placeholder="ระบุรายละเอียดเพิ่มเติม..."></textarea>
            </Field>

          </Card>

          {/* ── Buttons ── */}
          <div className="flex gap-3 pt-4 pb-10">
            <button type="button" onClick={() => navigate(-1)} 
              className="flex-1 py-3.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-bold text-center hover:bg-stone-100 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={isSubmitting} 
              className="flex-[3] py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20">
              {isSubmitting 
                ? <><Loader2 size={16} className="animate-spin" /> กำลังบันทึก...</> 
                : <><Save size={16} /> {formData.id ? 'บันทึกการแก้ไข' : 'บันทึกและพิมพ์'}</>}
            </button>
          </div>

        </form>
          </div>
        </div>

        <div className={`flex-1 bg-gray-200 overflow-y-auto xl:flex ${
          activeTab === "preview" ? "flex" : "hidden xl:flex"
        }`}>
          <div className="w-full py-6 flex flex-col items-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">● Live Preview</p>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
              .font-sarabun { font-family: 'Sarabun', sans-serif; }
            `}</style>

            <div className="xl:hidden w-full overflow-x-auto px-2">
              <CompletionReportDocumentView doc={previewDoc} />
            </div>

            <div
              className="hidden xl:block"
              style={{
                transform: "scale(0.62)",
                transformOrigin: "top center",
                marginBottom: "calc((0.62 - 1) * 297mm)",
              }}
            >
              <CompletionReportDocumentView doc={previewDoc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── UI Helpers ──────────────────────────────────────────────────────────────

function Card({ title, children }) {
  return (
    <div className="min-w-0 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50/80">
        <span className="min-w-0 text-xs sm:text-sm font-extrabold text-stone-500 uppercase tracking-wide sm:tracking-widest break-words">
          {title}
        </span>
      </div>
      <div className="min-w-0 p-5 sm:p-6">{children}</div>
    </div>
  )
}

function Row2({ children }) {
  return (
    <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">
      {children}
    </div>
  )
}

function Field({ label, hint, required, children }) {
  return (
    <div className="min-w-0">
      <label className="block text-xs sm:text-sm font-extrabold text-stone-500 uppercase tracking-wide sm:tracking-widest mb-3 break-words">
        {label}
        {hint && <span className="ml-1.5 normal-case text-xs font-normal text-stone-400">{hint}</span>}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function inp(extra = '') {
  return `w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${extra}`
}

function txtInp(extra = '') {
  return `w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none ${extra}`
}
