"use client";

import { createSPK, publishSPK } from "@/app/actions/spk";
import { getProjectHistory } from "@/app/actions/project";
import { getVendorHistory } from "@/app/actions/vendor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProjectAutocomplete } from "@/components/project-autocomplete";
import { VendorAutocomplete } from "@/components/vendor-autocomplete";
import { CreateSPKFormData, CURRENCIES, PaymentTerm } from "@/lib/types";
import {
  calculatePaymentAmount,
  formatCurrency,
  formatDate,
  validatePaymentPercentages,
} from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SPKCreateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorHistory, setVendorHistory] = useState<any[]>([]);
  const [projectHistory, setProjectHistory] = useState<any[]>([]);
  const [createdSPK, setCreatedSPK] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [currencySelection, setCurrencySelection] = useState<string>("IDR");
  const [customCurrency, setCustomCurrency] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
        due_date: "",
      },
    ],
    notes: "",
  });

  useEffect(() => {
    async function loadHistory() {
      const [vendorResult, projectResult] = await Promise.all([
        getVendorHistory(),
        getProjectHistory(),
      ]);
      if (vendorResult.success && vendorResult.data) {
        setVendorHistory(vendorResult.data);
      }
      if (projectResult.success && projectResult.data) {
        setProjectHistory(projectResult.data);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    if (formData.currency && !CURRENCIES.includes(formData.currency as any)) {
      setCurrencySelection("etc");
      setCustomCurrency(formData.currency);
    } else {
      setCurrencySelection(formData.currency || "IDR");
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
      [name]: name === "contractValue" ? parseFloat(value) || 0 : value,
    }));
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

  const handleProjectSelect = (project: any) => {
    setFormData((prev) => ({
      ...prev,
      projectName: project.project_name,
      projectDescription: project.project_description || "",
    }));
    setFieldErrors((prev) => ({ ...prev, projectName: "" }));
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
      term.percentage = parseFloat(value as string) || 0;
      term.amount = calculatePaymentAmount(
        formData.contractValue,
        term.percentage,
      );
    } else if (field === "amount") {
      term.amount = parseFloat(value as string) || 0;
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
          due_date: "",
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
        const validation = validatePaymentPercentages(
          formData.paymentTerms.map((t) => t.percentage),
        );
        if (!validation.valid) {
          errors.paymentPercentage = `Total percentage is ${validation.total}%. Must not exceed 100%.`;
          toast({
            title: "Invalid payment terms",
            description: errors.paymentPercentage,
            variant: "destructive",
          });
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

  const getTotalPaymentAmount = () => {
    return formData.paymentTerms.reduce((sum, term) => sum + term.amount, 0);
  };

  const getTotalPercentage = () => {
    return formData.paymentTerms.reduce(
      (sum, term) => sum + (term.percentage || 0),
      0,
    );
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      {currentStep < 6 && (
        <div className="mb-8">
          <div className="flex items-center justify-between px-4 md:px-12">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
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
                  <span className={`text-xs mt-1 ${currentStep >= step ? "text-blue-600 font-medium" : "text-gray-500"}`}>
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
                <p className="text-sm text-red-600 mt-1">{fieldErrors.vendorName}</p>
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
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.vendorEmail}</p>
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
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.vendorPhone}</p>
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

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">SPK Number</p>
                    <p className="text-xs text-blue-600">Will be auto-generated as No. ELX/SPK/YYYYMMDD/###</p>
                  </div>
                </div>
              </div>

              <div>
                <ProjectAutocomplete
                  value={formData.projectName}
                  onChange={handleProjectSelect}
                  projects={projectHistory}
                />
                {fieldErrors.projectName && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.projectName}</p>
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
                    type="number"
                    value={formData.contractValue}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldErrors((prev) => ({ ...prev, contractValue: "" }));
                    }}
                    required
                    min="0"
                    step="0.01"
                    placeholder="100000000"
                  />
                  {fieldErrors.contractValue && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.contractValue}</p>
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
                      setFieldErrors((prev) => ({ ...prev, customCurrency: "" }));
                    }}
                    placeholder="e.g., AUD, JPY, GBP"
                    required
                  />
                  {fieldErrors.customCurrency && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.customCurrency}</p>
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
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.startDate}</p>
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
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.endDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Terms */}
        {currentStep === 3 && (
          <div className="space-y-4">
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
                          value={term.percentage ? "percentage" : "amount"}
                          onChange={(e) => {
                            const isPercentage =
                              e.target.value === "percentage";
                            handlePaymentTermChange(
                              index,
                              "percentage",
                              isPercentage ? 0 : undefined,
                            );
                          }}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="nominal">Fixed Amount</option>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {term.percentage !== null ? (
                        <div>
                          <Label htmlFor={`term-percentage-${index}`}>
                            Percentage *
                          </Label>
                          <Input
                            id={`term-percentage-${index}`}
                            type="number"
                            value={term.percentage}
                            onChange={(e) =>
                              handlePaymentTermChange(
                                index,
                                "percentage",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            required
                            min="0"
                            max="100"
                            step="0.01"
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
                            type="number"
                            value={term.amount || ""}
                            onChange={(e) =>
                              handlePaymentTermChange(
                                index,
                                "amount",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor={`term-due-date-${index}`}>
                          Due Date *
                        </Label>
                        <Input
                          id={`term-due-date-${index}`}
                          type="date"
                          value={term.due_date}
                          onChange={(e) =>
                            handlePaymentTermChange(
                              index,
                              "due_date",
                              e.target.value,
                            )
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`term-description-${index}`}>
                        Description
                      </Label>
                      <Textarea
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
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Payment Summary */}
            <Card className="p-4 bg-gray-50">
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
                  <span className="font-medium">
                    {formatCurrency(getTotalPaymentAmount(), formData.currency)}
                  </span>
                </div>
                {getTotalPercentage() > 0 && (
                  <div className="flex justify-between">
                    <span>Total Percentage:</span>
                    <span
                      className={
                        getTotalPercentage() > 100
                          ? "font-medium text-red-600"
                          : "font-medium"
                      }
                    >
                      {getTotalPercentage().toFixed(2)}%
                    </span>
                  </div>
                )}
                {getTotalPercentage() > 100 && (
                  <p className="text-red-600 text-xs mt-2">
                    Warning: Total percentage exceeds 100%
                  </p>
                )}
              </div>
            </Card>

            <div className="pt-2">
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
          </div>
        )}

        {/* Step 4: PIC Information */}
        {currentStep === 4 && (
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
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.picName}</p>
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
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.picEmail}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Additional Notes */}
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
                  <span className="col-span-2 text-blue-600 italic">Auto-generated (No. ELX/SPK/YYYYMMDD/###)</span>
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
                    {formData.startDate
                      ? formatDate(formData.startDate)
                      : "-"}
                    {" - "}
                    {formData.endDate
                      ? formatDate(formData.endDate)
                      : "-"}
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
                        {term.percentage !== null &&
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
                    <div className="mt-1 text-xs text-gray-600 flex justify-between">
                      <span>
                        Due:{" "}
                        {term.due_date ? formatDate(term.due_date) : "-"}
                      </span>
                      <span>
                        {term.description?.trim() ? term.description : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Additional Notes</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {formData.notes?.trim() || "No additional notes."}
              </p>
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
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    Edit SPK
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!createdSPK?.id) return;
                      if (!confirm("Publish this SPK now?")) return;
                      setPublishing(true);
                      try {
                        const result = await publishSPK(createdSPK.id, false);
                        if (result.success) {
                          setCreatedSPK(result.data);
                          toast({
                            title: "SPK published",
                            description: "SPK published successfully.",
                          });
                        } else {
                          toast({
                            title: "Failed to publish SPK",
                            description: result.error || "Please try again.",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        console.error(error);
                        toast({
                          title: "Something went wrong",
                          description: "An error occurred while publishing SPK.",
                          variant: "destructive",
                        });
                      } finally {
                        setPublishing(false);
                      }
                    }}
                    disabled={publishing || createdSPK.status === "published"}
                  >
                    {publishing ? "Publishing..." : "Publish SPK"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!createdSPK?.id) return;
                      if (!createdSPK.vendor_email) {
                        toast({
                          title: "No vendor email",
                          description: "Vendor email is not available.",
                          variant: "destructive",
                        });
                        return;
                      }
                      if (!confirm("Send SPK email to vendor now?")) return;
                      setSendingEmail(true);
                      try {
                        const result = await publishSPK(createdSPK.id, true);
                        if (result.success) {
                          setCreatedSPK(result.data);
                          toast({
                            title: "Email sent",
                            description: "SPK email sent to vendor.",
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
                    }}
                    disabled={
                      sendingEmail ||
                      !createdSPK.vendor_email ||
                      createdSPK.status === "published"
                    }
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>

                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                    >
                      Share Link
                    </Button>
                    {showShareMenu && (
                      <div className="absolute top-full mt-2 w-64 bg-white border rounded-lg shadow-lg p-3 z-10">
                        <p className="text-xs text-gray-600 mb-2">
                          Share this link with vendor
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={`${window.location.origin}/vendor?spkId=${createdSPK.id}`}
                            readOnly
                            className="flex-1 px-3 py-2 border rounded text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/vendor?spkId=${createdSPK.id}`,
                              );
                              toast({
                                title: "Link copied",
                                description: "Share link copied to clipboard.",
                              });
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreviewModal(true)}
                  >
                    Preview PDF
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/spk/${createdSPK.id}`)}
                  >
                    View SPK Details
                  </Button>

                  <Button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Navigation Buttons - Only show for steps 1-5 */}
        {currentStep < 6 && (
          <div className="flex gap-4 pt-4 border-t">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                {currentStep === 5 ? "Back" : "Previous"}
              </Button>
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || Boolean(createdSPK)}
                className="flex-1"
              >
                {createdSPK
                  ? "Submitted"
                  : loading
                    ? "Submitting..."
                    : "Confirm & Submit"}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={loading}
            >
              Cancel
            </Button>
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
                Invoice no. {createdSPK.spk_number} is ready for download
              </p>

              {/* PDF Preview Area */}
              <div className="bg-gray-50 border-2 border-dashed rounded-lg p-4 mb-6">
                <iframe
                  src={`/api/pdf/${createdSPK.id}?preview=true`}
                  className="w-full h-[600px] border-0 rounded"
                  title="PDF Preview"
                />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="removeQR" className="rounded" />
                <label htmlFor="removeQR" className="text-sm text-gray-700">
                  Remove QR Code
                </label>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3 justify-center">
              <Button
                onClick={() => setShowPreviewModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Create a temporary link to trigger download
                  const link = document.createElement("a");
                  link.href = `/api/pdf/${createdSPK.id}`;
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
