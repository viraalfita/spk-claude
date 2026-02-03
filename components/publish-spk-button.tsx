"use client";

import { publishSPK } from "@/app/actions/spk";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PublishSPKButtonProps {
  spkId: string;
  vendorEmail?: string | null;
}

export function PublishSPKButton({
  spkId,
  vendorEmail,
}: PublishSPKButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(!!vendorEmail);

  const handlePublish = async () => {
    const message =
      sendEmail && vendorEmail
        ? "Are you sure you want to publish this SPK? An email will be sent to the vendor."
        : "Are you sure you want to publish this SPK? Notification will be sent via Slack.";

    if (!confirm(message)) {
      return;
    }

    setLoading(true);
    try {
      const result = await publishSPK(spkId, sendEmail);

      if (result.success) {
        const notification =
          sendEmail && vendorEmail
            ? "SPK published successfully! Email sent to vendor."
            : "SPK published successfully! Slack notification sent.";
        toast({
          title: "SPK published",
          description: notification,
        });
        router.refresh();
      } else {
        toast({
          title: "Failed to publish SPK",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "An error occurred while publishing SPK.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {vendorEmail && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            disabled={loading}
          />
          Send email to vendor
        </label>
      )}
      <Button onClick={handlePublish} disabled={loading}>
        <Send className="mr-2 h-4 w-4" />
        {loading ? "Publishing..." : "Publish SPK"}
      </Button>
    </div>
  );
}
