import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabase/server";
import { PAYMENT_TERM_LABELS, STATUS_COLORS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Download, FileText } from "lucide-react";
import Link from "next/link";

async function getVendorSPK(spkId: string) {
  try {
    const { data: spk, error } = await supabaseAdmin
      .from("spk")
      .select(
        `
        *,
        payments:payment(*)
      `,
      )
      .eq("id", spkId)
      .eq("status", "published")
      .single();

    if (error) {
      console.error("Error fetching SPK:", error);
      return null;
    }

    return spk;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export default async function VendorDashboardPage({
  searchParams,
}: {
  searchParams: { spkId?: string };
}) {
  const spkId = searchParams.spkId;
  const spk = spkId ? await getVendorSPK(spkId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="mt-2 text-gray-600">
            View your SPKs and track payment status
          </p>
        </div>

        {/* SPK Details */}
        {!spkId ? (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-yellow-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No SPK Selected
                </h3>
                <p className="mt-2 text-sm text-yellow-800">
                  Please access this page via the link provided in your email.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !spk ? (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-red-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  SPK Not Found
                </h3>
                <p className="mt-2 text-sm text-red-800">
                  The SPK you are looking for does not exist or has not been
                  published yet.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Vendor Info */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vendor</p>
                    <p className="font-medium text-gray-900">
                      {spk.vendor_name}
                    </p>
                  </div>
                  {spk.vendor_email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {spk.vendor_email}
                      </p>
                    </div>
                  )}
                  {spk.vendor_phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">
                        {spk.vendor_phone}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SPK Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{spk.spk_number}</CardTitle>
                    <CardDescription className="mt-1">
                      {spk.project_name}
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
                {spk.project_description && (
                  <div className="mb-4 p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">
                      Project Description
                    </p>
                    <p className="text-sm text-gray-900">
                      {spk.project_description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Contract Value</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(spk.contract_value, spk.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Project Period</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(spk.start_date).toLocaleDateString()} -{" "}
                      {spk.end_date
                        ? new Date(spk.end_date).toLocaleDateString()
                        : "Ongoing"}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Payment Status</p>
                  <div className="space-y-2">
                    {spk.payments
                      ?.sort((a: any, b: any) => {
                        const order = { dp: 0, progress: 1, final: 2 };
                        return (
                          order[a.term as keyof typeof order] -
                          order[b.term as keyof typeof order]
                        );
                      })
                      .map((payment: any) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {
                                PAYMENT_TERM_LABELS[
                                  payment.term as keyof typeof PAYMENT_TERM_LABELS
                                ]
                              }
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.percentage}% -{" "}
                              {formatCurrency(payment.amount, spk.currency)}
                            </p>
                            {payment.paid_date && (
                              <p className="text-xs text-green-600 mt-1">
                                Paid on{" "}
                                {new Date(
                                  payment.paid_date,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={
                              STATUS_COLORS[
                                payment.status as keyof typeof STATUS_COLORS
                              ]
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <Link href={`/api/pdf/${spk.id}`} target="_blank">
                  <Button size="sm" variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
