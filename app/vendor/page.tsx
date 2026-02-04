import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getVendorByToken } from "@/app/actions/vendor";
import { supabaseAdmin } from "@/lib/supabase/server";
import { STATUS_COLORS } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, FileText } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getVendorSPKs(vendorEmail: string) {
  try {
    const { data: spks, error } = await supabaseAdmin
      .from("spk")
      .select("*")
      .ilike("vendor_email", vendorEmail)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching vendor SPKs:", error.message);
      return [];
    }

    // For each SPK, fetch its payments
    const spksWithPayments = await Promise.all(
      (spks || []).map(async (spk) => {
        const { data: payments } = await supabaseAdmin
          .from("payment")
          .select("*")
          .eq("spk_id", spk.id)
          .order("term_order", { ascending: true });

        return { ...spk, payments: payments || [] };
      }),
    );

    return spksWithPayments;
  } catch (error) {
    console.error("Error in getVendorSPKs:", error);
    return [];
  }
}

export default async function VendorDashboardPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  // Resolve token to vendor
  const vendor = token ? await getVendorByToken(token) : null;

  // Fetch all published SPKs for this vendor
  const spks = vendor?.email ? await getVendorSPKs(vendor.email) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Vendor Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            View your SPKs and track payment status
          </p>
        </div>

        {/* No token provided */}
        {!token ? (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-yellow-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No Access Token
                </h3>
                <p className="mt-2 text-sm text-yellow-800">
                  Please access this page via the link provided in your email.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !vendor ? (
          /* Invalid token */
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-red-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Vendor Not Found
                </h3>
                <p className="mt-2 text-sm text-red-800">
                  The link is invalid or has expired.
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
                    <p className="font-medium text-gray-900">{vendor.name}</p>
                  </div>
                  {vendor.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {vendor.email}
                      </p>
                    </div>
                  )}
                  {vendor.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">
                        {vendor.phone}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SPK List */}
            {spks.length === 0 ? (
              <Card className="mb-6 bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No Published SPKs
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      There are no published SPKs for your account yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-gray-600">
                  {spks.length} published SPK{spks.length > 1 ? "s" : ""}
                </p>

                {spks.map((spk: any) => (
                  <Card key={spk.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            No. {spk.spk_number}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {spk.project_name}
                          </CardDescription>
                        </div>
                        <Badge
                          className={
                            STATUS_COLORS[
                              spk.status as keyof typeof STATUS_COLORS
                            ]
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
                          <p className="text-sm text-gray-500">
                            Contract Value
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(spk.contract_value, spk.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Project Period
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(spk.start_date)}
                            {" - "}
                            {spk.end_date
                              ? formatDate(spk.end_date)
                              : "Ongoing"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">
                          Payment Status
                        </p>
                        <div className="space-y-2">
                          {spk.payments
                            ?.sort(
                              (a: any, b: any) => a.term_order - b.term_order,
                            )
                            .map((payment: any) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded"
                              >
                                <div>
                                  <p className="font-medium text-sm">
                                    {payment.term_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {payment.percentage !== null &&
                                      `${payment.percentage}% - `}
                                    {formatCurrency(
                                      payment.amount,
                                      spk.currency,
                                    )}
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
