"use client";

import { publishSPK } from "@/app/actions/spk";
import { PDFPreviewButton } from "@/components/pdf-preview-button";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SPKDetailActionsProps {
  spkId: string;
  spkNumber: string;
  vendorEmail: string | null;
  vendorToken: string | null;
  currentStatus: string;
}

export function SPKDetailActions({
  spkId,
  spkNumber,
  vendorEmail,
  vendorToken,
  currentStatus,
}: SPKDetailActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleShareSPK = async () => {
    if (!vendorToken) {
      toast({
        title: "Cannot share",
        description: "Vendor token not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Auto-publish when sharing
      if (status !== "published") {
        await publishSPK(spkId, false);
        setStatus("published");
      }

      const shareUrl = `${window.location.origin}/vendor?token=${vendorToken}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description:
          "Vendor dashboard link copied to clipboard. SPK has been published.",
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!vendorEmail) {
      toast({
        title: "No vendor email",
        description: "Vendor email is not available.",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      // publishSPK with sendEmail=true will auto-publish and send email
      const result = await publishSPK(spkId, true);
      if (result.success) {
        setStatus("published");
        toast({
          title: "Email sent",
          description: "SPK email sent to vendor. SPK has been published.",
        });
        router.refresh();
      } else {
        toast({
          title: "Failed to send email",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "An error occurred while sending email.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <PDFPreviewButton spkId={spkId} spkNumber={spkNumber} />

      <Button
        variant="outline"
        onClick={handleShareSPK}
        disabled={!vendorToken}
      >
        Share SPK
      </Button>

      <Button onClick={handleSendEmail} disabled={sendingEmail || !vendorEmail}>
        {sendingEmail ? "Sending..." : "Send to Email"}
      </Button>
    </div>
  );
}
