// Email utilities using Resend
import { Resend } from "resend";
import { SPK } from "./types";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendSPKEmailParams {
  to: string;
  spk: SPK;
  pdfUrl?: string;
}

export async function sendSPKCreatedEmail({
  to,
  spk,
  pdfUrl,
}: SendSPKEmailParams) {
  try {
    const envFrom = process.env.RESEND_FROM_EMAIL || "";
    const safeFrom = envFrom.includes("resend.dev")
      ? envFrom
      : "Resend <onboarding@resend.dev>";
    const { data, error } = await resend.emails.send({
      from: safeFrom,
      to,
      subject: `New SPK Created: ${spk.spk_number}`,
      html: `
        <h2>New SPK Created</h2>
        <p>A new SPK has been created for your project.</p>
        
        <h3>SPK Details:</h3>
        <ul>
          <li><strong>SPK Number:</strong> ${spk.spk_number}</li>
          <li><strong>Project:</strong> ${spk.project_name}</li>
          <li><strong>Contract Value:</strong> ${spk.currency} ${spk.contract_value.toLocaleString()}</li>
          <li><strong>Start Date:</strong> ${new Date(spk.start_date).toLocaleDateString()}</li>
          ${spk.end_date ? `<li><strong>End Date:</strong> ${new Date(spk.end_date).toLocaleDateString()}</li>` : ""}
        </ul>
        
        ${
          pdfUrl
            ? `<p><a href="${pdfUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">View SPK PDF</a></p>`
            : ""
        }
        
        <p>Thank you for your partnership!</p>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

interface SendPaymentUpdateEmailParams {
  to: string;
  spk: SPK;
  paymentTermName: string;
  paymentStatus: string;
  paymentAmount: number;
}

export async function sendPaymentUpdateEmail({
  to,
  spk,
  paymentTermName,
  paymentStatus,
  paymentAmount,
}: SendPaymentUpdateEmailParams) {
  try {
    const envFrom = process.env.RESEND_FROM_EMAIL || "";
    const safeFrom = envFrom.includes("resend.dev")
      ? envFrom
      : "Resend <onboarding@resend.dev>";
    const { data, error } = await resend.emails.send({
      from: safeFrom,
      to,
      subject: `Payment Update: ${spk.spk_number} - ${paymentTermName}`,
      html: `
        <h2>Payment Status Updated</h2>
        <p>The payment status for your SPK has been updated.</p>
        
        <h3>Details:</h3>
        <ul>
          <li><strong>SPK Number:</strong> ${spk.spk_number}</li>
          <li><strong>Project:</strong> ${spk.project_name}</li>
          <li><strong>Payment Term:</strong> ${paymentTermName}</li>
          <li><strong>Amount:</strong> ${spk.currency} ${paymentAmount.toLocaleString()}</li>
          <li><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${paymentStatus === "paid" ? "#22c55e" : "#f59e0b"};">${paymentStatus}</span></li>
        </ul>
        
        <p>Thank you for your continued partnership!</p>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
