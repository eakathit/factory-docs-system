// src/CompletionReportForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronLeft,
  Printer,
  Loader2,
  FileCheck,
  Home,
  ChevronRight,
} from "lucide-react"; // เพิ่มไอคอน
import { supabase } from "./supabaseClient";

const CompletionReportForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ... (ฟังก์ชัน getCurrentTime และ state ต่างๆ เหมือนเดิม) ...
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
      navigate("/completion-report-print", {
        state: {
          ...formData,
          id: resultData.id,
          created_at: resultData.created_at,
        },
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
      <span className="text-slate-800 font-medium text-base mr-2">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <span className="text-slate-400 text-xs font-normal font-mono">
        {subLabel}
      </span>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* --- New Sticky Navbar --- */}
      <nav className="relative sm:sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="h-5 sm:h-6 w-[1px] bg-slate-200 mx-1" />

            {/* Breadcrumbs: ปรับขนาดตัวอักษรและซ่อนไอคอนในจอเล็กมากเพื่อประหยัดพื้นที่ */}
            <div className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-sm font-medium">
              <Link
                to="/"
                className="text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Home size={14} /> หน้าแรก
              </Link>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 truncate max-w-[150px] sm:max-w-none">
                Completion Report
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-3xl mx-auto px-6 py-10">
        {/* --- Improved Header Section --- */}
        <div className="flex items-center gap-5 mb-10 fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-xl rotate-3">
            <FileCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Completion Report
            </h1>
            <p className="text-slate-500 text-sm">รายงานเสร็จสิ้นโครงการ</p>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 sm:p-10 fade-in-up"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* วันที่ */}
            <div>
              <FormLabel label="วันที่" subLabel="Date / 記入日" required />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                required
              />
            </div>

            {/* เวลา */}
            <div>
              <FormLabel label="เวลา" subLabel="Time / 終わた時間" />
              <input
                type="time"
                name="finishTime"
                value={formData.finishTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            {/* ชื่อโครงการ */}
            <div className="md:col-span-2">
              <FormLabel
                label="ชื่อโครงการ"
                subLabel="Project Name / 工事名"
                required
              />
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-300"
                placeholder="ระบุชื่อโครงการ"
                required
              />
            </div>

            {/* รหัสโครงการ */}
            <div>
              <FormLabel
                label="รหัสโครงการ"
                subLabel="Project No. / 工事番号"
              />
              <input
                type="text"
                name="projectNo"
                value={formData.projectNo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-300"
                placeholder="ระบุรหัส (ถ้ามี)"
              />
            </div>

            {/* สถานที่ */}
            <div>
              <FormLabel label="สถานที่" subLabel="Place / 工事場所" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-300"
                placeholder="ระบุสถานที่"
              />
            </div>

            {/* สถานะความสำเร็จ */}
            <div className="md:col-span-2 pt-2">
              <FormLabel label="สถานะงาน" subLabel="Status / 状態" />
              <div className="flex w-full bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isComplete: true }))
                  }
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${formData.isComplete ? "bg-white text-green-600 shadow-md ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Complete
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isComplete: false }))
                  }
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${!formData.isComplete ? "bg-white text-red-500 shadow-md ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Not Complete
                </button>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="md:col-span-2">
              <FormLabel label="หมายเหตุ" subLabel="Remark / 備考" />
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-300 resize-none"
                placeholder="ระบุรายละเอียดเพิ่มเติม..."
              ></textarea>
            </div>
          </div>

          {/* ปุ่ม Action */}
          <div className="flex items-center justify-end gap-4 mt-10 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2.5 text-sm text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-black hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> บันทึก...
                </>
              ) : (
                <>
                  <Printer size={20} /> บันทึกและพิมพ์
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompletionReportForm;
