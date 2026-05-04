import React, { useRef, useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';
import OperationReportDocumentView from './OperationReportDocumentView';
import {
  CheckCircle, Trash2, ChevronLeft, FileText, User,
  Hash, Calendar, Banknote, ChevronRight, AlertCircle,
  PenLine, Loader2, ShieldCheck, Eye, X, ChevronDown,
  ChevronUp, ClipboardList, FileCheck, Receipt, Wrench,
  MapPin, Clock, Phone, Tag, AlertTriangle, Wallet,
  CheckSquare, XSquare, Users, CreditCard, Home, Briefcase,
  ScrollText
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TABLE_MAP = {
  order:      'doc_contractor_orders',
  receipt:    'doc_substitute_receipts',
  voucher:    'doc_receipt_vouchers',
  operation:  'doc_operation_reports',
  completion: 'doc_completion_reports',
};

const DOC_META = {
  order:      { label: 'ใบสั่งจ้างผู้รับเหมา',  icon: Wrench,        color: 'blue',    long: true  },
  receipt:    { label: 'ใบรับรองแทนใบเสร็จ',     icon: Receipt,       color: 'emerald', long: false },
  voucher:    { label: 'ใบสำคัญรับเงิน',         icon: Banknote,      color: 'pink',    long: false },
  operation:  { label: 'Operation Report',        icon: ClipboardList, color: 'violet',  long: true  },
  completion: { label: 'Completion Report',       icon: FileCheck,     color: 'orange',  long: true  },
};

const COLOR = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    grad: 'from-blue-500 to-indigo-500'   },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', grad: 'from-emerald-500 to-teal-500'  },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    grad: 'from-pink-500 to-rose-500'     },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  grad: 'from-violet-500 to-purple-600' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  grad: 'from-orange-400 to-amber-500'  },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';

const fmtMoney = (n) =>
  n != null && n !== '' ? `฿${Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : null;

const completionStatus = (isComplete) => (
  isComplete
    ? {
        label: 'Complete — เสร็จสมบูรณ์',
        shortLabel: 'Complete',
        tone: 'emerald',
        icon: CheckSquare,
        note: 'รายงานนี้ระบุว่าโครงการเสร็จสิ้นแล้ว พร้อมส่งให้ผู้อนุมัติตรวจสอบและลงนาม',
      }
    : {
        label: 'Not Complete — ยังไม่เสร็จ',
        shortLabel: 'Not Complete',
        tone: 'red',
        icon: XSquare,
        note: 'รายงานนี้ระบุว่าโครงการยังไม่เสร็จ ควรตรวจสอบหมายเหตุและรายละเอียดก่อนอนุมัติ',
      }
);

// ─────────────────────────────────────────────────────────────────────────────
// Shared small UI
// ─────────────────────────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-start gap-2.5">
    <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${highlight ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
      <Icon size={13} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
      <p className={`text-sm font-bold truncate ${highlight ? 'text-emerald-600' : 'text-slate-700'}`}>{value ?? '—'}</p>
    </div>
  </div>
);

const StepBar = ({ step }) => (
  <div className="flex items-center gap-2 mb-5">
    {['review', 'sign'].map((s, i) => {
      const active = step === s;
      const done   = s === 'review' && step === 'sign';
      return (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300
            ${done   ? 'bg-emerald-100 text-emerald-600'
            : active ? 'bg-blue-600 text-white shadow-md shadow-blue-400/30'
            :          'bg-slate-100 text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black
              ${done   ? 'bg-emerald-500 text-white'
              : active ? 'bg-white/30'
              :          'bg-slate-200 text-slate-400'}`}>
              {done ? '✓' : i + 1}
            </span>
            {s === 'review' ? 'ตรวจสอบ' : 'ลงนาม'}
          </div>
          {i === 0 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500
              ${step === 'sign' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DocDetail sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Section wrapper */
const Sec = ({ title, icon: Icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-2 px-1">
      {Icon && <Icon size={12} className="text-slate-400" />}
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
    <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">{children}</div>
  </div>
);

/** Key-value row inside Sec */
const KV = ({ label, value, mono, highlight }) => {
  if (value == null || value === '' || value === '—') return null;
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 flex-shrink-0 min-w-[90px]">{label}</span>
      <span className={`text-xs font-semibold text-right break-all
        ${highlight ? 'text-emerald-600 font-bold' : 'text-slate-800'}
        ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
};

/** Badge row for tags/chips */
const BadgeRow = ({ items }) => (
  <div className="flex flex-wrap gap-1.5 px-4 py-3">
    {items.map((item, i) => (
      <span key={i} className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${item.active
        ? 'bg-violet-100 text-violet-700 border border-violet-200'
        : 'bg-slate-100 text-slate-400 line-through'}`}>
        {item.label}
      </span>
    ))}
  </div>
);

const CompletionApprovalBrief = ({ docData }) => {
  const status = completionStatus(!!docData?.is_complete);
  const StatusIcon = status.icon;
  const isDone = status.tone === 'emerald';

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden anim-up-2 ${
      isDone ? 'border-emerald-100' : 'border-red-100'
    }`}>
      <div className={`px-5 py-4 border-b ${
        isDone ? 'bg-emerald-50/70 border-emerald-100' : 'bg-red-50/70 border-red-100'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
          }`}>
            <StatusIcon size={18} />
          </div>
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${
              isDone ? 'text-emerald-600' : 'text-red-600'
            }`}>
              ผลการดำเนินงาน
            </p>
            <p className={`text-sm font-black mt-0.5 ${isDone ? 'text-emerald-700' : 'text-red-700'}`}>
              {status.label}
            </p>
            <p className={`text-[11px] leading-relaxed mt-1 ${isDone ? 'text-emerald-700/75' : 'text-red-700/75'}`}>
              {status.note}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <InfoRow icon={MapPin} label="สถานที่โครงการ" value={docData?.location} />
        <InfoRow icon={Calendar} label="วันที่รายงาน" value={fmt(docData?.date)} />
        <InfoRow icon={Clock} label="เวลาเสร็จสิ้น" value={docData?.finish_time} />
        <InfoRow icon={Hash} label="รหัสโครงการ" value={docData?.project_no} />
      </div>

      <div className="px-5 pb-4">
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">หมายเหตุ</p>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
            {docData?.remark || 'ไม่มีหมายเหตุเพิ่มเติม'}
          </p>
        </div>
      </div>
    </div>
  );
};

const serviceTypeItems = (docData) => {
  const st = typeof docData?.service_type === 'object' ? docData.service_type : {};
  return [
    { label: 'Warranty', active: !!st.warranty },
    { label: 'Urgent Service', active: !!st.urgent },
    { label: 'After Service', active: !!st.after_service },
    { label: 'Other', active: !!st.other },
  ];
};

const OperationApprovalBrief = ({ docData }) => {
  const serviceTypes = serviceTypeItems(docData).filter(item => item.active);
  const people = (docData?.operation_person || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

  const hasProblemFlow = !!(docData?.problem || docData?.reason || docData?.solution);

  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden anim-up-2">
      <div className="px-5 py-4 border-b border-violet-100 bg-violet-50/70">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-violet-100 text-violet-600 flex-shrink-0">
            <ClipboardList size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
              Service Summary
            </p>
            <p className="text-sm font-black text-violet-800 mt-0.5">
              {docData?.customer_name || 'ไม่ระบุลูกค้า'}
            </p>
            <p className="text-[11px] leading-relaxed text-violet-700/75 mt-1">
              {hasProblemFlow
                ? 'Review the problem, reason, and operation details before signing.'
                : 'Review all operation details before approving this report.'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <InfoRow icon={Hash} label="Job No." value={docData?.job_no} />
        <InfoRow icon={Calendar} label="Issued Date" value={fmt(docData?.issued_date)} />
        <InfoRow icon={Clock} label="Start Time" value={docData?.start_time} />
        <InfoRow icon={Clock} label="Finish Time" value={docData?.finish_time} />
        <InfoRow icon={MapPin} label="Place" value={docData?.place} />
        <InfoRow icon={Briefcase} label="Project" value={docData?.project} />
      </div>

      <div className="px-5 pb-4 space-y-3">
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Service Type</p>
          <div className="flex flex-wrap gap-1.5">
            {(serviceTypes.length ? serviceTypes : [{ label: 'ไม่ระบุประเภทงาน', active: false }]).map((item, i) => (
              <span key={i} className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                item.active
                  ? 'bg-violet-100 text-violet-700 border border-violet-200'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {item.label}
              </span>
            ))}
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
              docData?.expense === 'HAVE'
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              Expense: {docData?.expense || '—'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operation Person</p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {people.length ? people.join(', ') : 'Not specified'}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reported Problem</p>
          <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 whitespace-pre-wrap">
            {docData?.problem || 'No problem details'}
          </p>
        </div>
      </div>
    </div>
  );
};

const operationPreviewDoc = (docData = {}) => {
  const serviceType = typeof docData.service_type === 'object' ? docData.service_type : {};
  return {
    jobNo: docData.job_no,
    issuedDate: docData.issued_date,
    isWarranty: !!serviceType.warranty,
    isUrgent: !!serviceType.urgent,
    isAfterService: !!serviceType.after_service,
    isOther: !!serviceType.other,
    expense: docData.expense,
    customerName: docData.customer_name,
    contactName: docData.contact_name,
    place: docData.place,
    project: docData.project,
    startTime: docData.start_time,
    finishTime: docData.finish_time,
    operationPerson: docData.operation_person,
    problem: docData.problem,
    receivedInfoFrom: docData.received_info_from,
    receivedInfoDate: docData.received_info_date,
    receivedInfoTime: docData.received_info_time,
    reason: docData.reason,
    solution: docData.solution,
    comment: docData.comment,
  };
};

const PrintPreviewSheet = ({ isOpen, onClose, docType, docData, meta }) => {
  if (!isOpen) return null;

  const c = COLOR[meta?.color ?? 'blue'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-slate-100 rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '94vh', animation: 'sheetUp .32s cubic-bezier(.32,.72,0,1) both' }}
      >
        <div className="flex-shrink-0 pt-3 flex flex-col items-center bg-white rounded-t-3xl border-b border-slate-100">
          <div className="w-10 h-1 bg-slate-200 rounded-full mb-3" />
          <div className="w-full px-5 pb-3.5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${c.bg} ${c.text} rounded-xl`}>
                <ScrollText size={18} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>{meta?.label}</p>
                <h3 className="text-base font-bold text-slate-800 leading-snug">Preview Before Approval</h3>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0">
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="w-full py-5 flex justify-center">
            {docType === 'operation' && (
              <div className="origin-top scale-[0.46] sm:scale-[0.62] md:scale-[0.78]"
                style={{ marginBottom: 'calc((0.46 - 1) * 297mm)' }}>
                <OperationReportDocumentView doc={operationPreviewDoc(docData)} />
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
          <button onClick={onClose}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm
                       flex items-center justify-center gap-2 hover:bg-black transition-colors">
            <CheckCircle size={16} /> Preview checked — Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DocDetail — renders per docType (real fields from actual forms)
// ─────────────────────────────────────────────────────────────────────────────

const DocDetail = ({ docType, docData: d }) => {
  if (!d) return <p className="text-sm text-slate-400 text-center py-8">ไม่มีข้อมูล</p>;

  // ══════════════════════════════════════════════════════════════════════
  // RECEIPT — doc_substitute_receipts
  // fields: doc_no, payer_name, position, items[], total_amount,
  //         total_text, payment_method, payment_date
  // ══════════════════════════════════════════════════════════════════════
  if (docType === 'receipt') {
    return (
      <div className="space-y-4">
        {/* ── ยอดเงิน HERO ── */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">ยอดที่ขออนุมัติ</p>
            <p className="text-2xl font-black text-emerald-700 tabular-nums">{fmtMoney(d.total_amount) ?? '—'}</p>
            {d.total_text && <p className="text-[11px] text-emerald-600 mt-0.5">({d.total_text})</p>}
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Banknote size={24} className="text-emerald-600" />
          </div>
        </div>

        {/* ── ข้อมูลผู้เบิก + ร้านค้า ── */}
        <Sec title="ข้อมูลผู้เบิก" icon={User}>
          <KV label="ชื่อผู้เบิก"    value={d.payer_name} />
          <KV label="ตำแหน่ง"        value={d.position} />
          <KV label="เลขที่เอกสาร"   value={d.doc_no} />
          {d.shop_name && <KV label="ร้านค้า / แพลตฟอร์ม" value={d.shop_name} highlight />}
        </Sec>

        {/* ── รายการ (เปิดตลอด ไม่ต้อง expand) ── */}
        <Sec title={`รายการค่าใช้จ่าย · ${d.items?.length ?? 0} รายการ`} icon={ClipboardList}>
          {d.items?.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-snug">{item.detail}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.date && <span className="text-[10px] text-slate-400">{fmt(item.date)}</span>}
                  {item.project_no && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="text-blue-400 font-normal">Project No.</span>
                      #{item.project_no}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 tabular-nums flex-shrink-0">
                {fmtMoney(item.amount) ?? '—'}
              </span>
            </div>
          ))}
        </Sec>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // VOUCHER — doc_receipt_vouchers
  // fields: created_at, receiver_name, id_card_number, address,
  //         payment_method, total_amount, total_text,
  //         items[] { name, quantity, unit, price, total }
  // ══════════════════════════════════════════════════════════════════════
  if (docType === 'voucher') {
    const payLabel = d.payment_method === 'cash' ? 'เงินสด' : d.payment_method === 'transfer' ? 'โอนเงิน' : d.payment_method;
    return (
      <div className="space-y-4 p-4">

        {/* ── ยอดเงิน HERO ── */}
        <div className="bg-pink-50 border border-pink-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-0.5">ยอดที่ขออนุมัติ</p>
            <p className="text-2xl font-black text-pink-700 tabular-nums">{fmtMoney(d.total_amount) ?? '—'}</p>
            {d.total_text && <p className="text-[11px] text-pink-500 mt-0.5">({d.total_text})</p>}
          </div>
          <div className="text-right">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-1 ml-auto">
              <Banknote size={24} className="text-pink-500" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              d.payment_method === 'cash'
                ? 'bg-green-100 text-green-600'
                : 'bg-blue-100 text-blue-600'
            }`}>{payLabel}</span>
          </div>
        </div>

        {/* ── ข้อมูลผู้รับเงิน ── */}
        <Sec title="ข้อมูลผู้รับเงิน" icon={User}>
          <KV label="ชื่อผู้รับเงิน"   value={d.receiver_name} />
          <KV label="เลขบัตรประชาชน"  value={d.id_card_number} mono />
          <KV label="ที่อยู่"           value={d.address} />
          <KV label="วันที่เอกสาร"     value={fmt(d.created_at)} />
        </Sec>

        {/* ── รายการค่าใช้จ่าย ── */}
        <Sec title={`รายการ · ${d.items?.length ?? 0} รายการ`} icon={ClipboardList}>
          <div className="grid px-4 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase"
            style={{ gridTemplateColumns: '1fr 44px 48px 84px' }}>
            <span>รายการ</span>
            <span className="text-center">จำนวน</span>
            <span className="text-center">หน่วย</span>
            <span className="text-right">รวมเงิน</span>
          </div>
          {d.items?.map((item, i) => (
            <div key={i} className="grid items-center px-4 py-2.5 border-b border-slate-100 last:border-0 gap-2"
              style={{ gridTemplateColumns: '1fr 44px 48px 84px' }}>
              <p className="text-xs font-semibold text-slate-800 leading-snug">{item.name}</p>
              <p className="text-xs text-slate-600 text-center tabular-nums">{item.quantity}</p>
              <p className="text-xs text-slate-500 text-center">{item.unit}</p>
              <p className="text-xs font-bold text-slate-800 text-right tabular-nums">
                {fmtMoney(item.total ?? (item.quantity * item.price)) ?? '—'}
              </p>
            </div>
          ))}
          <div className="flex justify-between items-center px-4 py-3.5 bg-pink-50 border-t border-pink-100">
            <div>
              <span className="text-xs font-bold text-pink-700">รวมทั้งสิ้น</span>
              {d.total_text && <p className="text-[10px] text-pink-500 mt-0.5">({d.total_text})</p>}
            </div>
            <span className="text-base font-black text-pink-700 tabular-nums">
              {fmtMoney(d.total_amount) ?? '—'}
            </span>
          </div>
        </Sec>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // ORDER — doc_contractor_orders
  // fields: created_at, doc_no, contractor_name, id_card, supervisor_name,
  //         wage_type, wage_rate, has_ot, start_date, end_date,
  //         daily_items[] { date, start_time, end_time, ot_start, ot_end, detail }
  //         has_accom, accom_rate, accom_unit,
  //         has_travel, travel_rate, travel_unit, deduct_tax
  // ══════════════════════════════════════════════════════════════════════
  if (docType === 'order') {
    const wageLabel = d.wage_type === 'daily' ? 'รายวัน' : 'เหมาโปรเจ็ค';
    const totalDays = d.daily_items?.length ?? 0;

    // คำนวณค่าจ้างรวม (ถ้ามี)
    let totalWage = null;
    if (d.wage_type === 'daily' && d.wage_rate && totalDays) {
      totalWage = parseFloat(d.wage_rate) * totalDays;
      if (d.has_accom && d.accom_rate) totalWage += parseFloat(d.accom_rate) * (d.accom_unit === 'day' ? totalDays : 1);
      if (d.has_travel && d.travel_rate) totalWage += parseFloat(d.travel_rate) * (d.travel_unit === 'day' ? totalDays : 1);
    } else if (d.wage_type === 'project' && d.wage_rate) {
      totalWage = parseFloat(d.wage_rate);
    }

    return (
      <div className="space-y-4">
        <Sec title="ข้อมูลผู้รับเหมา" icon={User}>
          <KV label="ชื่อผู้รับเหมา"    value={d.contractor_name} />
          <KV label="เลขบัตรประชาชน"    value={d.id_card} mono />
          <KV label="ผู้รับผิดชอบดูแล"  value={d.supervisor_name} />
          <KV label="เลขที่เอกสาร"      value={d.doc_no} />
          <KV label="วันที่เอกสาร"      value={fmt(d.created_at)} />
        </Sec>

        <Sec title="ค่าจ้างและการทำงาน" icon={Briefcase}>
          <KV label="ประเภทค่าจ้าง"  value={wageLabel} />
          <KV label="อัตราค่าจ้าง"   value={fmtMoney(d.wage_rate) + (d.wage_type === 'daily' ? ' / วัน' : ' / งาน')} highlight />
          <KV label="โอที"           value={d.has_ot ? '✅ มีโอที' : '—'} />
          <KV label="ตั้งแต่วันที่"   value={fmt(d.start_date)} />
          <KV label="ถึงวันที่"       value={fmt(d.end_date)} />
          {totalWage && <KV label="ค่าจ้างรวม (ประเมิน)" value={fmtMoney(totalWage)} highlight />}
        </Sec>

        {/* ตารางลงเวลา */}
        {d.daily_items?.length > 0 && (
          <Sec title={`ตารางลงเวลา · ${totalDays} วัน`} icon={Clock}>
            {/* header */}
            <div className="grid px-4 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase"
              style={{ gridTemplateColumns: '90px 1fr 1fr' }}>
              <span>วันที่</span>
              <span className="text-center">เวลาทำงาน</span>
              <span className="text-center">โอที</span>
            </div>
            {d.daily_items.map((row, i) => (
              <div key={i} className="border-b border-slate-100 last:border-0">
                <div className="grid items-center px-4 py-2.5 gap-2"
                  style={{ gridTemplateColumns: '90px 1fr 1fr' }}>
                  <p className="text-xs font-semibold text-slate-800">{fmt(row.date)}</p>
                  <p className="text-xs text-slate-600 text-center">
                    {row.start_time && row.end_time ? `${row.start_time} – ${row.end_time}` : '—'}
                  </p>
                  <p className="text-xs text-slate-500 text-center">
                    {row.ot_start && row.ot_end ? `${row.ot_start} – ${row.ot_end}` : '—'}
                  </p>
                </div>
                {row.detail && (
                  <p className="text-[11px] text-slate-500 px-4 pb-2 -mt-1">{row.detail}</p>
                )}
              </div>
            ))}
          </Sec>
        )}

        {/* ค่าใช้จ่ายเพิ่มเติม */}
        {(d.has_accom || d.has_travel || d.deduct_tax) && (
          <Sec title="ค่าใช้จ่ายและข้อกำหนด" icon={Wallet}>
            {d.has_accom  && <KV label="ค่าที่พัก"  value={`${fmtMoney(d.accom_rate)} / ${d.accom_unit === 'day' ? 'วัน' : 'งาน'}`} />}
            {d.has_travel && <KV label="ค่าเดินทาง" value={`${fmtMoney(d.travel_rate)} / ${d.travel_unit === 'day' ? 'วัน' : 'งาน'}`} />}
            {d.deduct_tax && <KV label="ภาษี ณ ที่จ่าย" value="หัก 3%" />}
          </Sec>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // OPERATION — doc_operation_reports
  // fields: job_no, issued_date, service_type{warranty,urgent,after_service,other},
  //         expense, customer_name, contact_name, place, project,
  //         start_time, finish_time, operation_person,
  //         problem, received_info_from, received_info_date, received_info_time,
  //         reason, solution, comment
  // ══════════════════════════════════════════════════════════════════════
  if (docType === 'operation') {
    const serviceTypes = serviceTypeItems(d);
    const hasAnyService = serviceTypes.some(s => s.active);

    return (
      <div className="space-y-4">
        <Sec title="ข้อมูลเอกสาร" icon={FileText}>
          <KV label="Job No."      value={d.job_no} mono />
          <KV label="วันที่ออก"   value={fmt(d.issued_date)} />
        </Sec>

        <Sec title="Service Type & Expense" icon={Tag}>
          <BadgeRow items={serviceTypes} />
          <KV label="Expense" value={d.expense === 'HAVE' ? 'HAVE' : 'NO HAVE'} />
        </Sec>

        <Sec title="Information" icon={Users}>
          <KV label="Customer Name" value={d.customer_name} />
          <KV label="Place"         value={d.place} />
          <KV label="Contact Name"  value={d.contact_name} />
          <KV label="Project"       value={d.project} />
        </Sec>

        <Sec title="Time & Operation Person" icon={Clock}>
          <KV label="Start Time"  value={d.start_time} />
          <KV label="Finish Time" value={d.finish_time} />
          {d.operation_person && (
            <KV label="Operation Person"
              value={d.operation_person.split(',').filter(Boolean).join(', ')} />
          )}
        </Sec>

        {(d.received_info_from || d.received_info_date) && (
          <Sec title="Received Info From" icon={Phone}>
            <KV label="Name" value={d.received_info_from} />
            <KV label="Date" value={fmt(d.received_info_date)} />
            <KV label="Time" value={d.received_info_time} />
          </Sec>
        )}

        {d.problem && (
          <Sec title="Problem" icon={AlertTriangle}>
            <p className="text-xs text-slate-700 px-4 py-3 leading-relaxed">{d.problem}</p>
          </Sec>
        )}
        {d.reason && (
          <Sec title="Reason" icon={AlertCircle}>
            <p className="text-xs text-slate-700 px-4 py-3 leading-relaxed">{d.reason}</p>
          </Sec>
        )}
        {d.solution && (
          <Sec title="Detail of Operation or Solution" icon={CheckCircle}>
            <p className="text-xs text-slate-700 px-4 py-3 leading-relaxed">{d.solution}</p>
          </Sec>
        )}
        {d.comment && (
          <Sec title="Comment / หมายเหตุ" icon={FileText}>
            <p className="text-xs text-slate-700 px-4 py-3 leading-relaxed">{d.comment}</p>
          </Sec>
        )}

        <Sec title="Approval Checklist" icon={CheckCircle}>
          <div className="px-4 py-3 space-y-1.5 text-xs text-slate-700 leading-relaxed">
            <p>• Check Job No., issued date, customer, place, and project.</p>
            <p>• Confirm service type and expense status.</p>
            <p>• Review problem, reason, and operation details before signing.</p>
          </div>
        </Sec>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // COMPLETION — doc_completion_reports
  // fields: date, project_name, project_no, location, finish_time,
  //         is_complete, remark
  // ══════════════════════════════════════════════════════════════════════
  if (docType === 'completion') {
    const status = completionStatus(!!d.is_complete);
    const StatusIcon = status.icon;
    const isDone = status.tone === 'emerald';

    return (
      <div className="space-y-4">
        <div className={`rounded-2xl border px-5 py-4 ${
          isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              <StatusIcon size={22} />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${
                isDone ? 'text-emerald-600' : 'text-red-600'
              }`}>
                สถานะโครงการ
              </p>
              <p className={`text-lg font-black mt-0.5 ${isDone ? 'text-emerald-700' : 'text-red-700'}`}>
                {status.label}
              </p>
              <p className={`text-xs leading-relaxed mt-1 ${isDone ? 'text-emerald-700/75' : 'text-red-700/75'}`}>
                {status.note}
              </p>
            </div>
          </div>
        </div>

        <Sec title="ข้อมูลตามฟอร์ม Completion Report" icon={Briefcase}>
          <KV label="สถานที่โครงการ" value={d.location} />
          <KV label="วันที่รายงาน"    value={fmt(d.date)} />
          <KV label="ชื่อโครงการ"     value={d.project_name} />
          <KV label="รหัสโครงการ"     value={d.project_no} mono />
          <KV label="เวลาเสร็จสิ้น"   value={d.finish_time} />
        </Sec>

        <Sec title="หมายเหตุสำหรับผู้อนุมัติ" icon={FileText}>
          <p className="text-xs text-slate-700 px-4 py-3 leading-relaxed whitespace-pre-wrap">
            {d.remark || 'ไม่มีหมายเหตุเพิ่มเติม'}
          </p>
        </Sec>

        <Sec title="ข้อความรายงานบนเอกสาร" icon={ClipboardList}>
          <div className="px-4 py-3 space-y-2 text-xs text-slate-700 leading-relaxed">
            <p>
              ตามที่ได้ตรวจสอบอย่างถูกต้องและทำการทดสอบภายในเกี่ยวกับโครงการตามรายละเอียดข้างล่าง
              ทางบริษัทฯ จึงขอรายงานเมื่อโครงการเสร็จสิ้น
            </p>
            <p className="text-[11px] text-slate-400">
              ผู้อนุมัติควรตรวจสอบสถานที่ วันที่ ชื่อโครงการ รหัสโครงการ เวลาเสร็จสิ้น และหมายเหตุก่อนลงนาม
            </p>
          </div>
        </Sec>
      </div>
    );
  }

  return <p className="text-sm text-slate-400 text-center py-8">ไม่มีข้อมูลเพิ่มเติม</p>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Inline Expandable (short docs: receipt, voucher)
// ─────────────────────────────────────────────────────────────────────────────

const InlineDetail = ({ docType, docData }) => {
  // Receipt + Voucher: แสดงตลอด ไม่ต้อง expand
  if (docType === 'receipt' || docType === 'voucher') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden anim-up-2">
        <div className="border-t border-slate-50">
          <DocDetail docType={docType} docData={docData} />
        </div>
      </div>
    );
  }

  // Other short docs: collapsible
  const [open, setOpen] = useState(false);
  const itemCount = docData?.items?.length ?? 0;
  if (!itemCount) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden anim-up-2">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">รายการที่ขออนุมัติ</span>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
            {itemCount} รายการ
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!open && docData?.total_amount != null && (
            <span className="text-sm font-black text-emerald-600 tabular-nums">
              {fmtMoney(docData.total_amount)}
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>
      {open && <div className="border-t border-slate-50"><DocDetail docType={docType} docData={docData} /></div>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Bottom Sheet (long docs: order, operation, completion)
// ─────────────────────────────────────────────────────────────────────────────

const BottomSheet = ({ isOpen, onClose, docType, docData, meta }) => {
  const c = COLOR[meta?.color ?? 'blue'];
  const DocIcon = meta?.icon ?? FileText;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh', animation: 'sheetUp .32s cubic-bezier(.32,.72,0,1) both' }}
      >
        {/* Handle + header */}
        <div className="flex-shrink-0 pt-3 flex flex-col items-center">
          <div className="w-10 h-1 bg-slate-200 rounded-full mb-3" />
          <div className="w-full px-5 pb-3.5 flex items-start justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${c.bg} ${c.text} rounded-xl`}>
                <DocIcon size={18} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>{meta?.label}</p>
                <h3 className="text-base font-bold text-slate-800 leading-snug">
                  {docData?.display_title ?? docData?.doc_no ?? docData?.job_no ?? docData?.project_name ?? 'รายละเอียดเอกสาร'}
                </h3>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
          <DocDetail docType={docType} docData={docData} />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-slate-100 bg-white/95 backdrop-blur-sm">
          <button onClick={onClose}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm
                       flex items-center justify-center gap-2 hover:bg-black transition-colors">
            <CheckCircle size={16} /> ตรวจสอบแล้ว — ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main: ApprovalPage
// ─────────────────────────────────────────────────────────────────────────────

const ApprovalPage = () => {
  const { docType, docId } = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const sigCanvas = useRef(null);

  const [step,         setStep]         = useState('review');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sigEmpty,     setSigEmpty]     = useState(true);
  const [sheetOpen,    setSheetOpen]    = useState(false);
  const [previewOpen,  setPreviewOpen]  = useState(false);

  const docData     = location.state;
  const meta        = DOC_META[docType] ?? { label: docType, icon: FileText, color: 'blue', long: false };
  const c           = COLOR[meta.color];
  const DocIcon     = meta.icon;
  const totalAmount = docData?.total_amount
    ?? docData?.items?.reduce((s, i) => s + (parseFloat(i.amount || (i.quantity * i.price) || 0)), 0);

  const handleApprove = async () => {
    if (sigCanvas.current?.isEmpty()) { toast.error('กรุณาลงลายมือชื่อก่อนอนุมัติ'); return; }
    setIsSubmitting(true);
    try {
      const sig = sigCanvas.current.getCanvas().toDataURL('image/png');
      const approvalPayload = docType === 'operation'
        ? { status: 'approved' }
        : { status: 'approved', approver_signature: sig };

      const { error } = await supabase
        .from(TABLE_MAP[docType] ?? 'doc_operation_reports')
        .update(approvalPayload)
        .eq('id', docId);
      if (error) throw error;
      toast.success(docType === 'operation'
        ? 'Approved successfully. Signature is not stored for Operation Report yet.'
        : 'อนุมัติเอกสารเรียบร้อยแล้ว 🎉');
      navigate('/history');
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Title to show in summary card — fallback chain per docType
  const docTitle = docData?.display_title
    ?? docData?.project_name
    ?? docData?.job_no
    ?? docData?.contractor_name
    ?? docData?.payer_name
    ?? docData?.receiver_name
    ?? docData?.doc_no
    ?? '—';

  return (
    <div className="min-h-screen bg-slate-50 pb-16" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes sheetUp {
          from { transform:translateY(100%); }
          to   { transform:translateY(0); }
        }
        .anim-up   { animation: fadeSlideUp .3s .00s ease both; }
        .anim-up-2 { animation: fadeSlideUp .3s .06s ease both; }
        .anim-up-3 { animation: fadeSlideUp .3s .12s ease both; }
        .anim-up-4 { animation: fadeSlideUp .3s .18s ease both; }
      `}</style>

      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        docType={docType}
        docData={docData}
        meta={meta}
      />
      <PrintPreviewSheet
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        docType={docType}
        docData={docData}
        meta={meta}
      />

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => step === 'sign' ? setStep('review') : navigate(-1)}
            className="p-2 -ml-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${c.text}`}>{meta.label}</p>
            <h1 className="text-sm font-bold text-slate-800">
              {step === 'review' ? 'ตรวจสอบเอกสาร' : 'ลงนามอนุมัติ'}
            </h1>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-600 flex-shrink-0">
            รออนุมัติ
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-3">
        <StepBar step={step} />

        {/* ══════════════════════
             STEP 1 — REVIEW
        ══════════════════════ */}
        {step === 'review' && (
          <>
            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden anim-up">
              <div className={`h-1 bg-gradient-to-r ${c.grad}`} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2.5 ${c.bg} ${c.text} rounded-xl flex-shrink-0`}>
                    <DocIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${c.text}`}>{meta.label}</p>
                    <h2 className="text-base font-bold text-slate-800 leading-snug">{docTitle}</h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 pt-4 border-t border-slate-50">
                  {/* Per-type key info */}
                  {docType === 'receipt' && <>
                    <InfoRow icon={User}     label="ผู้เบิก"         value={docData?.payer_name} />
                    <InfoRow icon={Hash}     label="เลขที่เอกสาร"   value={docData?.doc_no} />
                    <InfoRow icon={Calendar} label="วันที่"           value={fmt(docData?.created_at)} />
                    {docData?.shop_name && <InfoRow icon={Tag} label="ร้านค้า" value={docData.shop_name} />}
                  </>}
                  {docType === 'voucher' && <>
                    <InfoRow icon={User}     label="ผู้รับเงิน"      value={docData?.receiver_name} />
                    <InfoRow icon={Calendar} label="วันที่"          value={fmt(docData?.created_at)} />
                    <InfoRow icon={Banknote} label="ยอดรวม"         value={fmtMoney(totalAmount)} highlight />
                    <InfoRow icon={Wallet}   label="วิธีชำระ"        value={docData?.payment_method === 'cash' ? 'เงินสด' : 'โอนเงิน'} />
                  </>}
                  {docType === 'order' && <>
                    <InfoRow icon={User}     label="ผู้รับเหมา"      value={docData?.contractor_name} />
                    <InfoRow icon={User}     label="ผู้ดูแล"         value={docData?.supervisor_name} />
                    <InfoRow icon={Calendar} label="ช่วงเวลา"       value={`${fmt(docData?.start_date)} – ${fmt(docData?.end_date)}`} />
                    <InfoRow icon={Banknote} label="อัตราค่าจ้าง"   value={fmtMoney(docData?.wage_rate)} highlight />
                  </>}
                  {docType === 'operation' && <>
                    <InfoRow icon={Hash}     label="Job No."         value={docData?.job_no} />
                    <InfoRow icon={User}     label="Customer"        value={docData?.customer_name} />
                    <InfoRow icon={MapPin}   label="Place"           value={docData?.place} />
                    <InfoRow icon={Calendar} label="Issued Date"     value={fmt(docData?.issued_date)} />
                    <InfoRow icon={Clock}    label="Work Time"       value={`${docData?.start_time || '—'} – ${docData?.finish_time || '—'}`} />
                    <InfoRow icon={Wallet}   label="Expense"         value={docData?.expense} highlight={docData?.expense === 'HAVE'} />
                  </>}
                  {docType === 'completion' && <>
                    <InfoRow icon={Briefcase} label="โครงการ"        value={docData?.project_name} />
                    <InfoRow icon={Hash}      label="รหัสโครงการ"    value={docData?.project_no} />
                    <InfoRow icon={MapPin}    label="สถานที่"        value={docData?.location} />
                    <InfoRow icon={Calendar}  label="วันที่"         value={fmt(docData?.date)} />
                    <InfoRow icon={Clock}     label="เวลาเสร็จสิ้น"  value={docData?.finish_time} />
                    <InfoRow
                      icon={docData?.is_complete ? CheckSquare : XSquare}
                      label="ผลดำเนินงาน"
                      value={completionStatus(!!docData?.is_complete).shortLabel}
                      highlight={!!docData?.is_complete}
                    />
                  </>}
                </div>
              </div>
            </div>

            {docType === 'operation' && <OperationApprovalBrief docData={docData} />}
            {docType === 'completion' && <CompletionApprovalBrief docData={docData} />}

            {/* Content: inline (short) */}
            {!meta.long && <InlineDetail docType={docType} docData={docData} />}

            {docType === 'operation' && (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="anim-up-2 w-full flex items-center justify-between bg-white rounded-2xl
                           border border-violet-100 shadow-sm px-5 py-4 hover:bg-violet-50/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                    <ScrollText size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Preview Operation Report</p>
                    <p className="text-xs text-slate-400 mt-0.5">Review the printable document before signing</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
              </button>
            )}

            {/* Content: Bottom Sheet button (long) */}
            {meta.long && (
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="anim-up-2 w-full flex items-center justify-between bg-white rounded-2xl
                           border border-slate-100 shadow-sm px-5 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${c.bg} ${c.text} rounded-xl`}>
                    <Eye size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">ดูรายละเอียดเอกสาร</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {docType === 'order'      && `ตารางลงเวลา ${docData?.daily_items?.length ?? 0} วัน · ค่าจ้าง + ค่าใช้จ่าย`}
                      {docType === 'operation'  && `Service type · Information · Problem · Solution`}
                      {docType === 'completion' && `สถานะงาน · เวลาเสร็จสิ้น · หมายเหตุ`}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>
            )}

            {/* Warning */}
            <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 anim-up-3">
              <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                กรุณาตรวจสอบให้ครบถ้วนก่อนดำเนินการ การอนุมัติจะไม่สามารถยกเลิกได้ภายหลัง
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1 anim-up-4">
              <button type="button" onClick={() => navigate(-1)}
                className="flex-1 bg-white border border-slate-200 text-slate-500 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                ยกเลิก
              </button>
              <button type="button" onClick={() => setStep('sign')}
                className={`flex-[2] bg-gradient-to-r ${c.grad} text-white py-3.5 rounded-xl font-bold text-sm
                           flex items-center justify-center gap-2 shadow-lg
                           hover:-translate-y-0.5 transition-all duration-200`}>
                ดำเนินการลงนาม <ChevronRight size={17} />
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════
             STEP 2 — SIGN
        ══════════════════════ */}
        {step === 'sign' && (
          <>
            {/* Mini reminder */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3.5 flex items-center gap-3 anim-up">
              <div className={`p-2 ${c.bg} ${c.text} rounded-xl flex-shrink-0`}>
                <ShieldCheck size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">กำลังอนุมัติ</p>
                <p className="text-sm font-bold text-slate-800 truncate">{docTitle}</p>
              </div>
              {totalAmount != null && (
                <p className="text-sm font-black text-emerald-600 flex-shrink-0 tabular-nums">
                  {fmtMoney(totalAmount)}
                </p>
              )}
            </div>

            {/* Signature Zone */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden anim-up-2">
              <div className="px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-violet-50 rounded-xl text-violet-600 flex-shrink-0">
                    <PenLine size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">ลงนามเพื่ออนุมัติ</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">ลากนิ้วในกรอบด้านล่างเพื่อเซ็นชื่อ</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200
                  ${sigEmpty ? 'border-dashed border-slate-300 bg-slate-50/80'
                    : 'border-solid border-violet-400 bg-white shadow-inner shadow-violet-50'}`}>
                  {sigEmpty && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-1.5">
                      <PenLine size={26} className="text-slate-300" />
                      <p className="text-xs text-slate-300 font-medium">เซ็นชื่อที่นี่</p>
                    </div>
                  )}
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="#1e293b"
                    minWidth={1.5}
                    maxWidth={3}
                    velocityFilterWeight={0.7}
                    onBegin={() => setSigEmpty(false)}
                    canvasProps={{
                      className: 'w-full block touch-none',
                      style: { minHeight: 180, cursor: 'crosshair' }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <span className={`text-xs font-semibold flex items-center gap-1.5 transition-colors
                    ${sigEmpty ? 'text-slate-400' : 'text-violet-600'}`}>
                    <span className={`w-2 h-2 rounded-full inline-block
                      ${sigEmpty ? 'bg-slate-300' : 'bg-violet-500 animate-pulse'}`} />
                    {sigEmpty ? 'ยังไม่ได้ลงนาม' : 'ลงนามแล้ว'}
                  </span>
                  <button type="button"
                    onClick={() => { sigCanvas.current?.clear(); setSigEmpty(true); }}
                    className="text-xs text-red-400 flex items-center gap-1 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors font-medium">
                    <Trash2 size={12} /> ล้างลายเซ็น
                  </button>
                </div>
              </div>
            </div>

            {/* Final warning */}
            <div className="flex gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 anim-up-3">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">
                การกด <strong>"ยืนยันอนุมัติ"</strong> ถือเป็นการอนุมัติอย่างเป็นทางการ และจะไม่สามารถแก้ไขได้อีก
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1 anim-up-4">
              <button type="button" onClick={() => setStep('review')}
                className="flex-1 bg-white border border-slate-200 text-slate-500 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                ← กลับ
              </button>
              <button type="button" onClick={handleApprove}
                disabled={isSubmitting || sigEmpty}
                className="flex-[2] bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-sm
                           flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25
                           hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200
                           disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0">
                {isSubmitting
                  ? <><Loader2 size={17} className="animate-spin" /> กำลังบันทึก...</>
                  : <><CheckCircle size={17} /> ยืนยันอนุมัติ</>
                }
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ApprovalPage;
