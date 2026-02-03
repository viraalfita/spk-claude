"use client";

import { Button } from "@/components/ui/button";
import { Download, Eye, X } from "lucide-react";
import { useState } from "react";

interface PDFPreviewButtonProps {
  spkId: string;
  spkNumber: string;
}

export function PDFPreviewButton({ spkId, spkNumber }: PDFPreviewButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/pdf/${spkId}`;
    link.download = `SPK-${spkNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowModal(true)}>
        <Eye className="mr-2 h-4 w-4" />
        Preview PDF
      </Button>

      {/* PDF Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                PDF Preview - {spkNumber}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <iframe
                src={`/api/pdf/${spkId}?preview=true`}
                className="w-full h-[70vh] border-0 rounded shadow-sm"
                title={`PDF Preview - ${spkNumber}`}
              />
            </div>

            <div className="p-4 border-t flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
