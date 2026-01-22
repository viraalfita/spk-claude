"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { publishSPK } from "@/app/actions/spk";
import { Send } from "lucide-react";

interface PublishSPKButtonProps {
  spkId: string;
}

export function PublishSPKButton({ spkId }: PublishSPKButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish this SPK? This will notify the vendor.")) {
      return;
    }

    setLoading(true);
    try {
      const result = await publishSPK(spkId);

      if (result.success) {
        alert("SPK published successfully! Vendor notification sent.");
        router.refresh();
      } else {
        alert(result.error || "Failed to publish SPK");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while publishing SPK");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePublish} disabled={loading}>
      <Send className="mr-2 h-4 w-4" />
      {loading ? "Publishing..." : "Publish SPK"}
    </Button>
  );
}
