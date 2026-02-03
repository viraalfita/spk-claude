"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePaymentStatus } from "@/app/actions/payment";
import { Payment } from "@/lib/types";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface PaymentStatusUpdateProps {
  payment: Payment;
}

export function PaymentStatusUpdate({ payment }: PaymentStatusUpdateProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paidDate, setPaidDate] = useState(
    payment.paid_date || new Date().toISOString().split("T")[0]
  );
  const [paymentReference, setPaymentReference] = useState(
    payment.payment_reference || ""
  );

  const handleMarkAsPaid = async () => {
    setLoading(true);
    try {
      const result = await updatePaymentStatus({
        paymentId: payment.id,
        status: "paid",
        paidDate,
        paymentReference,
      });

      if (result.success) {
        toast({
          title: "Payment updated",
          description: "Payment status updated successfully.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Failed to update payment",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "An error occurred while updating payment status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (payment.status === "paid") {
    return null;
  }

  if (!isEditing) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsEditing(true)}
        className="w-full"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Mark as Paid
      </Button>
    );
  }

  return (
    <div className="space-y-3 pt-3 border-t">
      <div>
        <Label htmlFor={`paid-date-${payment.id}`} className="text-xs">
          Payment Date
        </Label>
        <Input
          id={`paid-date-${payment.id}`}
          type="date"
          value={paidDate}
          onChange={(e) => setPaidDate(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor={`payment-ref-${payment.id}`} className="text-xs">
          Payment Reference (Optional)
        </Label>
        <Input
          id={`payment-ref-${payment.id}`}
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="TRX-20260121-001"
          className="mt-1"
        />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleMarkAsPaid}
          disabled={loading}
          className="flex-1"
        >
          {loading ? "Updating..." : "Confirm Payment"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
