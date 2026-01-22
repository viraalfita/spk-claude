import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { getSPKWithPayments } from "@/app/actions/spk";
import { SPKPDFTemplate } from "@/lib/pdf/spk-template";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getSPKWithPayments(params.id);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: "SPK not found" },
        { status: 404 }
      );
    }

    const spk = result.data;

    // Generate PDF stream
    const stream = await renderToStream(<SPKPDFTemplate spk={spk} />);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${spk.spk_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
