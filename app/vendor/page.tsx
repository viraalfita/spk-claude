import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_COLORS, PAYMENT_TERM_LABELS } from "@/lib/types";
import { FileText, Download } from "lucide-react";

// Mock data for demo - In production, this would fetch based on vendor auth token
async function getVendorSPKs() {
  // Simulate fetching vendor's SPKs
  return [];
}

export default async function VendorDashboardPage() {
  const spks = await getVendorSPKs();

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

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a demo vendor dashboard. In production, vendors would access this page via a unique authentication link sent to their email.
            </p>
          </CardContent>
        </Card>

        {/* SPK List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Work Orders (SPK)</CardTitle>
            <CardDescription>
              View all SPKs assigned to you and their payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!spks || spks.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No SPKs assigned yet
                </h3>
                <p className="mt-2 text-gray-500">
                  You will see your work orders here once they are published
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {spks.map((spk: any) => (
                  <Card key={spk.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{spk.spk_number}</CardTitle>
                          <CardDescription className="mt-1">
                            {spk.project_name}
                          </CardDescription>
                        </div>
                        <Badge className={STATUS_COLORS[spk.status as keyof typeof STATUS_COLORS]}>
                          {spk.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Contract Value</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(spk.contract_value, spk.currency)}
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Payment Status</p>
                        <div className="space-y-2">
                          {spk.payments?.map((payment: any) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {PAYMENT_TERM_LABELS[payment.term as keyof typeof PAYMENT_TERM_LABELS]}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {payment.percentage}% - {formatCurrency(payment.amount, spk.currency)}
                                </p>
                              </div>
                              <Badge className={STATUS_COLORS[payment.status as keyof typeof STATUS_COLORS]}>
                                {payment.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample SPK for Demo */}
        <Card className="mt-6 border-2 border-dashed">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">SPK-2026-001 (Sample)</CardTitle>
                <CardDescription className="mt-1">
                  Office Renovation Phase 1
                </CardDescription>
              </div>
              <Badge className={STATUS_COLORS.published}>
                published
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Contract Value</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(100000000, "IDR")}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Payment Status</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">Down Payment</p>
                    <p className="text-xs text-gray-500">
                      30% - {formatCurrency(30000000, "IDR")}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS.paid}>paid</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">Progress Payment</p>
                    <p className="text-xs text-gray-500">
                      40% - {formatCurrency(40000000, "IDR")}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS.pending}>pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">Final Payment</p>
                    <p className="text-xs text-gray-500">
                      30% - {formatCurrency(30000000, "IDR")}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS.pending}>pending</Badge>
                </div>
              </div>
            </div>

            <Button size="sm" variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
