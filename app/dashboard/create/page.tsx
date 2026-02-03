import { SPKCreateForm } from "@/components/spk-create-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateSPKPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create New SPK</CardTitle>
            <CardDescription>
              Fill in the details below to create a new work order (SPK) for a
              vendor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SPKCreateForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
