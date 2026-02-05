// Email utilities using MailerSend
import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";
import { SPK } from "./types";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "",
});

// Sender yang sudah diverifikasi via Sender Identity
const getDefaultSender = () =>
  new Sender(
    process.env.MAILERSEND_FROM_EMAIL || "",
    process.env.MAILERSEND_FROM_NAME || "SPK Creator"
  );

interface SendSPKEmailParams {
  to: string;
  spk: SPK;
  pdfBuffer?: Buffer;
  vendorDashboardUrl?: string;
}

export async function sendSPKCreatedEmail({
  to,
  spk,
  pdfBuffer,
  vendorDashboardUrl,
}: SendSPKEmailParams) {
  try {
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(getDefaultSender())
      .setTo(recipients)
      .setSubject(`SPK Published: ${spk.spk_number} - ${spk.project_name}`)
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">SPK Published</h1>
          </div>

          <div style="padding: 30px; background-color: #f9fafb;">
            <p style="font-size: 16px; color: #374151;">Dear <strong>${spk.vendor_name}</strong>,</p>

            <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
              A new Surat Perintah Kerja (SPK) has been created for your project.
              Please find the SPK document attached to this email.
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                SPK Details
              </h3>
              <table style="width: 100%; font-size: 14px; color: #4b5563;">
                <tr>
                  <td style="padding: 8px 0; width: 40%;">SPK Number:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${spk.spk_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Project:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${spk.project_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Contract Value:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #2563eb; font-size: 16px;">
                    ${spk.currency} ${spk.contract_value.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Start Date:</td>
                  <td style="padding: 8px 0;">${new Date(spk.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                </tr>
                ${spk.end_date ? `
                <tr>
                  <td style="padding: 8px 0;">End Date:</td>
                  <td style="padding: 8px 0;">${new Date(spk.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                </tr>
                ` : ""}
              </table>
            </div>

            ${vendorDashboardUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 14px; color: #4b5563; margin-bottom: 15px;">
                Track your SPK status and payment progress:
              </p>
              <a href="${vendorDashboardUrl}"
                 style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                Open Vendor Dashboard
              </a>
            </div>
            ` : ""}

            <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 20px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 13px; color: #92400e;">
                <strong>Note:</strong> The SPK document is attached to this email as a PDF file.
                Please review and keep it for your records.
              </p>
            </div>
          </div>

          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Thank you for your partnership!</p>
            <p style="margin: 10px 0 0 0;">SPK Creator System</p>
          </div>
        </div>
      `)
      .setText(
        `SPK Published: ${spk.spk_number}\n\n` +
        `Dear ${spk.vendor_name},\n\n` +
        `A new SPK has been created for your project.\n\n` +
        `SPK Details:\n` +
        `- SPK Number: ${spk.spk_number}\n` +
        `- Project: ${spk.project_name}\n` +
        `- Contract Value: ${spk.currency} ${spk.contract_value.toLocaleString()}\n` +
        `- Start Date: ${new Date(spk.start_date).toLocaleDateString()}\n` +
        (spk.end_date ? `- End Date: ${new Date(spk.end_date).toLocaleDateString()}\n` : "") +
        (vendorDashboardUrl ? `\nVendor Dashboard: ${vendorDashboardUrl}\n` : "") +
        `\nThe SPK document is attached to this email.\n\n` +
        `Thank you for your partnership!`
      );

    // Add PDF attachment if provided
    if (pdfBuffer) {
      const attachment = new Attachment(
        pdfBuffer.toString("base64"),
        `SPK-${spk.spk_number.replace(/\//g, "-")}.pdf`,
        "attachment"
      );
      emailParams.setAttachments([attachment]);
    }

    const response = await mailerSend.email.send(emailParams);
    return { success: true, data: response };
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
  vendorDashboardUrl?: string;
}

export async function sendPaymentUpdateEmail({
  to,
  spk,
  paymentTermName,
  paymentStatus,
  paymentAmount,
  vendorDashboardUrl,
}: SendPaymentUpdateEmailParams) {
  try {
    const recipients = [new Recipient(to)];
    const statusColor = paymentStatus === "paid" ? "#22c55e" : paymentStatus === "overdue" ? "#ef4444" : "#f59e0b";
    const statusBgColor = paymentStatus === "paid" ? "#dcfce7" : paymentStatus === "overdue" ? "#fee2e2" : "#fef3c7";

    const emailParams = new EmailParams()
      .setFrom(getDefaultSender())
      .setTo(recipients)
      .setSubject(`Payment Update: ${spk.spk_number} - ${paymentTermName}`)
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Payment Status Updated</h1>
          </div>

          <div style="padding: 30px; background-color: #f9fafb;">
            <p style="font-size: 16px; color: #374151;">Dear <strong>${spk.vendor_name}</strong>,</p>

            <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
              The payment status for your SPK has been updated.
            </p>

            <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <table style="width: 100%; font-size: 14px; color: #4b5563;">
                <tr>
                  <td style="padding: 8px 0; width: 40%;">SPK Number:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${spk.spk_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Project:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${spk.project_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Payment Term:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${paymentTermName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Amount:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #2563eb;">${spk.currency} ${paymentAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Status:</td>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; padding: 4px 12px; background-color: ${statusBgColor}; color: ${statusColor}; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                      ${paymentStatus}
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            ${vendorDashboardUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${vendorDashboardUrl}"
                 style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                View Full Details
              </a>
            </div>
            ` : ""}
          </div>

          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Thank you for your continued partnership!</p>
            <p style="margin: 10px 0 0 0;">SPK Creator System</p>
          </div>
        </div>
      `)
      .setText(
        `Payment Update: ${spk.spk_number}\n\n` +
        `Payment Term: ${paymentTermName}\n` +
        `Amount: ${spk.currency} ${paymentAmount.toLocaleString()}\n` +
        `Status: ${paymentStatus.toUpperCase()}\n` +
        (vendorDashboardUrl ? `\nView details: ${vendorDashboardUrl}\n` : "")
      );

    const response = await mailerSend.email.send(emailParams);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// Helper untuk test email
export async function sendTestEmail(to: string) {
  try {
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(getDefaultSender())
      .setTo(recipients)
      .setSubject("Test Email dari MailerSend")
      .setHtml("<h1>Halo!</h1><p>Ini adalah email test dari SPK Creator.</p>")
      .setText("Halo! Ini adalah email test dari SPK Creator.");

    const response = await mailerSend.email.send(emailParams);
    console.log("Email terkirim:", response);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending test email:", error);
    return { success: false, error };
  }
}
