"use client";

import {
  createSPK,
  generateSPKNumber,
  publishSPK,
  uploadSignature,
} from "@/app/actions/spk";
import { getVendorHistory } from "@/app/actions/vendor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { VendorAutocomplete } from "@/components/vendor-autocomplete";
import {
  CreateSPKFormData,
  CURRENCIES,
  DEFAULT_TERMS_AND_CONDITIONS,
  PaymentTerm,
} from "@/lib/types";
import {
  calculatePaymentAmount,
  formatCurrency,
  formatDate,
  formatNumberWithSeparators,
  parseFormattedNumber,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SPKCreateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorHistory, setVendorHistory] = useState<any[]>([]);
  const [createdSPK, setCreatedSPK] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [currencySelection, setCurrencySelection] = useState<string>("IDR");
  const [customCurrency, setCustomCurrency] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [vendorToken, setVendorToken] = useState<string | null>(null);
  const [generatedSPKNumber, setGeneratedSPKNumber] = useState<string>("");
  const [contractValueDisplay, setContractValueDisplay] = useState("");
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [focusedPaymentInput, setFocusedPaymentInput] = useState<number | null>(
    null,
  );

  const [formData, setFormData] = useState<CreateSPKFormData>({
    spkNumber: "",
    vendorName: "",
    vendorEmail: "",
    vendorPhone: "",
    picName: "",
    picEmail: "",
    projectName: "",
    projectDescription: "",
    contractValue: 0,
    currency: "IDR",
    startDate: "",
    endDate: "",
    paymentTerms: [
      {
        term_name: "Full Payment",
        term_order: 1,
        amount: 0,
        percentage: 100,
        input_type: "percentage",
      },
    ],
    notes: "",
    termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS,
    signatureUrl: "",
  });

  // Generate SPK number on mount
  useEffect(() => {
    async function loadInitialData() {
      // Load vendor history
      const vendorResult = await getVendorHistory();
      if (vendorResult.success && vendorResult.data) {
        setVendorHistory(vendorResult.data);
      }

      // Generate SPK number
      const spkResult = await generateSPKNumber();
      if (spkResult.success && spkResult.spkNumber) {
        setGeneratedSPKNumber(spkResult.spkNumber);
        setFormData((prev) => ({ ...prev, spkNumber: spkResult.spkNumber }));
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.currency && !CURRENCIES.includes(formData.currency as any)) {
      setCurrencySelection("etc");
      setCustomCurrency(formData.currency);
    } else {
      setCurrencySelection(formData.currency || "IDR");
    }
  }, [formData.currency]);

  // Update contract value display when currency changes
  useEffect(() => {
    if (formData.contractValue > 0) {
      setContractValueDisplay(
        formatNumberWithSeparators(formData.contractValue, formData.currency),
      );
    }
  }, [formData.currency]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContractValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = e.target.value;
    setContractValueDisplay(rawValue);

    // Parse and store numeric value
    const numericValue = parseFormattedNumber(rawValue);
    setFormData((prev) => ({
      ...prev,
      contractValue: numericValue,
    }));
    setFieldErrors((prev) => ({ ...prev, contractValue: "" }));
  };

  const handleContractValueBlur = () => {
    // Format the display value on blur
    if (formData.contractValue > 0) {
      setContractValueDisplay(
        formatNumberWithSeparators(formData.contractValue, formData.currency),
      );
    }
  };

  const handleVendorSelect = (vendor: any) => {
    setFormData((prev) => ({
      ...prev,
      vendorName: vendor.vendor_name,
      vendorEmail: vendor.vendor_email || "",
      vendorPhone: vendor.vendor_phone || "",
    }));
    setFieldErrors((prev) => ({ ...prev, vendorName: "" }));
  };

  const handlePaymentTermChange = (
    index: number,
    field: keyof PaymentTerm,
    value: string | number | undefined | null,
  ) => {
    const newPaymentTerms = [...formData.paymentTerms];
    const term = { ...newPaymentTerms[index] };

    if (field === "input_type") {
      term.input_type = value as "percentage" | "nominal";
      if (value === "percentage") {
        term.percentage = 0;
        term.amount = 0;
      } else {
        term.percentage = undefined;
        term.amount = 0;
      }
    } else if (field === "percentage") {
      // Parse percentage from string
      const cleanValue = String(value).replace(/[^\d.]/g, "");
      const numValue = parseFloat(cleanValue) || 0;
      term.percentage = Math.min(100, Math.max(0, numValue));
      term.amount = calculatePaymentAmount(
        formData.contractValue,
        term.percentage,
      );
    } else if (field === "amount") {
      // Parse amount from formatted string
      const numValue =
        typeof value === "string" ? parseFormattedNumber(value) : value || 0;
      term.amount = numValue;
      term.percentage = undefined;
    } else {
      (term as any)[field] = value;
    }

    newPaymentTerms[index] = term;
    setFormData((prev) => ({ ...prev, paymentTerms: newPaymentTerms }));
  };

  const addPaymentTerm = () => {
    const newOrder = formData.paymentTerms.length + 1;
    setFormData((prev) => ({
      ...prev,
      paymentTerms: [
        ...prev.paymentTerms,
        {
          term_name: `Payment Term ${newOrder}`,
          term_order: newOrder,
          amount: 0,
          percentage: 0,
          input_type: "percentage",
        },
      ],
    }));
  };

  const removePaymentTerm = (index: number) => {
    if (formData.paymentTerms.length === 1) {
      toast({
        title: "Cannot remove payment term",
        description: "At least one payment term is required.",
        variant: "destructive",
      });
      return;
    }

    const newPaymentTerms = formData.paymentTerms
      .filter((_, i) => i !== index)
      .map((term, i) => ({ ...term, term_order: i + 1 }));

    setFormData((prev) => ({ ...prev, paymentTerms: newPaymentTerms }));
  };

  const getTotalPaymentAmount = () => {
    return formData.paymentTerms.reduce((sum, term) => sum + term.amount, 0);
  };

  const getTotalPercentage = () => {
    return formData.paymentTerms
      .filter((t) => t.input_type === "percentage")
      .reduce((sum, term) => sum + (term.percentage || 0), 0);
  };

  // Check if all terms use the same input type
  const allTermsUsePercentage = () => {
    return formData.paymentTerms.every((t) => t.input_type === "percentage");
  };

  const allTermsUseNominal = () => {
    return formData.paymentTerms.every((t) => t.input_type === "nominal");
  };

  // Validate payment totals
  const isPaymentValid = () => {
    if (allTermsUsePercentage()) {
      return Math.abs(getTotalPercentage() - 100) < 0.01;
    } else if (allTermsUseNominal()) {
      return Math.abs(getTotalPaymentAmount() - formData.contractValue) < 0.01;
    } else {
      // Mixed mode - validate that total amount matches contract value
      return Math.abs(getTotalPaymentAmount() - formData.contractValue) < 0.01;
    }
  };

  const getPaymentValidationMessage = () => {
    if (allTermsUsePercentage()) {
      const total = getTotalPercentage();
      if (Math.abs(total - 100) >= 0.01) {
        return `Total must equal 100% (currently ${total.toFixed(2)}%)`;
      }
    } else if (allTermsUseNominal()) {
      const total = getTotalPaymentAmount();
      if (Math.abs(total - formData.contractValue) >= 0.01) {
        return `Total must equal Contract Value (${formatCurrency(formData.contractValue, formData.currency)})`;
      }
    } else {
      const total = getTotalPaymentAmount();
      if (Math.abs(total - formData.contractValue) >= 0.01) {
        return `Total must equal Contract Value (${formatCurrency(formData.contractValue, formData.currency)})`;
      }
    }
    return null;
  };

  const handleSignatureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSignature(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("signature", file);

      const result = await uploadSignature(formDataUpload);

      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, signatureUrl: result.url }));
        toast({
          title: "Signature uploaded",
          description: "Signature image has been uploaded successfully.",
        });
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload signature.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signature upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading signature.",
        variant: "destructive",
      });
    } finally {
      setUploadingSignature(false);
      if (signatureInputRef.current) {
        signatureInputRef.current.value = "";
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.vendorName.trim()) {
          errors.vendorName = "Vendor name is required.";
        }
        if (!formData.vendorPhone?.trim()) {
          errors.vendorPhone = "Vendor phone is required.";
        }
        if (!formData.vendorEmail?.trim()) {
          errors.vendorEmail = "Vendor email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.vendorEmail)) {
          errors.vendorEmail = "Please enter a valid email address.";
        }
        break;
      case 2:
        if (!formData.projectName.trim()) {
          errors.projectName = "Project name is required.";
        }
        if (formData.contractValue <= 0) {
          errors.contractValue = "Contract value must be greater than 0.";
        }
        if (currencySelection === "etc" && !customCurrency.trim()) {
          errors.customCurrency = "Please provide a currency code.";
        }
        if (!formData.startDate) {
          errors.startDate = "Start date is required.";
        }
        if (!formData.endDate) {
          errors.endDate = "End date is required.";
        }
        break;
      case 3: {
        // Validate payment totals
        if (!isPaymentValid()) {
          errors.paymentTotal =
            getPaymentValidationMessage() || "Invalid payment total";
        }
        break;
      }
      case 4:
        if (!formData.picName?.trim()) {
          errors.picName = "PIC name is required.";
        }
        if (!formData.picEmail?.trim()) {
          errors.picEmail = "PIC email is required.";
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast({
        title: "Validation error",
        description: firstError,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) {
      return;
    }

    setLoading(true);

    try {
      const result = await createSPK(formData);

      if (result.success) {
        setCreatedSPK(result.data);
        if (result.vendorToken) {
          setVendorToken(result.vendorToken);
        }
        setCurrentStep(5);
      } else {
        toast({
          title: "Failed to create SPK",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "An error occurred while creating SPK.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareSPK = async () => {
    if (!createdSPK?.id || !vendorToken) return;

    try {
      // Auto-publish when sharing
      if (createdSPK.status !== "published") {
        await publishSPK(createdSPK.id, false);
        setCreatedSPK((prev: any) => ({ ...prev, status: "published" }));
      }

      const shareUrl = `${window.location.origin}/vendor?token=${vendorToken}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description:
          "Vendor dashboard link copied to clipboard. SPK has been published.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!createdSPK?.id) return;
    if (!createdSPK.vendor_email) {
      toast({
        title: "No vendor email",
        description: "Vendor email is not available.",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      // publishSPK with sendEmail=true will auto-publish and send email
      const result = await publishSPK(createdSPK.id, true);
      if (result.success) {
        setCreatedSPK((prev: any) => ({ ...prev, status: "published" }));
        toast({
          title: "Email sent",
          description: "SPK email sent to vendor. SPK has been published.",
        });
      } else {
        toast({
          title: "Failed to send email",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "An error occurred while sending email.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      {currentStep < 6 && (
        <div className="mb-8">
          <div className="flex items-center justify-between px-4 md:px-12">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
                      currentStep >= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`text-xs mt-1 ${currentStep >= step ? "text-blue-600 font-medium" : "text-gray-500"}`}
                  >
                    {step === 1
                      ? "Vendor"
                      : step === 2
                        ? "Project"
                        : step === 3
                          ? "Payment"
                          : step === 4
                            ? "PIC"
                            : "Review"}
                  </span>
                </div>
                {step < 5 && (
                  <div
                    className={`flex-1 h-1 mx-3 ${
                      currentStep > step ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Vendor Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vendor Information</h3>

            <div>
              <VendorAutocomplete
                value={formData.vendorName}
                onChange={handleVendorSelect}
                vendors={vendorHistory}
              />
              {fieldErrors.vendorName && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.vendorName}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="vendorEmail">Vendor Email *</Label>
                <Input
                  id="vendorEmail"
                  name="vendorEmail"
                  type="email"
                  value={formData.vendorEmail}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldErrors((prev) => ({ ...prev, vendorEmail: "" }));
                  }}
                  placeholder="vendor@example.com"
                  required
                />
                {fieldErrors.vendorEmail && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.vendorEmail}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="vendorPhone">Vendor Phone *</Label>
                <Input
                  id="vendorPhone"
                  name="vendorPhone"
                  value={formData.vendorPhone}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldErrors((prev) => ({ ...prev, vendorPhone: "" }));
                  }}
                  placeholder="+62-812-3456-7890"
                  required
                />
                {fieldErrors.vendorPhone && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.vendorPhone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Project & Contract Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Information</h3>

              {/* Real SPK Number Display */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      SPK Number
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      {generatedSPKNumber || "Generating..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simple Project Name Input (no history dropdown) */}
              <div>
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldErrors((prev) => ({ ...prev, projectName: "" }));
                  }}
                  placeholder="Office Renovation Phase 1"
                  required
                />
                {fieldErrors.projectName && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.projectName}
                  </p>
                )}
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contract Details</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="contractValue">Contract Value *</Label>
                  <Input
                    id="contractValue"
                    name="contractValue"
                    type="text"
                    value={contractValueDisplay}
                    onChange={handleContractValueChange}
                    onBlur={handleContractValueBlur}
                    onFocus={() => {
                      // Show raw number on focus for easier editing
                      if (formData.contractValue > 0) {
                        setContractValueDisplay(
                          formData.contractValue.toString(),
                        );
                      }
                    }}
                    required
                    placeholder="100,000,000"
                  />
                  {fieldErrors.contractValue && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.contractValue}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    id="currency"
                    name="currency"
                    value={currencySelection}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCurrencySelection(value);
                      if (value === "etc") {
                        setFormData((prev) => ({
                          ...prev,
                          currency: customCurrency || prev.currency,
                        }));
                      } else {
                        setCustomCurrency("");
                        setFormData((prev) => ({ ...prev, currency: value }));
                      }
                    }}
                    required
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {currencySelection === "etc" && (
                <div>
                  <Label htmlFor="customCurrency">Custom Currency *</Label>
                  <Input
                    id="customCurrency"
                    name="customCurrency"
                    value={customCurrency}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomCurrency(value);
                      setFormData((prev) => ({ ...prev, currency: value }));
                      setFieldErrors((prev) => ({
                        ...prev,
                        customCurrency: "",
                      }));
                    }}
                    placeholder="e.g., AUD, JPY, GBP"
                    required
                  />
                  {fieldErrors.customCurrency && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.customCurrency}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldErrors((prev) => ({ ...prev, startDate: "" }));
                    }}
                    required
                  />
                  {fieldErrors.startDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldErrors((prev) => ({ ...prev, endDate: "" }));
                    }}
                    required
                  />
                  {fieldErrors.endDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Terms */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {/* Contract Value Display at top */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Contract Value</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(formData.contractValue, formData.currency)}
                  </p>
                </div>
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment Terms</h3>
              <Button
                type="button"
                onClick={addPaymentTerm}
                size="sm"
                variant="outline"
              >
                + Add Payment Term
              </Button>
            </div>

            <div className="space-y-4">
              {formData.paymentTerms.map((term, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Payment Term {index + 1}</h4>
                      {formData.paymentTerms.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removePaymentTerm(index)}
                          size="sm"
                          variant="destructive"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor={`term-name-${index}`}>
                          Term Name *
                        </Label>
                        <Input
                          id={`term-name-${index}`}
                          value={term.term_name}
                          onChange={(e) =>
                            handlePaymentTermChange(
                              index,
                              "term_name",
                              e.target.value,
                            )
                          }
                          required
                          placeholder="e.g., Down Payment, Progress 1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`term-type-${index}`}>
                          Payment Type *
                        </Label>
                        <Select
                          id={`term-type-${index}`}
                          value={term.input_type}
                          onChange={(e) => {
                            handlePaymentTermChange(
                              index,
                              "input_type",
                              e.target.value,
                            );
                          }}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="nominal">Fixed Amount</option>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {term.input_type === "percentage" ? (
                        <div>
                          <Label htmlFor={`term-percentage-${index}`}>
                            Percentage *
                          </Label>
                          <Input
                            id={`term-percentage-${index}`}
                            type="text"
                            value={term.percentage?.toString() || ""}
                            onChange={(e) => {
                              handlePaymentTermChange(
                                index,
                                "percentage",
                                e.target.value,
                              );
                            }}
                            required
                            placeholder="e.g., 30"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Amount:{" "}
                            {formatCurrency(
                              calculatePaymentAmount(
                                formData.contractValue,
                                term.percentage || 0,
                              ),
                              formData.currency,
                            )}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor={`term-amount-${index}`}>
                            Fixed Amount *
                          </Label>
                          <Input
                            id={`term-amount-${index}`}
                            type="text"
                            value={
                              focusedPaymentInput === index
                                ? term.amount?.toString() || ""
                                : term.amount
                                  ? formatNumberWithSeparators(
                                      term.amount,
                                      formData.currency,
                                    )
                                  : ""
                            }
                            onChange={(e) => {
                              handlePaymentTermChange(
                                index,
                                "amount",
                                e.target.value,
                              );
                            }}
                            onBlur={() => {
                              setFocusedPaymentInput(null);
                            }}
                            onFocus={() => {
                              setFocusedPaymentInput(index);
                            }}
                            required
                            placeholder="e.g., 50,000,000"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor={`term-description-${index}`}>
                          Description
                        </Label>
                        <Input
                          id={`term-description-${index}`}
                          value={term.description || ""}
                          onChange={(e) =>
                            handlePaymentTermChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Payment term details..."
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Payment Summary */}
            <Card
              className={`p-4 ${isPaymentValid() ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <h4 className="font-medium mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Contract Value:</span>
                  <span className="font-medium">
                    {formatCurrency(formData.contractValue, formData.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Payment Amount:</span>
                  <span
                    className={`font-medium ${!isPaymentValid() ? "text-red-600" : ""}`}
                  >
                    {formatCurrency(getTotalPaymentAmount(), formData.currency)}
                  </span>
                </div>
                {allTermsUsePercentage() && (
                  <div className="flex justify-between">
                    <span>Total Percentage:</span>
                    <span
                      className={`font-medium ${Math.abs(getTotalPercentage() - 100) >= 0.01 ? "text-red-600" : "text-green-600"}`}
                    >
                      {getTotalPercentage().toFixed(2)}%
                    </span>
                  </div>
                )}
                {getPaymentValidationMessage() && (
                  <p className="text-red-600 text-xs mt-2 font-medium">
                    {getPaymentValidationMessage()}
                  </p>
                )}
                {isPaymentValid() && (
                  <p className="text-green-600 text-xs mt-2 font-medium">
                    Payment terms are valid
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: PIC Information */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SPK PIC Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="picName">PIC Name *</Label>
                  <Input
                    id="picName"
                    name="picName"
                    value={formData.picName}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldErrors((prev) => ({ ...prev, picName: "" }));
                    }}
                    placeholder="PIC Name"
                    required
                  />
                  {fieldErrors.picName && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.picName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="picEmail">PIC Email *</Label>
                  <Input
                    id="picEmail"
                    name="picEmail"
                    type="email"
                    value={formData.picEmail}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldErrors((prev) => ({ ...prev, picEmail: "" }));
                    }}
                    placeholder="pic@company.com"
                    required
                  />
                  {fieldErrors.picEmail && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.picEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Signature Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Signature (Optional)</h3>
              <p className="text-sm text-gray-600">
                Upload a signature image to include a QR code in the PDF for
                verification.
              </p>
              <div className="flex items-center gap-4">
                <input
                  ref={signatureInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleSignatureUpload}
                  className="hidden"
                  id="signature-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signatureInputRef.current?.click()}
                  disabled={uploadingSignature}
                >
                  {uploadingSignature ? "Uploading..." : "Upload Signature"}
                </Button>
                {formData.signatureUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">
                      Signature uploaded
                    </span>
                    <img
                      src={formData.signatureUrl}
                      alt="Signature preview"
                      className="h-12 border rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, signatureUrl: "" }))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Terms & Conditions</h3>
              <p className="text-sm text-gray-600">
                Edit the terms and conditions that will appear in the PDF.
                Changes are not saved to the database.
              </p>
              <Textarea
                id="termsAndConditions"
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleChange}
                rows={6}
                placeholder="Enter terms and conditions..."
              />
            </div>
          </div>
        )}

        {/* Step 5: Review & Summary */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review & Summary</h3>

            {/* Vendor Info Review */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Vendor Information</h4>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">Name:</span>
                  <span className="col-span-2">{formData.vendorName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">Email:</span>
                  <span className="col-span-2">{formData.vendorEmail}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">Phone:</span>
                  <span className="col-span-2">{formData.vendorPhone}</span>
                </div>
              </div>
            </Card>

            {/* Project Info Review */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Project Details</h4>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">SPK Number:</span>
                  <span className="col-span-2 text-blue-600 font-semibold">
                    {generatedSPKNumber}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">Project:</span>
                  <span className="col-span-2">{formData.projectName}</span>
                </div>
                {formData.projectDescription && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Description:</span>
                    <span className="col-span-2">
                      {formData.projectDescription}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">Contract Value:</span>
                  <span className="col-span-2">
                    {formatCurrency(formData.contractValue, formData.currency)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">Currency:</span>
                  <span className="col-span-2">{formData.currency}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">Period:</span>
                  <span className="col-span-2">
                    {formData.startDate ? formatDate(formData.startDate) : "-"}
                    {" - "}
                    {formData.endDate ? formatDate(formData.endDate) : "-"}
                  </span>
                </div>
              </div>
            </Card>

            {/* PIC Info Review */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">SPK PIC</h4>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">Name:</span>
                  <span className="col-span-2">{formData.picName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">Email:</span>
                  <span className="col-span-2">{formData.picEmail}</span>
                </div>
                {formData.signatureUrl && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Signature:</span>
                    <span className="col-span-2 text-green-600">Uploaded</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Terms Review */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Payment Terms</h4>
              <div className="space-y-3">
                {formData.paymentTerms.map((term, index) => (
                  <div key={index} className="pb-3 border-b last:border-b-0">
                    <div className="flex justify-between text-sm">
                      <span>
                        {index + 1}. {term.term_name}
                      </span>
                      <span className="font-medium">
                        {term.input_type === "percentage" &&
                        term.percentage !== null &&
                        term.percentage !== undefined
                          ? `${term.percentage}% (${formatCurrency(
                              calculatePaymentAmount(
                                formData.contractValue,
                                term.percentage || 0,
                              ),
                              formData.currency,
                            )})`
                          : formatCurrency(term.amount || 0, formData.currency)}
                      </span>
                    </div>
                    {term.description && (
                      <div className="mt-1 text-xs text-gray-600">
                        {term.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {createdSPK && (
              <Card className="p-5 border-green-200 bg-green-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      SPK Created Successfully
                    </p>
                    <p className="text-sm text-green-700">
                      SPK Number:{" "}
                      <span className="font-semibold">
                        {createdSPK.spk_number}
                      </span>
                    </p>
                    {createdSPK.status === "published" && (
                      <p className="text-xs text-green-600 mt-1">
                        Status: Published
                      </p>
                    )}
                  </div>
                </div>

                {/* Only show View SPK, Share SPK, Send to Email buttons */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreviewModal(true)}
                  >
                    View SPK
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleShareSPK}
                    disabled={!vendorToken}
                  >
                    Share SPK
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={sendingEmail || !createdSPK.vendor_email}
                  >
                    {sendingEmail ? "Sending..." : "Send to Email"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="flex gap-4 pt-4 border-t">
            {currentStep > 1 && !createdSPK && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                Previous
              </Button>
            )}

            {currentStep < 4 && (
              <Button
                type="button"
                onClick={nextStep}
                disabled={loading || (currentStep === 3 && !isPaymentValid())}
                className="flex-1"
              >
                Next
              </Button>
            )}

            {currentStep === 4 && (
              <Button
                type="submit"
                disabled={loading || Boolean(createdSPK)}
                className="flex-1"
              >
                {loading ? "Submitting..." : "Confirm & Submit"}
              </Button>
            )}

            {/* Step 5 has no navigation buttons other than the action buttons in the success card */}
          </div>
        )}
      </form>

      {/* PDF Preview Modal */}
      {showPreviewModal && createdSPK && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview PDF</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <p className="text-center text-gray-600 mb-4">
                {createdSPK.spk_number} is ready for download
              </p>

              <div className="bg-gray-50 border-2 border-dashed rounded-lg p-4 mb-6">
                <iframe
                  src={`/api/pdf/${createdSPK.id}?preview=true&terms=${encodeURIComponent(formData.termsAndConditions || "")}`}
                  className="w-full h-[600px] border-0 rounded"
                  title="PDF Preview"
                />
              </div>
            </div>

            <div className="p-4 border-t flex gap-3 justify-center">
              <Button
                onClick={() => setShowPreviewModal(false)}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `/api/pdf/${createdSPK.id}?terms=${encodeURIComponent(formData.termsAndConditions || "")}`;
                  link.download = `SPK-${createdSPK.spk_number}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setShowPreviewModal(false);
                }}
                className="bg-black hover:bg-gray-800 text-white px-8"
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
