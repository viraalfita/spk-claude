// Slack notification utilities
import { Payment, SPK } from "./types";

interface SendSlackNotificationParams {
  text: string;
  blocks?: any[];
}

export async function sendSlackNotification({
  text,
  blocks,
}: SendSlackNotificationParams) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured, skipping notification");
    return { success: false, error: "Webhook URL not configured" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, blocks }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Slack API error:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending Slack notification:", error);
    return { success: false, error };
  }
}

export async function notifySPKPublished(spk: SPK) {
  const text = `🎉 New SPK #${spk.spk_number} published for ${spk.vendor_name} - ${spk.project_name}`;

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🎉 New SPK Published",
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*SPK Number:*\n${spk.spk_number}`,
        },
        {
          type: "mrkdwn",
          text: `*Vendor:*\n${spk.vendor_name}`,
        },
        {
          type: "mrkdwn",
          text: `*Project:*\n${spk.project_name}`,
        },
        {
          type: "mrkdwn",
          text: `*Contract Value:*\n${spk.currency} ${spk.contract_value.toLocaleString()}`,
        },
        {
          type: "mrkdwn",
          text: `*Start Date:*\n${new Date(spk.start_date).toLocaleDateString()}`,
        },
        {
          type: "mrkdwn",
          text: `*Created By:*\n${spk.created_by}`,
        },
      ],
    },
  ];

  if (spk.notes) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Notes:*\n${spk.notes}`,
      },
    });
  }

  return sendSlackNotification({ text, blocks });
}

export async function notifyPaymentUpdated(
  spk: SPK,
  payment: Payment,
  updatedBy: string,
) {
  const statusEmoji =
    payment.status === "paid"
      ? "✅"
      : payment.status === "overdue"
        ? "⚠️"
        : "⏳";

  const text = `${statusEmoji} Payment ${payment.term_name} for SPK #${spk.spk_number} marked as ${payment.status.toUpperCase()}`;

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${statusEmoji} Payment Status Updated`,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*SPK Number:*\n${spk.spk_number}`,
        },
        {
          type: "mrkdwn",
          text: `*Vendor:*\n${spk.vendor_name}`,
        },
        {
          type: "mrkdwn",
          text: `*Payment Term:*\n${payment.term_name}`,
        },
        {
          type: "mrkdwn",
          text: `*Amount:*\n${spk.currency} ${payment.amount.toLocaleString()}`,
        },
        {
          type: "mrkdwn",
          text: `*Status:*\n${payment.status.toUpperCase()}`,
        },
        {
          type: "mrkdwn",
          text: `*Updated By:*\n${updatedBy}`,
        },
      ],
    },
  ];

  if (payment.paid_date) {
    blocks[1]?.fields?.push({
      type: "mrkdwn",
      text: `*Paid Date:*\n${new Date(payment.paid_date).toLocaleDateString()}`,
    });
  }

  if (payment.payment_reference) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Reference:* ${payment.payment_reference}`,
      },
    });
  }

  return sendSlackNotification({ text, blocks });
}
