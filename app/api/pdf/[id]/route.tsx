import { getSPKWithPayments } from "@/app/actions/spk";
import { SPKPDFTemplate } from "@/lib/pdf/spk-template";
import { DEFAULT_TERMS_AND_CONDITIONS, SPKPDFData } from "@/lib/types";
import { renderToStream } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const result = await getSPKWithPayments(params.id);

    if (!result.success || !result.data) {
      return NextResponse.json({ error: "SPK not found" }, { status: 404 });
    }

    const spk = result.data;

    // Get query parameters for customization
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get("preview") === "true";
    const termsAndConditions =
      searchParams.get("terms") || DEFAULT_TERMS_AND_CONDITIONS;

    // Generate QR code for signature if provided (from database)
    let signatureQRDataUrl: string | null = null;
    if (spk.signature_url) {
      signatureQRDataUrl = await generateQRCodeDataUrl(spk.signature_url);
    }

    // Prepare PDF data
    const pdfData: SPKPDFData = {
      ...spk,
      termsAndConditions,
      signatureUrl: spk.signature_url || undefined,
      signatureQRDataUrl: signatureQRDataUrl || undefined,
    };

    // Generate PDF stream
    const stream = await renderToStream(<SPKPDFTemplate spk={pdfData} />);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF with appropriate headers
    // Use "inline" for preview (displays in browser), "attachment" for download
    const disposition = isPreview ? "inline" : "attachment";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${spk.spk_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
