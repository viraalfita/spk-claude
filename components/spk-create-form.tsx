"use client";

import { createSPK } from "@/app/actions/spk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateSPKFormData } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SPKCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSPKFormData>({
    vendorName: "",
    vendorEmail: "",
    vendorPhone: "",
    projectName: "",
    projectDescription: "",
    contractValue: 0,
    currency: "IDR",
    startDate: "",
    endDate: "",
    dpPercentage: 30,
    progressPercentage: 40,
    finalPercentage: 30,
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "contractValue" ||
        name === "dpPercentage" ||
        name === "progressPercentage"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate percentages sum to 100
      const totalPercentage =
        formData.dpPercentage + formData.progressPercentage;
      if (totalPercentage > 100) {
        alert("Payment percentages cannot exceed 100%");
        setLoading(false);
        return;
      }

      const result = await createSPK(formData);

      if (result.success) {
        alert("SPK created successfully!");
        router.push("/dashboard");
      } else {
        alert(result.error || "Failed to create SPK");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating SPK");
    } finally {
      setLoading(false);
    }
  };

  const finalPercentage =
    100 - formData.dpPercentage - formData.progressPercentage;
  const dpAmount = (formData.contractValue * formData.dpPercentage) / 100;
  const progressAmount =
    (formData.contractValue * formData.progressPercentage) / 100;
  const finalAmount = (formData.contractValue * finalPercentage) / 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vendor Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vendor Information</h3>

        <div>
          <Label htmlFor="vendorName">Vendor Name *</Label>
          <Input
            id="vendorName"
            name="vendorName"
            value={formData.vendorName}
            onChange={handleChange}
            required
            placeholder="PT Vendor Jaya"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="vendorEmail">Vendor Email</Label>
            <Input
              id="vendorEmail"
              name="vendorEmail"
              type="email"
              value={formData.vendorEmail}
              onChange={handleChange}
              placeholder="vendor@example.com"
            />
          </div>

          <div>
            <Label htmlFor="vendorPhone">Vendor Phone</Label>
            <Input
              id="vendorPhone"
              name="vendorPhone"
              value={formData.vendorPhone}
              onChange={handleChange}
              placeholder="+62-812-3456-7890"
            />
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Project Information</h3>

        <div>
          <Label htmlFor="projectName">Project Name *</Label>
          <Input
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            required
            placeholder="Office Renovation Phase 1"
          />
        </div>

        <div>
          <Label htmlFor="projectDescription">Project Description</Label>
          <Textarea
            id="projectDescription"
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            placeholder="Detailed project description..."
            rows={4}
          />
        </div>
      </div>

      {/* Contract Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contract Details</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="contractValue">Contract Value *</Label>
            <Input
              id="contractValue"
              name="contractValue"
              type="number"
              value={formData.contractValue}
              onChange={handleChange}
              required
              min="0"
              placeholder="100000000"
            />
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder="IDR"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Terms</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="dpPercentage">Down Payment (%)</Label>
            <Input
              id="dpPercentage"
              name="dpPercentage"
              type="number"
              value={formData.dpPercentage}
              onChange={handleChange}
              min="0"
              max="100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Amount: Rp {dpAmount.toLocaleString("id-ID")}
            </p>
          </div>

          <div>
            <Label htmlFor="progressPercentage">Progress Payment (%)</Label>
            <Input
              id="progressPercentage"
              name="progressPercentage"
              type="number"
              value={formData.progressPercentage}
              onChange={handleChange}
              min="0"
              max="100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Amount: Rp {progressAmount.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div>
          <Label>Final Payment</Label>
          <Input
            value={`${finalPercentage}%`}
            disabled
            className="bg-gray-50"
          />
          <p className="mt-1 text-sm text-gray-500">
            Amount: Rp {finalAmount.toLocaleString("id-ID")}
          </p>
        </div>

        {finalPercentage < 0 && (
          <p className="text-sm text-red-600">
            Warning: Payment percentages exceed 100%
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any special instructions or notes..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Creating..." : "Create SPK (Draft)"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
