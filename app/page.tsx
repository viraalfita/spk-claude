import Link from "next/link";
import { FileText, Users, DollarSign } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SPK Creator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Digital work order management system for transparent SPK creation and payment tracking
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Dashboard Card */}
          <Link href="/dashboard">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold ml-4">Admin Dashboard</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Create, manage, and track SPKs. Update payment statuses and generate PDF documents.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Create and publish SPKs
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Track payment status
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Generate PDF documents
                </li>
              </ul>
            </div>
          </Link>

          {/* Vendor Dashboard Card */}
          <Link href="/vendor">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold ml-4">Vendor Portal</h2>
              </div>
              <p className="text-gray-600 mb-4">
                View your SPKs, check payment status, and download documents.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  View assigned SPKs
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Check payment status
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Download PDF copies
                </li>
              </ul>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-lg shadow-md">
            <DollarSign className="w-6 h-6 text-yellow-600 mr-2" />
            <p className="text-gray-700 font-medium">
              Transparent payment tracking across all stakeholders
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
