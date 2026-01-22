import Link from "next/link";
import { getSPKList } from "@/app/actions/spk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/types";
import { Plus, FileText } from "lucide-react";

export default async function DashboardPage() {
  const result = await getSPKList();
  const spks = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage SPKs and track payment status
            </p>
          </div>
          <Link href="/dashboard/create">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create New SPK
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SPKs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spks?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spks?.filter((s) => s.status === "published").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spks?.filter((s) => s.status === "draft").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SPK List */}
        <Card>
          <CardHeader>
            <CardTitle>All SPKs</CardTitle>
          </CardHeader>
          <CardContent>
            {!spks || spks.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No SPKs yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Get started by creating a new SPK
                </p>
                <Link href="/dashboard/create">
                  <Button className="mt-4">Create SPK</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        SPK Number
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Vendor
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Project
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Contract Value
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Created
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {spks.map((spk) => (
                      <tr key={spk.id} className="hover:bg-gray-50">
                        <td className="py-4 text-sm font-medium text-gray-900">
                          {spk.spk_number}
                        </td>
                        <td className="py-4 text-sm text-gray-700">
                          {spk.vendor_name}
                        </td>
                        <td className="py-4 text-sm text-gray-700">
                          {spk.project_name}
                        </td>
                        <td className="py-4 text-sm text-gray-700">
                          {formatCurrency(spk.contract_value, spk.currency)}
                        </td>
                        <td className="py-4">
                          <Badge className={STATUS_COLORS[spk.status]}>
                            {spk.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-gray-500">
                          {formatDate(spk.created_at)}
                        </td>
                        <td className="py-4 text-right">
                          <Link href={`/dashboard/spk/${spk.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
