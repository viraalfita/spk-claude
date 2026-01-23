import { getSPKWithPayments } from "@/app/actions/spk";
import { PaymentStatusUpdate } from "@/components/payment-status-update";
import { PublishSPKButton } from "@/components/publish-spk-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PAYMENT_TERM_LABELS, Payment, STATUS_COLORS } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SPKDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getSPKWithPayments(params.id);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Failed to load SPK details
            </p>
            <Link href="/dashboard">
              <Button className="mt-4 w-full">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const spk = result.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* SPK Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{spk.spk_number}</CardTitle>
                <CardDescription className="mt-2">
                  Created on {formatDate(spk.created_at)} by {spk.created_by}
                </CardDescription>
              </div>
              <Badge
                className={
                  STATUS_COLORS[spk.status as keyof typeof STATUS_COLORS]
                }
              >
                {spk.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {spk.status === "draft" && <PublishSPKButton spkId={spk.id} />}
              <Link href={`/api/pdf/${spk.id}`} target="_blank">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{spk.vendor_name}</p>
              </div>
              {spk.vendor_email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{spk.vendor_email}</p>
                </div>
              )}
              {spk.vendor_phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{spk.vendor_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Project Name</p>
                <p className="font-medium">{spk.project_name}</p>
              </div>
              {spk.project_description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm">{spk.project_description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">
                  {formatDate(spk.start_date)}
                  {spk.end_date && ` - ${formatDate(spk.end_date)}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Total Contract Value</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(spk.contract_value, spk.currency)}
              </p>
            </div>
            {spk.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm mt-1">{spk.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Tracking */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Tracking</CardTitle>
            <CardDescription>
              Track payment milestones and update status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spk.payments.map((payment: Payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">
                        {PAYMENT_TERM_LABELS[payment.term]}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {payment.percentage}% of contract value
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(payment.amount, spk.currency)}
                      </p>
                      <Badge className={STATUS_COLORS[payment.status]}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>

                  {payment.paid_date && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">
                        Paid on: {formatDate(payment.paid_date)}
                      </p>
                      {payment.payment_reference && (
                        <p className="text-sm text-gray-500">
                          Reference: {payment.payment_reference}
                        </p>
                      )}
                    </div>
                  )}

                  <PaymentStatusUpdate payment={payment} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
