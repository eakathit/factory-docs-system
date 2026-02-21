// src/OperationReportForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChevronLeft, Loader2, Save, Home, ChevronRight } from "lucide-react";
import { supabase } from "./supabaseClient";
import toast from "react-hot-toast";

export default function OperationReportForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    op1: "", op2: "", op3: "", op4: "",
    problem: "",
    receivedInfoFrom: "",
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
    const st = location.state;
    const ops = (st.operationPerson || "").split(',');
    setFormData((prev) => ({
      ...prev,
      ...st,
      op1: ops[0]?.trim() || "",
      op2: ops[1]?.trim() || "",
      op3: ops[2]?.trim() || "",
      op4: ops[3]?.trim() || "",
    }));
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
      const combinedOps = [formData.op1, formData.op2, formData.op3, formData.op4]
      .filter(Boolean) // เอาเฉพาะช่องที่มีการพิมพ์
      .join(',');

      const dbData = {
        job_no: formData.jobNo,
        issued_date: formData.issuedDate,
        service_type: {
          warranty: formData.isWarranty,
          urgent: formData.isUrgent,
          after_service: formData.isAfterService,
          other: formData.isOther
        },
        expense: formData.expense,
        customer_name: formData.customerName,
        contact_name: formData.contactName,
        place: formData.place, 
        project: formData.project,
        start_time: formData.startTime,
        finish_time: formData.finishTime,
        operation_person: combinedOps,
        problem: formData.problem,
        received_info_from: formData.receivedInfoFrom,
        received_info_date: formData.receivedInfoDate,
        received_info_time: formData.receivedInfoTime,
        reason: formData.reason,
        solution: formData.solution,
        comment: formData.comment
      };

      let newId = location.state?.id;

      if (newId) {
        const { error } = await supabase
          .from('doc_operation_reports')
          .update(dbData)
          .eq('id', newId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('doc_operation_reports')
          .insert([dbData])
          .select();
        if (error) throw error;
        newId = data[0].id;
      }

      toast.success('Data saved successfully!');
      navigate('/operation-report-print', { 
        state: { 
          ...formData,                    // 🟢 ส่งข้อมูลจากฟอร์มโดยตรง (ชื่อตัวแปรจะตรงกับหน้า Print เป๊ะๆ)
          operationPerson: combinedOps,   // 🟢 แนบชื่อพนักงาน 4 คนที่เอามาต่อกันแล้วไปด้วย
          id: newId 
        } 
      });

    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Error saving data: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20" style={{ fontFamily: "'Prompt', sans-serif" }}>
      
      {/* --- Sticky Navbar --- */}
      <nav className="relative sm:sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="p-1.5 sm:p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors">
              <ChevronLeft size={18} />
            </Link>
            <div className="h-5 sm:h-6 w-[1px] bg-stone-200 mx-1" />
            <div className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-sm font-medium">
              <Link to="/" className="text-stone-400 hover:text-teal-600 flex items-center gap-1 transition-colors whitespace-nowrap">
                <Home size={14} /> Home
              </Link>
              <ChevronRight size={12} className="text-stone-300" />
              <span className="text-stone-800 truncate max-w-[190px] sm:max-w-none font-bold">
                Operation Report {location.state && "(Edit)"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        
        {/* ── Page heading (Minimalist Style like Receipt Form) ── */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight uppercase">
            OPERATION REPORT
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">Operation Record Form</p>
          <div className="mt-3 h-px bg-stone-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ════════════════════════════════════════════════
               Section 1 — Document Info
          ════════════════════════════════════════════════ */}
          <Card title="Document Information">
            <Row2>
              <Field label="Job No." required>
                <input type="text" name="jobNo" value={formData.jobNo} onChange={handleChange} 
                  className={inp('font-sens')} placeholder="Enter job no." required />
              </Field>
              <Field label="Issued Date" required>
                <input type="date" name="issuedDate" value={formData.issuedDate} onChange={handleChange} 
                  className={inp()} required />
              </Field>
            </Row2>
          </Card>

          {/* ════════════════════════════════════════════════
               Section 2 — Service Type & Expense
          ════════════════════════════════════════════════ */}
          <Card title="Service Type & Expense">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <Field label="Service Type" hint="(Multiple selection allowed)">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {[
                      { id: "isWarranty", label: "Warranty" },
                      { id: "isUrgent", label: "Urgent Service" },
                      { id: "isAfterService", label: "After Service" },
                      { id: "isOther", label: "Other" },
                    ].map((item) => (
                      <label key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData[item.id] ? "bg-teal-50/50 border-teal-600 shadow-sm" : "border-stone-200 hover:border-stone-300 bg-stone-50"
                      }`}>
                        <input type="checkbox" name={item.id} checked={formData[item.id]} onChange={handleChange} 
                          className="w-4 h-4 accent-teal-600" />
                        <span className={`text-[13px] font-bold uppercase tracking-tight ${
                          formData[item.id] ? "text-teal-800" : "text-stone-600"
                        }`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </Field>
              </div>

              <div>
                <Field label="Expense" hint="(Select one)">
                  <div className="flex bg-stone-100 p-1.5 rounded-xl border border-stone-200 gap-1.5 mt-2">
                    {["HAVE", "NO HAVE"].map((val) => (
                      <button key={val} type="button" onClick={() => setFormData((prev) => ({ ...prev, expense: val }))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                          formData.expense === val ? "bg-white text-teal-700 shadow-sm ring-1 ring-stone-200" : "text-stone-400 hover:text-stone-600"
                        }`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

            </div>
          </Card>

          {/* ════════════════════════════════════════════════
               Section 3 — Customer & Location Details
          ════════════════════════════════════════════════ */}
          <Card title="Customer & Location Details">
            <Row2>
              <Field label="Customer Name" hint="Company Name">
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} 
                  className={inp()} placeholder="Enter customer name..." />
              </Field>
              <Field label="Contact Name" hint="Contact Person">
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} 
                  className={inp()} placeholder="Enter contact name..." />
              </Field>
            </Row2>
            
            <Row2>
              <Field label="Project" hint="Project Name">
                <input type="text" name="project" value={formData.project} onChange={handleChange} 
                  className={inp()} placeholder="Enter project name..." />
              </Field>
              <Field label="Place" hint="Work Location">
                <input type="text" name="place" value={formData.place} onChange={handleChange} 
                  className={inp()} placeholder="Enter location..." />
              </Field>
            </Row2>

            <Row2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Time">
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={inp()} />
                </Field>
                <Field label="Finish Time">
                  <input type="time" name="finishTime" value={formData.finishTime} onChange={handleChange} className={inp()} />
                </Field>
              </div>
              <div className="col-span-1 md:col-span-2 mt-2">
  <Field label="Operation Person" hint="(Operator Names - Max 4)">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input type="text" name="op1" value={formData.op1} onChange={handleChange} className={inp()} placeholder="Person 1..." />
      <input type="text" name="op2" value={formData.op2} onChange={handleChange} className={inp()} placeholder="Person 2..." />
      <input type="text" name="op3" value={formData.op3} onChange={handleChange} className={inp()} placeholder="Person 3..." />
      <input type="text" name="op4" value={formData.op4} onChange={handleChange} className={inp()} placeholder="Person 4..." />
    </div>
  </Field>
</div>
            </Row2>
          </Card>

          {/* ════════════════════════════════════════════════
               Section 4 — Operation Details
          ════════════════════════════════════════════════ */}
          <Card title="Operation Details">
            
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 mb-5 space-y-4">
              <Field label="Problem" hint="Problem Description">
                <textarea name="problem" value={formData.problem} onChange={handleChange} rows="3"
                  className={txtInp()} placeholder="Describe the problem..."></textarea>
              </Field>

              {/* แทนที่ div Received Info From เดิม ด้วยโค้ดนี้ */}
<div className="bg-stone-100/60 p-4 sm:p-5 rounded-xl border border-stone-200">
  <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-stone-200/60 pb-2">
    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
    Received Info From
  </h4>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div>
      <label className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 block">Name</label>
      <input type="text" name="receivedInfoFrom" value={formData.receivedInfoFrom || ''} onChange={handleChange} 
        className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all" placeholder="Enter name..." />
    </div>
    <div>
      <label className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 block">Date</label>
      <input type="date" name="receivedInfoDate" value={formData.receivedInfoDate || ''} onChange={handleChange} 
        className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all" />
    </div>
    <div>
      <label className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 block">Time</label>
      <input type="time" name="receivedInfoTime" value={formData.receivedInfoTime || ''} onChange={handleChange} 
        className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all" />
    </div>
  </div>
</div>
            </div>

            <div className="space-y-5">
              <Field label="Reason" hint="Root Cause">
                <textarea name="reason" value={formData.reason} onChange={handleChange} rows="2"
                  className={txtInp()} placeholder="Specify the cause..."></textarea>
              </Field>
              
              <Field label="Solution / Detail of Operation" hint="Action Taken">
                <textarea name="solution" value={formData.solution} onChange={handleChange} rows="4"
                  className={txtInp()} placeholder="Describe actions taken..."></textarea>
              </Field>

              <Field label="Comment" hint="Additional Remarks">
                <textarea name="comment" value={formData.comment} onChange={handleChange} rows="2"
                  className={txtInp()} placeholder="Any suggestions or comments..."></textarea>
              </Field>
            </div>

          </Card>

          {/* ── Buttons ── */}
          <div className="flex gap-3 pt-4 pb-10">
            <button type="button" onClick={() => navigate(-1)} 
              className="flex-1 py-3.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-bold text-center hover:bg-stone-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} 
              className="flex-[3] py-3.5 rounded-xl bg-teal-700 text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-teal-800 transition-colors disabled:opacity-50">
              {isSubmitting 
                ? <><Loader2 size={16} className="animate-spin" /> Saving...</> 
                : <><Save size={16} /> {location.state?.id ? 'Save Changes' : 'Save & Print'}</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ── UI Helpers ──────────────────────────────────────────────────────────────

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50/80">
        <span className="text-xs sm:text-sm font-extrabold text-stone-500 uppercase tracking-widest">
          {title}
        </span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}

function Row2({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-5">
      {children}
    </div>
  )
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-extrabold text-stone-500 uppercase tracking-widest mb-2">
        {label}
        {hint && <span className="ml-1.5 normal-case text-xs font-normal text-stone-400">{hint}</span>}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function inp(extra = '') {
  return `w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all ${extra}`
}

function txtInp(extra = '') {
  return `w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all resize-none ${extra}`
}