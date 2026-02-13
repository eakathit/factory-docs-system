import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { Printer, ArrowLeft } from "lucide-react";
import html2pdf from 'html2pdf.js';

// Component ย่อยสำหรับ Checkbox
const CheckBox = ({ checked, label }) => (
  <div className="flex items-center gap-2 mr-4">
    <div className="w-4 h-4 border border-black flex items-center justify-center text-xs font-bold leading-none bg-white">
      {checked ? "✓" : ""}
    </div>
    <span className="whitespace-nowrap pt-0.5">{label}</span>
  </div>
);

const handleDownloadPDF = () => {
  // เลือก Element ที่ต้องการเอาไปทำ PDF (ในที่นี้คือส่วนที่มี class print-container)
  const element = document.querySelector('.print-container');
  
  // ตั้งค่า PDF
  const opt = {
    margin:       0,
    filename:     `Order_${order.id}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true }, // scale 2 เพื่อความคมชัด
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // สั่งสร้างและดาวน์โหลด
  html2pdf().set(opt).from(element).save();
};

export default function OrderPrint() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Auto-Print
  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("doc_contractor_orders") // แก้ชื่อตารางตรงนี้ถ้าไม่ตรง
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error.message);
      setErrorMsg("ไม่พบข้อมูลเอกสาร");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "..........................";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
  <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-24 pb-8 print:p-0">
    
    {/* --- ส่วนนี้ย้ายมาไว้นอก loading เพื่อให้เห็นปุ่ม "กลับ" และ "แชร์" ทันที --- */}
    <div className="fixed top-0 left-0 right-0 z-[100] bg-white shadow-md border-b px-4 py-3 no-print">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/history" className="flex items-center gap-2 text-gray-600">
          <ArrowLeft size={20} /> <span className="font-bold">กลับหน้าประวัติ</span>
        </Link>
        
        <div className="flex gap-2">
          {/* ปุ่มแชร์/เปิดบราวเซอร์ */}
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Print Doc', url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('คัดลอกลิงก์แล้ว! กรุณาเปิดใน Chrome');
              }
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-full flex gap-2 items-center"
          >
            แชร์ / เปิดบราวเซอร์
          </button>

          {/* ปุ่มพิมพ์ (จะใช้งานได้เมื่อ order มาครบ) */}
          <button 
            onClick={() => window.print()} 
            disabled={!order}
            className={`px-4 py-2 rounded-full flex gap-2 items-center text-white ${!order ? 'bg-gray-400' : 'bg-blue-600'}`}
          >
            <Printer size={18} /> พิมพ์
          </button>
        </div>
      </div>
    </div>

      {/* --- ส่วนเนื้อหา (Content) --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse text-gray-400">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <div>กำลังโหลดข้อมูลเอกสาร...</div>
        </div>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="font-bold text-lg">{errorMsg}</div>
        </div>
      ) : (
        /* แสดงเอกสารเมื่อโหลดเสร็จ */
        <div className="print:w-auto print:block">
          <div
            className="print-container bg-white shadow-2xl print:shadow-none font-sarabun text-sm leading-normal relative"
            style={{
              width: "210mm",
              minWidth: "210mm",
              minHeight: "297mm",
              padding: "20mm",
              margin: "0 auto",
            }}
          >
            {/* HEADER */}
            <div className="text-center mb-6">
              <h1 className="font-bold text-lg">
                HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.
              </h1>
              <p className="text-xs text-gray-600">
                47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140
              </p>
              <div className="mt-3 border-2 border-black p-2 relative mx-auto w-full">
                <h2 className="text-xl font-bold">
                  ใบสั่งจ้างผู้รับเหมา / Technician supporter record
                </h2>
                <div className="absolute top-2 right-2 text-xs font-normal">
                  วันที่ {formatDate(order.created_at)}
                </div>
              </div>
            </div>

            {/* SECTION 1: ข้อมูล */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <div className="w-[60%]">
                  ผู้รับเหมาชื่อ (นาย/นาง/นางสาว):{" "}
                  <span className="font-bold underline decoration-dotted ml-2 text-lg">
                    {order.contractor_name}
                  </span>
                </div>
                <div className="w-[40%] text-right">
                  เลขบัตรประชาชน:{" "}
                  <span className="font-bold underline decoration-dotted ml-2">
                    {order.id_card_number}
                  </span>
                </div>
              </div>

              <div className="flex items-center mb-2">
                <span className="mr-2 font-bold">
                  1. จ้างทำงานโปรเจ็คเลขที่:
                </span>
                <span className="border-b border-black border-dotted w-32 inline-block mr-4"></span>
                <span>โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ:</span>
                <span className="font-bold underline decoration-dotted ml-2">
                  {order.supervisor_name}
                </span>
              </div>
            </div>

            {/* SECTION 2: ค่าจ้าง */}
            <div className="mb-4 border-t border-dotted border-gray-300 pt-2">
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                <span className="mr-2 font-bold">2. ค่าจ้างเป็นแบบ:</span>
                <CheckBox
                  checked={order.payment_type === "daily"}
                  label="รายวัน"
                />
                <CheckBox
                  checked={order.payment_type === "project"}
                  label="ต่อโปรเจ็ค"
                />
                <span className="ml-4">เป็นจำนวนเงิน (เรทปกติ):</span>
                <span className="border-b border-black w-24 text-center inline-block font-bold text-lg">
                  {order.wage_rate?.toLocaleString()}
                </span>
                <span>บาท ต่อ ( วัน / งาน )</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="mr-2 font-bold">โอที:</span>
                <CheckBox checked={false} label="มี" />
                <CheckBox checked={true} label="ไม่มี" />
                <span className="ml-6">ระยะเวลา ตั้งแต่วันที่:</span>
                <span className="font-bold underline decoration-dotted mx-2">
                  {formatDate(order.start_date)}
                </span>
                <span>ถึงวันที่:</span>
                <span className="font-bold underline decoration-dotted mx-2">
                  {formatDate(order.end_date)}
                </span>
              </div>
            </div>

            {/* SECTION 3: ตาราง */}
            <div className="mb-4">
              <div className="font-bold mb-1">
                3. ตารางลงเวลา กรณีจ้างแบบรายวัน
              </div>
              <table className="w-full border-collapse border border-black text-center text-xs">
                <thead>
                  <tr className="bg-gray-200 h-8">
                    <th className="border border-black w-[12%]">วันที่ทำงาน</th>
                    <th className="border border-black w-[8%]">เริ่ม</th>
                    <th className="border border-black w-[8%]">สิ้นสุด</th>
                    <th className="border border-black w-[6%]">รวม(วัน)</th>
                    <th className="border border-black w-[8%]">OT เริ่ม</th>
                    <th className="border border-black w-[8%]">OT สิ้นสุด</th>
                    <th className="border border-black w-[6%]">รวม OT</th>
                    <th className="border border-black">
                      ลงชื่อ / รายละเอียดงาน
                    </th>
                    <th className="border border-black w-[12%]">
                      ผู้รับผิดชอบ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(12)].map((_, i) => (
                    <tr key={i} className="h-7">
                      <td className="border border-black"></td>
                      <td className="border border-black"></td>
                      <td className="border border-black"></td>
                      <td className="border border-black"></td>
                      <td className="border border-black"></td>
                      <td className="border border-black"></td>
                      <td className="border border-black"></td>
                      <td className="border border-black"></td>
                      <td className="border border-black"></td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 h-8 font-bold">
                    <td className="border border-black" colSpan={3}>
                      รวม
                    </td>
                    <td className="border border-black"></td>
                    <td className="border border-black" colSpan={2}></td>
                    <td className="border border-black"></td>
                    <td
                      className="border border-black text-left pl-2 text-[10px]"
                      colSpan={2}
                    >
                      หมายเหตุ : ค่าจ้างและค่าใช้จ่ายทั้งหมด จะถูกหัก ณ ที่จ่าย
                      3%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 4: ค่าใช้จ่ายอื่น */}
            <div className="mb-6">
              <div className="font-bold mb-1">4. ค่าใช้จ่ายนอกจาก ค่าจ้าง</div>
              <div className="border border-black p-2 flex justify-between px-4">
                <div className="flex flex-col gap-2 w-1/2">
                  <div className="flex items-center">
                    <CheckBox checked={false} label="" />{" "}
                    <span>
                      ค่าที่พัก เป็นเงิน ......... บาท ต่อ ( วัน / งาน )
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckBox checked={false} label="" />{" "}
                    <span>
                      ค่าเดินทาง เป็นเงิน ....... บาท ต่อ ( วัน / งาน )
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-1/4 pt-1">
                  <CheckBox checked={true} label="ไม่มี" />
                  <CheckBox checked={true} label="ไม่มี" />
                </div>
              </div>
            </div>

            {/* FOOTER: สรุปยอดเงิน */}
            <div className="flex border border-black h-[180px]">
              {/* ลายเซ็นซ้าย */}
              <div className="w-[30%] border-r border-black p-2 flex flex-col items-center text-center relative">
                <div className="w-full text-left font-bold text-xs">
                  ผู้รับเหมา
                </div>
                <div className="mt-4 flex-grow flex items-center justify-center">
                  {order.contractor_signature ? (
                    <img
                      src={order.contractor_signature}
                      className="h-20 object-contain"
                      alt="signature"
                    />
                  ) : (
                    <div className="h-20"></div>
                  )}
                </div>
                <div className="w-full mb-2">
                  <div className="border-t border-black border-dotted w-3/4 mx-auto"></div>
                  <div className="mt-1">({order.contractor_name})</div>
                  <div className="text-[10px] text-gray-500">ผู้รับจ้าง</div>
                </div>
              </div>

              {/* ลายเซ็นกลาง */}
              <div className="w-[30%] border-r border-black p-2 flex flex-col items-center text-center relative">
                <div className="w-full text-left font-bold text-xs">
                  ผู้รับผิดชอบโปรเจ็ค
                </div>
                <div className="mt-4 flex-grow"></div>
                <div className="w-full mb-2">
                  <div className="border-t border-black border-dotted w-3/4 mx-auto"></div>
                  <div className="mt-1">
                    (............................................)
                  </div>
                  <div className="text-[10px] text-gray-500">
                    หัวหน้างาน / PM
                  </div>
                </div>
              </div>

              {/* สรุปขวา */}
              <div className="w-[40%] text-xs">
                <div className="flex border-b border-black h-6 bg-gray-200 font-bold text-center items-center">
                  <div className="w-[45%] border-r border-black">ตารางสรุป</div>
                  <div className="w-[20%] border-r border-black">จำนวน</div>
                  <div className="w-[35%]">บาท</div>
                </div>

                {[
                  ["วันธรรมดา", "วัน", ""],
                  ["วันหยุด (x2)", "วัน", ""],
                  ["ล่วงเวลา (x1.5)", "ชม.", ""],
                  ["ล่วงเวลา (x3)", "ชม.", ""],
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex border-b border-black h-[22px] items-center"
                  >
                    <div className="w-[45%] px-2 border-r border-black">
                      {row[0]}
                    </div>
                    <div className="w-[20%] px-2 border-r border-black text-right">
                      {row[1]}
                    </div>
                    <div className="w-[35%] px-2 text-right">{row[2]}</div>
                  </div>
                ))}

                <div className="flex border-b border-black h-[22px] bg-gray-50 font-bold items-center">
                  <div className="w-[65%] px-2 border-r border-black text-right">
                    รวมทั้งสิ้น
                  </div>
                  <div className="w-[35%] px-2 text-right"></div>
                </div>
                <div className="flex border-b border-black h-[22px] items-center">
                  <div className="w-[65%] px-2 border-r border-black text-right">
                    หัก ณ ที่จ่าย 3%
                  </div>
                  <div className="w-[35%] px-2 text-right"></div>
                </div>
                <div className="flex h-[24px] font-bold items-center bg-gray-100">
                  <div className="w-[65%] px-2 border-r border-black text-right">
                    ยอดสุทธิ
                  </div>
                  <div className="w-[35%] px-2 text-right"></div>
                </div>
              </div>
            </div>

            <div className="mt-2 text-right text-xs flex justify-end items-end h-6">
              <span className="font-bold mr-2">การเงิน:</span>
              <span className="inline-block w-40 border-b border-black border-dotted mb-1"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
