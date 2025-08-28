import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate a PDF receipt for a donation
 * @param {Object} donation - The donation object
 */
export const generateDonationReceipt = (donation) => {
  // Initialize jsPDF
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({
    title: `Donation Receipt - ${donation.receiptNumber || "Receipt"}`,
    subject: "Donation Receipt",
    author: "Pet Adoption Platform",
    keywords: "donation, receipt, pet adoption",
    creator: "Pet Adoption Platform",
  });

  // Add logo - this would be an actual image in production
  // doc.addImage(logoUrl, 'PNG', 15, 15, 30, 30);

  // Add title
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80); // Dark blue color
  doc.text("Donation Receipt", 105, 30, { align: "center" });

  // Add receipt number and date
  doc.setFontSize(12);
  doc.setTextColor(52, 73, 94); // Slightly lighter blue

  const receiptNumber = donation.receiptNumber || `RCP-${Date.now()}`;
  const date = donation.createdAt || donation.date || new Date().toISOString();
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.text(`Receipt Number: ${receiptNumber}`, 15, 45);
  doc.text(`Date: ${formattedDate}`, 15, 52);

  // Add organization info
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Pet Adoption Center", 15, 65);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text("123 Pet Street, Colombo", 15, 72);
  doc.text("Sri Lanka", 15, 78);
  doc.text("Email: info@petadoption.org", 15, 84);
  doc.text("Tel: +94 11 123 4567", 15, 90);

  // Add donor info
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Donor Information", 15, 105);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Name: ${donation.donor || "Anonymous"}`, 15, 115);
  doc.text(`Email: ${donation.email || "N/A"}`, 15, 122);

  // Add donation details
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Donation Details", 15, 135);

  const purpose = donation.purpose || "General Support";
  const amount =
    typeof donation.amount === "number"
      ? `LKR ${donation.amount.toLocaleString()}`
      : `LKR ${parseFloat(donation.amount || 0).toLocaleString()}`;

  // Add donation table
  autoTable(doc, {
    startY: 140,
    head: [["Description", "Amount"]],
    body: [
      [`Donation for ${purpose}`, amount],
      ["Transaction Fee", "LKR 0.00"],
      ["Total Donation", amount],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185], // Blue header
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { left: 15, right: 15 },
  });

  // Get the final Y position after the table
  const finalY = doc.lastAutoTable.finalY || 200;

  // Add thank you message
  const yPos = finalY + 15;

  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Thank You for Your Support!", 105, yPos, { align: "center" });

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(
    "Your generous donation helps us provide food, shelter, and medical care to animals in need.",
    105,
    yPos + 10,
    { align: "center", maxWidth: 170 }
  );

  // Add donation message if available
  if (donation.message) {
    doc.setFontSize(10);
    doc.setFont(undefined, "italic");
    doc.text("Your message:", 15, yPos + 25);
    doc.text(donation.message, 15, yPos + 32, { maxWidth: 180 });
  }

  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    "This receipt is computer-generated and does not require a signature.",
    105,
    pageHeight - 20,
    { align: "center" }
  );
  doc.text(
    "Pet Adoption Center is a registered non-profit organization.",
    105,
    pageHeight - 15,
    { align: "center" }
  );

  // Save the PDF with name based on receipt number
  const fileName = `donation-receipt-${receiptNumber
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase()}.pdf`;
  doc.save(fileName);
};

/**
 * Generate a monthly donation report for administrators
 * @param {Array} donations - List of donations for the reporting period
 * @param {Object} options - Report options (title, date range, etc.)
 */
export const generateDonationReport = (donations, options = {}) => {
  const {
    title = "Donation Report",
    startDate,
    endDate,
    preparedBy = "Administrator",
  } = options;

  // Initialize jsPDF
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({
    title: title,
    subject: "Donation Report",
    author: "Pet Adoption Platform",
    keywords: "donation, report, pet adoption",
    creator: "Pet Adoption Platform",
  });

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text(title, 105, 20, { align: "center" });

  // Add date range
  let dateText = "All Donations";
  if (startDate && endDate) {
    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    dateText = `${formatDate(startDate)} to ${formatDate(endDate)}`;
  } else if (startDate) {
    dateText = `From ${new Date(startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;
  } else if (endDate) {
    dateText = `Until ${new Date(endDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;
  }

  doc.setFontSize(12);
  doc.text(`Period: ${dateText}`, 105, 30, { align: "center" });
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    105,
    38,
    { align: "center" }
  );

  // Calculate summary statistics
  const totalAmount = donations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );
  const uniqueDonors = new Set(donations.map((d) => d.email)).size;

  // Group by purpose
  const purposeGroups = donations.reduce((groups, donation) => {
    const purpose = donation.purpose || "Other";
    if (!groups[purpose]) {
      groups[purpose] = {
        count: 0,
        amount: 0,
      };
    }
    groups[purpose].count += 1;
    groups[purpose].amount += donation.amount;
    return groups;
  }, {});

  // Add summary section
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Summary", 15, 50);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Total Donations: ${donations.length}`, 15, 60);
  doc.text(`Total Amount: LKR ${totalAmount.toLocaleString()}`, 15, 67);
  doc.text(`Unique Donors: ${uniqueDonors}`, 15, 74);
  doc.text(
    `Average Donation: LKR ${(totalAmount / donations.length).toFixed(2)}`,
    15,
    81
  );

  // Add purpose breakdown
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Donation Purpose Breakdown", 15, 95);

  // Purpose breakdown table
  const purposeRows = Object.entries(purposeGroups).map(([purpose, data]) => [
    purpose,
    data.count.toString(),
    `LKR ${data.amount.toLocaleString()}`,
    `${((data.amount / totalAmount) * 100).toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: 100,
    head: [["Purpose", "Count", "Amount", "% of Total"]],
    body: purposeRows,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    margin: { left: 15, right: 15 },
  });

  // Get the final Y position after the table
  const finalY = doc.lastAutoTable.finalY || 150;

  // Add donation list if not too many
  if (donations.length <= 50) {
    // Limit list to 50 items to keep PDF manageable
    const yPos = finalY + 15;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Donation List", 15, yPos);

    const donationRows = donations.map((donation) => [
      new Date(donation.createdAt || donation.date).toLocaleDateString(),
      donation.donor,
      donation.purpose || "General",
      `LKR ${donation.amount.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Date", "Donor", "Purpose", "Amount"]],
      body: donationRows,
      theme: "striped",
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: "bold",
      },
      margin: { left: 15, right: 15 },
    });
  }

  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Prepared by: ${preparedBy}`, 15, pageHeight - 20);
  doc.text("Confidential - For internal use only", 105, pageHeight - 20, {
    align: "center",
  });
  doc.text(`Page ${doc.getNumberOfPages()}`, 195, pageHeight - 20, {
    align: "right",
  });

  // Save PDF
  const fileName = `donation-report-${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);

  return fileName;
};

export default {
  generateDonationReceipt,
  generateDonationReport,
};
