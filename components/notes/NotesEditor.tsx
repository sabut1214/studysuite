"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function NotesEditor() {
  const [text, setText] = useState("");
  const previewRef = useRef<HTMLDivElement | null>(null);

  const downloadPdf = async () => {
    if (!previewRef.current) return;

    const canvas = await html2canvas(previewRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save("notes.pdf");
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-amber-100/30">
        <textarea
          className="min-h-[180px] w-full rounded-xl border border-slate-200 p-3 text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write notes here..."
        />

        <button
          onClick={downloadPdf}
          className="w-fit rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Download PDF
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-4" ref={previewRef}>
          <h2 className="text-lg font-medium text-slate-900">Preview</h2>
          <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
            {text || "Start typing to see a preview."}
          </pre>
        </div>
      </div>
    </div>
  );
}
