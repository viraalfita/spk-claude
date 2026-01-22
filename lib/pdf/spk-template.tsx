import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { SPKWithPayments } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2pt solid #333",
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    borderBottom: "1pt solid #ddd",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "40%",
    color: "#666",
  },
  value: {
    width: "60%",
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #ddd",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
  },
  tableCol: {
    width: "25%",
  },
  contractValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 5,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: "1pt solid #ddd",
    paddingTop: 15,
    fontSize: 9,
    color: "#666",
  },
});

interface SPKPDFTemplateProps {
  spk: SPKWithPayments;
}

export function SPKPDFTemplate({ spk }: SPKPDFTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SURAT PERINTAH KERJA (SPK)</Text>
          <Text style={styles.subtitle}>Work Order Document</Text>
          <View style={{ marginTop: 10 }}>
            <Text>No: {spk.spk_number}</Text>
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
              <Text style={styles.tableCol}>Status</Text>
            </View>
            {spk.payments.map((payment, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol}>
                  {payment.term === "dp"
                    ? "Down Payment"
                    : payment.term === "progress"
                    ? "Progress Payment"
                    : "Final Payment"}
                </Text>
                <Text style={styles.tableCol}>{payment.percentage}%</Text>
                <Text style={styles.tableCol}>
                  {formatCurrency(payment.amount, spk.currency)}
                </Text>
                <Text style={styles.tableCol}>
                  {payment.status.toUpperCase()}
                </Text>
              </View>
            ))}
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
          <Text style={{ lineHeight: 1.5 }}>
            This Work Order (SPK) is a binding agreement between the company and
            the vendor. The vendor agrees to complete the work as specified within
            the agreed timeline and budget. Payment will be released according to
            the payment terms outlined above upon completion of each milestone.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ width: "45%" }}>
              <Text>Authorized By:</Text>
              <Text style={{ marginTop: 40, borderTop: "1pt solid #333", paddingTop: 5 }}>
                Company Representative
              </Text>
            </View>
            <View style={{ width: "45%" }}>
              <Text>Acknowledged By:</Text>
              <Text style={{ marginTop: 40, borderTop: "1pt solid #333", paddingTop: 5 }}>
                Vendor Representative
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated on {formatDate(new Date().toISOString())} • SPK Creator System
          </Text>
        </View>
      </Page>
    </Document>
  );
}
