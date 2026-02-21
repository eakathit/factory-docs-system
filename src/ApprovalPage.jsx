import React, { useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';
import {
  CheckCircle, Trash2, ChevronLeft, FileText, User,
  Hash, Calendar, Banknote, ChevronRight, AlertCircle,
  PenLine, Loader2, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── helpers ──────────────────────────────────────────────────────────────────

const getTableByType = (type) => ({
  order:      'doc_contractor_orders',
  receipt:    'doc_substitute_receipts',
  voucher:    'doc_receipt_vouchers',
  operation:  'doc_operation_reports',
  completion: 'doc_completion_reports',
}[type] ?? 'doc_operation_reports');

const DOC_LABEL = {
  order:      'ใบสั่งจ้างผู้รับเหมา',
  receipt:    'ใบรับรองแทนใบเสร็จ',
  voucher:    'ใบสำคัญรับเงิน',
  operation:  'Operation Report',
  completion: 'Completion Report',
};

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
  : '—';

// ── sub-components ────────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-start gap-3">
    <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${highlight ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
      <Icon size={14} />
    </div>
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-emerald-600 text-base' : 'text-slate-700'}`}>{value ?? '—'}</p>
    </div>
  </div>
);

// Step indicator at top
const StepBar = ({ step }) => (
  <div className="flex items-center gap-2 mb-6">
    {['review', 'sign'].map((s, i) => {
      const active = step === s;
      const done   = (s === 'review' && step === 'sign');
      return (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300
            ${done   ? 'bg-emerald-100 text-emerald-600' :
              active ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' :
                       'bg-slate-100 text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black
              ${done ? 'bg-emerald-500 text-white' : active ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {done ? '✓' : i + 1}
            </span>
            {s === 'review' ? 'ตรวจสอบ' : 'ลงนาม'}
          </div>
          {i === 0 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step === 'sign' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const ApprovalPage = () => {
  const { docType, docId } = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const sigCanvas = useRef(null);

  const [step,        setStep]        = useState('review'); // 'review' | 'sign'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sigEmpty,    setSigEmpty]    = useState(true);     // track ว่าเซ็นแล้วหรือยัง

  const docData = location.state; // ข้อมูลจาก History

  // ── Approve handler ──
  const handleApprove = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error('กรุณาลงลายมือชื่อก่อนอนุมัติ');
      return;
    }
    setIsSubmitting(true);
    try {
      const signatureImage = sigCanvas.current.getCanvas().toDataURL('image/png');
      const { error } = await supabase
        .from(getTableByType(docType))
        .update({ status: 'approved', approver_signature: signatureImage })
        .eq('id', docId);
      if (error) throw error;
      toast.success('อนุมัติเอกสารเรียบร้อยแล้ว 🎉');
      navigate('/history');
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Derived ──
  const hasItems    = Array.isArray(docData?.items) && docData.items.length > 0;
  const totalAmount = docData?.total_amount ?? docData?.items?.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  return (
    <div
      className="min-h-screen bg-slate-50 pb-16"
      style={{ fontFamily: "'Prompt', sans-serif" }}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-up { animation: fadeSlideUp .35s ease both; }
        .anim-up-2 { animation: fadeSlideUp .35s .08s ease both; }
        .anim-up-3 { animation: fadeSlideUp .35s .16s ease both; }
        .anim-up-4 { animation: fadeSlideUp .35s .24s ease both; }
        .sig-canvas { touch-action: none; cursor: crosshair; }
      `}</style>

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => (step === 'sign' ? setStep('review') : navigate(-1))}
            className="p-2 -ml-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {DOC_LABEL[docType] ?? docType}
            </p>
            <h1 className="text-sm font-bold text-slate-800 truncate">
              {step === 'review' ? 'ตรวจสอบเอกสาร' : 'ลงนามอนุมัติ'}
            </h1>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-600 flex-shrink-0">
            รออนุมัติ
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* ── Step Bar ── */}
        <StepBar step={step} />

        {/* ════════════════════════════════════
             STEP 1 — REVIEW
        ════════════════════════════════════ */}
        {step === 'review' && (
          <>
            {/* Document Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden anim-up">
              {/* Colored top strip */}
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                    <FileText size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      {DOC_LABEL[docType] ?? docType}
                    </p>
                    <h2 className="text-base font-bold text-slate-800 leading-snug">
                      {docData?.display_title ?? docData?.doc_no ?? 'ไม่มีหัวข้อ'}
                    </h2>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t border-slate-50">
                  <InfoRow icon={User}     label="ผู้ยื่นเอกสาร" value={docData?.payer_name} />
                  <InfoRow icon={Hash}     label="เลขที่เอกสาร"  value={docData?.doc_no} />
                  <InfoRow icon={Calendar} label="วันที่สร้าง"    value={fmt(docData?.created_at)} />
                  {totalAmount != null && (
                    <InfoRow
                      icon={Banknote}
                      label="ยอดรวมทั้งสิ้น"
                      value={`฿ ${Number(totalAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
                      highlight
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Items List */}
            {hasItems && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden anim-up-2">
                <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50/70 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    รายการที่ขออนุมัติ
                  </span>
                  <span className="ml-auto text-[11px] font-bold bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">
                    {docData.items.length} รายการ
                  </span>
                </div>

                <div className="divide-y divide-slate-50">
                  {docData.items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 px-5 py-3.5">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 leading-snug truncate">{item.detail}</p>
                          {item.date && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{fmt(item.date)}</p>
                          )}
                          {item.project_no && (
                            <span className="inline-block mt-1 text-[10px] font-bold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">
                              #{item.project_no}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-800 flex-shrink-0 tabular-nums">
                        ฿{parseFloat(item.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total footer */}
                <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 text-white">
                  <span className="text-sm font-bold">รวมทั้งสิ้น</span>
                  <span className="text-lg font-black tabular-nums">
                    ฿{Number(totalAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Warning note */}
            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 anim-up-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                กรุณาตรวจสอบรายละเอียดเอกสารให้ครบถ้วนก่อนดำเนินการลงนาม
                การอนุมัติจะไม่สามารถยกเลิกได้ภายหลัง
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1 anim-up-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-white border border-slate-200 text-slate-500 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => setStep('sign')}
                className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm
                           flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25
                           hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                ดำเนินการลงนาม
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* ════════════════════════════════════
             STEP 2 — SIGN
        ════════════════════════════════════ */}
        {step === 'sign' && (
          <>
            {/* Mini doc summary (reminder) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3 anim-up">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">กำลังอนุมัติ</p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {docData?.display_title ?? docData?.doc_no ?? '—'}
                </p>
              </div>
              {totalAmount != null && (
                <p className="text-sm font-black text-emerald-600 flex-shrink-0 tabular-nums">
                  ฿{Number(totalAmount).toLocaleString('th-TH')}
                </p>
              )}
            </div>

            {/* Signature Zone */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden anim-up-2">
              <div className="px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
                    <PenLine size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">ลงนามเพื่ออนุมัติเอกสาร</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ลากนิ้วหรือเมาส์เพื่อเซ็นชื่อในกรอบด้านล่าง
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Canvas wrapper */}
                <div className={`relative rounded-xl overflow-hidden border-2 transition-colors duration-200
                  ${sigEmpty ? 'border-dashed border-slate-300 bg-slate-50/80' : 'border-solid border-violet-400 bg-white shadow-inner'}`}>
                  
                  {/* Placeholder text when empty */}
                  {sigEmpty && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-2">
                      <PenLine size={28} className="text-slate-300" />
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
                      className: 'sig-canvas w-full block',
                      style: { minHeight: 180 }
                    }}
                  />
                </div>

                {/* Status + clear */}
                <div className="flex items-center justify-between mt-3">
                  {sigEmpty ? (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                      ยังไม่ได้ลงนาม
                    </p>
                  ) : (
                    <p className="text-xs text-violet-600 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500 inline-block animate-pulse" />
                      ลงนามแล้ว
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => { sigCanvas.current?.clear(); setSigEmpty(true); }}
                    className="text-xs text-red-400 flex items-center gap-1.5
                               hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 size={13} /> ล้างลายเซ็น
                  </button>
                </div>
              </div>
            </div>

            {/* Final confirm warning */}
            <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 anim-up-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">
                การกด <strong>"ยืนยันอนุมัติ"</strong> ถือเป็นการอนุมัติเอกสารนี้อย่างเป็นทางการ
                และจะไม่สามารถแก้ไขได้อีก
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1 anim-up-4">
              <button
                type="button"
                onClick={() => setStep('review')}
                className="flex-1 bg-white border border-slate-200 text-slate-500 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                ← กลับ
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting || sigEmpty}
                className="flex-[2] bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-sm
                           flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25
                           hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200
                           disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</>
                ) : (
                  <><CheckCircle size={18} /> ยืนยันอนุมัติ</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApprovalPage;