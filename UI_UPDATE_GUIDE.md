# UI Components Update Guide

## Summary

Semua backend implementation sudah selesai 100%. Yang masih perlu diupdate adalah UI components untuk mendukung dynamic payment terms dan features baru lainnya.

---

## ✅ Yang Sudah Selesai

### Backend (Complete)

1. ✅ Database schema dengan dynamic payments
2. ✅ Server actions (spk.ts & payment.ts) sudah support dynamic payments
3. ✅ Type definitions (types.ts) sudah lengkap
4. ✅ Email & Slack integrations sudah ready
5. ✅ Multi-currency support sudah ada
6. ✅ Utils functions (formatCurrency, calculatePaymentAmount, validatePaymentPercentages)

### UI Components

1. ✅ `components/ui/select.tsx` - Sudah dibuat untuk dropdown selector

---

## 🚧 Yang Perlu Diupdate

### 1. SPK Create Form (`components/spk-create-form.tsx`)

**Current State:** Form masih menggunakan fixed 3-payment structure (DP, Progress, Final)

**What Needs to Change:**

#### A. Update Initial State

```typescript
// OLD
const [formData, setFormData] = useState<CreateSPKFormData>({
  vendorName: "",
  // ...
  dpPercentage: 30,
  progressPercentage: 40,
  finalPercentage: 30,
  notes: "",
});

// NEW
const [formData, setFormData] = useState<CreateSPKFormData>({
  spkNumber: "", // Add this
  vendorName: "",
  // ...
  paymentTerms: [
    // Replace fixed percentages with dynamic array
    {
      term_name: "Down Payment",
      term_order: 1,
      amount: 0,
      percentage: 30,
      input_type: "percentage",
      due_date: "",
    },
  ],
  notes: "",
});
```

#### B. Add Step Navigation

```typescript
const [currentStep, setCurrentStep] = useState(1);

const nextStep = () => {
  if (validateStep(currentStep)) {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }
};

const prevStep = () => {
  setCurrentStep((prev) => Math.max(prev - 1, 1));
};
```

#### C. Add Payment Term Handlers

```typescript
const handlePaymentTermChange = (
  index: number,
  field: keyof PaymentTerm,
  value: string | number,
) => {
  const newPaymentTerms = [...formData.paymentTerms];
  const term = { ...newPaymentTerms[index] };

  if (field === "input_type") {
    term.input_type = value as "percentage" | "amount";
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
    alert("At least one payment term is required");
    return;
  }

  const newPaymentTerms = formData.paymentTerms
    .filter((_, i) => i !== index)
    .map((term, i) => ({ ...term, term_order: i + 1 }));

  setFormData((prev) => ({ ...prev, paymentTerms: newPaymentTerms }));
};
```

#### D. Update Form Structure

**Add Step Indicator:**

```tsx
{
  /* Step Indicator */
}
<div className="flex justify-between mb-8">
  {[1, 2, 3, 4].map((step) => (
    <div
      key={step}
      className={`flex-1 ${step !== 4 ? "border-b-2" : ""} ${
        currentStep >= step
          ? "border-blue-500 text-blue-600"
          : "border-gray-300 text-gray-400"
      } pb-2 text-center`}
    >
      <div className="text-sm font-medium">
        {step === 1 && "Vendor Info"}
        {step === 2 && "Project Details"}
        {step === 3 && "Payment Terms"}
        {step === 4 && "Review"}
      </div>
    </div>
  ))}
</div>;
```

**Step 2 - Add SPK Number Field:**

```tsx
<div>
  <Label htmlFor="spkNumber">SPK Number (Optional)</Label>
  <Input
    id="spkNumber"
    name="spkNumber"
    value={formData.spkNumber}
    onChange={handleChange}
    placeholder="Auto-generated if left empty"
  />
  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
</div>
```

**Step 2 - Add Currency Selector:**

```tsx
<div>
  <Label htmlFor="currency">Currency</Label>
  <Select
    id="currency"
    name="currency"
    value={formData.currency}
    onChange={handleChange}
  >
    {CURRENCY_OPTIONS.map((curr) => (
      <option key={curr.code} value={curr.code}>
        {curr.code} - {curr.name}
      </option>
    ))}
  </Select>
</div>
```

**Step 3 - Replace Fixed Payment Fields:**

```tsx
{
  /* Payment Terms - Dynamic Array */
}
{
  currentStep === 3 && (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment Terms</h3>
        <Button type="button" onClick={addPaymentTerm} variant="outline">
          + Add Term
        </Button>
      </div>

      <div className="space-y-4">
        {formData.paymentTerms.map((term, index) => (
          <Card key={index} className="p-4 border-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">
                  Payment Term {index + 1}
                </Label>
                {formData.paymentTerms.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removePaymentTerm(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor={`term-name-${index}`}>Term Name</Label>
                <Input
                  id={`term-name-${index}`}
                  value={term.term_name}
                  onChange={(e) =>
                    handlePaymentTermChange(index, "term_name", e.target.value)
                  }
                  placeholder="e.g., Down Payment, Progress 1"
                />
              </div>

              <div>
                <Label htmlFor={`input-type-${index}`}>Input Type</Label>
                <Select
                  id={`input-type-${index}`}
                  value={term.input_type}
                  onChange={(e) =>
                    handlePaymentTermChange(index, "input_type", e.target.value)
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="amount">Fixed Amount</option>
                </Select>
              </div>

              {term.input_type === "percentage" ? (
                <div>
                  <Label htmlFor={`percentage-${index}`}>Percentage (%)</Label>
                  <Input
                    id={`percentage-${index}`}
                    type="number"
                    step="0.01"
                    max="100"
                    value={term.percentage || 0}
                    onChange={(e) =>
                      handlePaymentTermChange(
                        index,
                        "percentage",
                        e.target.value,
                      )
                    }
                    placeholder="30"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Amount: {formatCurrency(term.amount, formData.currency)}
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor={`amount-${index}`}>Amount</Label>
                  <Input
                    id={`amount-${index}`}
                    type="number"
                    step="0.01"
                    value={term.amount}
                    onChange={(e) =>
                      handlePaymentTermChange(index, "amount", e.target.value)
                    }
                    placeholder="30000000"
                  />
                </div>
              )}

              <div>
                <Label htmlFor={`due-date-${index}`}>Due Date</Label>
                <Input
                  id={`due-date-${index}`}
                  type="date"
                  value={term.due_date || ""}
                  onChange={(e) =>
                    handlePaymentTermChange(index, "due_date", e.target.value)
                  }
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment Summary */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold mb-2">Payment Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Contract Value:</span>
            <span className="font-semibold">
              {formatCurrency(formData.contractValue, formData.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Payment Terms:</span>
            <span className="font-semibold">
              {formatCurrency(getTotalPaymentAmount(), formData.currency)}
            </span>
          </div>
          {formData.paymentTerms.some((t) => t.input_type === "percentage") && (
            <div className="flex justify-between">
              <span>Total Percentage:</span>
              <span
                className={`font-semibold ${getTotalPercentage() > 100 ? "text-red-600" : ""}`}
              >
                {getTotalPercentage().toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
```

**Step 4 - Review Screen:**

```tsx
{
  currentStep === 4 && (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Review SPK Details</h3>

      <Card className="p-4">
        <h4 className="font-semibold mb-2">Payment Terms</h4>
        <div className="space-y-2">
          {formData.paymentTerms.map((term, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm border-b pb-2"
            >
              <div>
                <p className="font-medium">{term.term_name}</p>
                {term.due_date && (
                  <p className="text-xs text-gray-500">Due: {term.due_date}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(term.amount, formData.currency)}
                </p>
                {term.percentage && (
                  <p className="text-xs text-gray-500">{term.percentage}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

#### E. Update Imports

```typescript
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { CreateSPKFormData, CURRENCY_OPTIONS, PaymentTerm } from "@/lib/types";
import {
  calculatePaymentAmount,
  formatCurrency,
  validatePaymentPercentages,
} from "@/lib/utils";
```

---

### 2. Publish SPK Button (`components/publish-spk-button.tsx`)

**What Needs to Change:**

#### Update publishSPK Call

```typescript
// OLD
const result = await publishSPK(spkId);

// NEW - Add email option
const result = await publishSPK(spkId, sendEmail);
```

#### Add Email Toggle (Optional)

```tsx
export function PublishSPKButton({
  spkId,
  vendorEmail,
}: {
  spkId: string;
  vendorEmail?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(!!vendorEmail);

  const handlePublish = async () => {
    if (
      !confirm(
        "Publish this SPK? Slack notification will be sent automatically.",
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const result = await publishSPK(spkId, sendEmail);

      if (result.success) {
        alert(
          `SPK published successfully! ${sendEmail ? "Email sent to vendor." : ""}`,
        );
        router.refresh();
      } else {
        alert(result.error || "Failed to publish SPK");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {vendorEmail && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="send-email"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          <label htmlFor="send-email" className="text-sm">
            Send email to vendor ({vendorEmail})
          </label>
        </div>
      )}
      <Button onClick={handlePublish} disabled={loading}>
        {loading ? "Publishing..." : "Publish SPK"}
      </Button>
    </div>
  );
}
```

---

### 3. Payment Status Update (`components/payment-status-update.tsx`)

**What Needs to Change:**

#### Update to use term_name instead of term

```typescript
// The component should already work, but verify it displays term_name correctly

// Display payment info
<div className="space-y-2">
  <p className="font-semibold">{payment.term_name}</p>  {/* Change from payment.term */}
  <p className="text-sm text-gray-600">
    {formatCurrency(payment.amount, "IDR")}  {/* Use formatCurrency */}
  </p>
  {payment.percentage && (
    <p className="text-xs text-gray-500">
      {payment.percentage}%
    </p>
  )}
</div>
```

#### Add sendEmail option

```typescript
// Add to UpdatePaymentFormData
const formData = {
  paymentId: payment.id,
  status: "paid" as const,
  paidDate,
  paymentReference,
  sendEmail: false, // Add this - can make it a checkbox
};
```

---

### 4. SPK Detail Page (`app/dashboard/spk/[id]/page.tsx`)

**What Needs to Change:**

#### Display Dynamic Payment Terms

```tsx
{
  /* Replace fixed DP/Progress/Final display */
}
<div className="space-y-2">
  <h3 className="font-semibold">Payment Terms</h3>
  {spk.payments.map((payment, index) => (
    <Card key={payment.id} className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{payment.term_name}</p> {/* Not term */}
          {payment.due_date && (
            <p className="text-xs text-gray-500">Due: {payment.due_date}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {formatCurrency(payment.amount, spk.currency)}{" "}
            {/* Use multi-currency */}
          </p>
          {payment.percentage && (
            <p className="text-xs text-gray-500">{payment.percentage}%</p>
          )}
          <Badge>{payment.status}</Badge>
        </div>
      </div>

      {/* Payment Status Update Component */}
      {spk.status === "published" && payment.status === "pending" && (
        <PaymentStatusUpdate payment={payment} />
      )}
    </Card>
  ))}
</div>;
```

#### Use formatCurrency for all amounts

```tsx
import { formatCurrency } from "@/lib/utils";

// Replace all instances like:
// <span>Rp {spk.contract_value.toLocaleString("id-ID")}</span>

// With:
<span>{formatCurrency(spk.contract_value, spk.currency)}</span>;
```

---

### 5. Dashboard Page (`app/dashboard/page.tsx`)

**What Needs to Change:**

#### Update SPK list display

```tsx
{
  /* In SPK list card */
}
<div>
  <p className="text-sm text-gray-600">
    {formatCurrency(spk.contract_value, spk.currency)} {/* Multi-currency */}
  </p>
  <p className="text-xs text-gray-500">
    {spk.payments?.length || 0} payment terms {/* Dynamic count */}
  </p>
</div>;
```

---

## 🎨 New UI Components Needed

### 1. Checkbox Component (`components/ui/checkbox.tsx`)

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
```

---

## 📋 Testing Checklist

After updating UI components:

### Create SPK Flow

- [ ] Can navigate through 4 steps
- [ ] Can add multiple payment terms
- [ ] Can remove payment terms (min 1)
- [ ] Can switch between percentage and fixed amount
- [ ] Percentage auto-calculates amount
- [ ] Total percentage validation works (max 100%)
- [ ] Currency selector works
- [ ] SPK number can be empty (auto-generate) or custom
- [ ] Review screen shows all data correctly
- [ ] Create button works and redirects to dashboard

### Publish SPK

- [ ] Can publish draft SPK
- [ ] Slack notification sent
- [ ] Optional email toggle works
- [ ] Status changes to "published"

### Payment Updates

- [ ] Can mark payment as paid
- [ ] Payment details display correctly (term_name, amount, percentage)
- [ ] Slack notification sent
- [ ] Optional email works

### Display

- [ ] SPK detail page shows dynamic payment terms
- [ ] All currency formatting correct
- [ ] Payment badges show correct status
- [ ] Dashboard list shows correct info

---

## 🚀 Quick Start

1. **Install dependencies** (if not done):

   ```bash
   npm install
   ```

2. **Copy the code snippets above** into respective files

3. **Test locally**:

   ```bash
   npm run dev
   ```

4. **Create test SPK** with different payment structures:
   - 2 terms (50/50)
   - 3 terms (standard)
   - 5 terms (milestone-based)

5. **Verify** all features work as expected

---

## 📚 Reference Files

- **Backend**: All done, check [IMPLEMENTATION_CHANGES.md](IMPLEMENTATION_CHANGES.md)
- **Types**: [lib/types.ts](lib/types.ts) - All interfaces ready
- **Utils**: [lib/utils.ts](lib/utils.ts) - formatCurrency, calculatePaymentAmount, validatePaymentPercentages
- **Actions**: [app/actions/spk.ts](app/actions/spk.ts) & [app/actions/payment.ts](app/actions/payment.ts)

---

**Status:** Backend ✅ Complete | UI 🚧 Needs Update  
**Priority:** HIGH - Form component is critical for creating new SPKs  
**Estimated Time:** 2-3 hours for full UI update
