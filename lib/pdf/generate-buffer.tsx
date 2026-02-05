import {
  DEFAULT_TERMS_AND_CONDITIONS,
  SPKPDFData,
  SPKWithPayments,
} from "@/lib/types";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { SPKPDFTemplate } from "./spk-template";

// Generate QR code as data URL
async function generateQRCodeDataUrl(data: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
}

interface PDFGenerationOptions {
  termsAndConditions?: string;
  signatureUrl?: string;
}

/**
 * Generate PDF buffer from SPK data
 * Used for email attachments
 */
export async function generateSPKPDFBuffer(
  spk: SPKWithPayments,
  options?: PDFGenerationOptions,
): Promise<Buffer> {
  // Generate QR code for signature if provided (prefer options, fallback to spk data)
  let signatureQRDataUrl: string | null = null;
  const signatureUrl = options?.signatureUrl || spk.signature_url;
  if (signatureUrl) {
    signatureQRDataUrl = await generateQRCodeDataUrl(signatureUrl);
  }

  // Prepare PDF data
  const pdfData: SPKPDFData = {
    ...spk,
    termsAndConditions:
      options?.termsAndConditions || DEFAULT_TERMS_AND_CONDITIONS,
    signatureUrl: signatureUrl || undefined,
    signatureQRDataUrl: signatureQRDataUrl || undefined,
  };

  const buffer = await renderToBuffer(<SPKPDFTemplate spk={pdfData} />);
  return Buffer.from(buffer);
}
