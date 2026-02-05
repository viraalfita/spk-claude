import { renderToBuffer } from "@react-pdf/renderer";
import { SPKPDFTemplate } from "./spk-template";
import { SPKWithPayments } from "@/lib/types";

/**
 * Generate PDF buffer from SPK data
 * Used for email attachments
 */
export async function generateSPKPDFBuffer(
  spk: SPKWithPayments
): Promise<Buffer> {
  const buffer = await renderToBuffer(<SPKPDFTemplate spk={spk} />);
  return Buffer.from(buffer);
}
