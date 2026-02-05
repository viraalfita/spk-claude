import { DEFAULT_TERMS_AND_CONDITIONS, SPKPDFData } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 15,
    borderBottom: "1.5pt solid #333",
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
    borderBottom: "0.5pt solid #ddd",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: "40%",
    color: "#666",
    fontSize: 8,
  },
  value: {
    width: "60%",
    fontWeight: "bold",
    fontSize: 9,
  },
  table: {
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #ddd",
    paddingVertical: 4,
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableCol: {
    width: "33.33%",
    fontSize: 8,
  },
  contractValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: "0.5pt solid #ddd",
    paddingTop: 8,
    fontSize: 7,
    color: "#666",
  },
  termsText: {
    lineHeight: 1.3,
    fontSize: 8,
  },
  picInfoContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  picInfoText: {
    flex: 1,
  },
  picLabel: {
    fontSize: 7,
    color: "#666",
  },
  picName: {
    fontSize: 9,
    fontWeight: "bold",
  },
  qrBox: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#ddd",
    borderRadius: 3,
    padding: 3,
  },
  qrImage: {
    width: 42,
    height: 42,
  },
  qrLabel: {
    fontSize: 6,
    color: "#666",
    marginTop: 1,
    textAlign: "center",
  },
});

interface SPKPDFTemplateProps {
  spk: SPKPDFData;
}

export function SPKPDFTemplate({ spk }: SPKPDFTemplateProps) {
  const termsAndConditions =
    spk.termsAndConditions || DEFAULT_TERMS_AND_CONDITIONS;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SURAT PERINTAH KERJA (SPK)</Text>
          <Text style={styles.subtitle}>Work Order Document</Text>
          <View style={{ marginTop: 10 }}>
            <Text>No. {spk.spk_number}</Text>
            <Text>Date: {formatDate(spk.created_at)}</Text>
          </View>
        </View>

        {/* Vendor Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VENDOR INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Vendor Name:</Text>
            <Text style={styles.value}>{spk.vendor_name}</Text>
          </View>
          {spk.vendor_email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{spk.vendor_email}</Text>
            </View>
          )}
          {spk.vendor_phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{spk.vendor_phone}</Text>
            </View>
          )}
        </View>

        {/* Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROJECT DETAILS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Project Name:</Text>
            <Text style={styles.value}>{spk.project_name}</Text>
          </View>
          {spk.project_description && (
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{spk.project_description}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{formatDate(spk.start_date)}</Text>
          </View>
          {spk.end_date && (
            <View style={styles.row}>
              <Text style={styles.label}>End Date:</Text>
              <Text style={styles.value}>{formatDate(spk.end_date)}</Text>
            </View>
          )}
        </View>

        {/* Contract Value */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTRACT VALUE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Value:</Text>
            <Text style={styles.contractValue}>
              {formatCurrency(spk.contract_value, spk.currency)}
            </Text>
          </View>
        </View>

        {/* Payment Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT TERMS</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCol}>Payment Term</Text>
              <Text style={styles.tableCol}>Percentage</Text>
              <Text style={styles.tableCol}>Amount</Text>
            </View>
            {spk.payments.map((payment, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol}>{payment.term_name}</Text>
                <Text style={styles.tableCol}>
                  {payment.percentage != null ? `${payment.percentage}%` : "-"}
                </Text>
                <Text style={styles.tableCol}>
                  {formatCurrency(payment.amount, spk.currency)}
                </Text>
              </View>
            ))}
            {/* Total Row */}
            <View
              style={[
                styles.tableRow,
                { borderTop: "2pt solid #333", borderBottom: "none" },
              ]}
            >
              <Text style={[styles.tableCol, { fontWeight: "bold" }]}>
                Total
              </Text>
              <Text style={styles.tableCol}></Text>
              <Text style={[styles.tableCol, { fontWeight: "bold" }]}>
                {formatCurrency(
                  spk.payments.reduce((sum, p) => sum + p.amount, 0),
                  spk.currency,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {spk.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text>{spk.notes}</Text>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TERMS AND CONDITIONS</Text>
          <Text style={styles.termsText}>{termsAndConditions}</Text>
        </View>

        {/* PIC Information with QR Code */}
        <View style={styles.picInfoContainer}>
          <View style={styles.picInfoText}>
            <Text style={styles.picLabel}>Created By (PIC)</Text>
            <Text style={styles.picName}>{spk.created_by}</Text>
            {spk.created_by_email && (
              <Text style={styles.picLabel}>{spk.created_by_email}</Text>
            )}
          </View>

          {/* QR Code aligned to the right */}
          {spk.signatureQRDataUrl && (
            <View style={styles.qrBox}>
              <Image style={styles.qrImage} src={spk.signatureQRDataUrl} />
              <Text style={styles.qrLabel}>Signature</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated on {formatDate(new Date().toISOString())} • SPK Creator
            System
          </Text>
        </View>
      </Page>
    </Document>
  );
}
