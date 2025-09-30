// routes/reports.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

// Function to send email
async function sendReportEmail(buffer) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"MiniBank" <no-reply@minibank.com>',
    to: "mkwapatirar@gmail.com",
    subject: "Daily Banking Report",
    text: "Attached is the daily banking report.",
    attachments: [
      {
        filename: "report.pdf",
        content: buffer,
      },
    ],
  });
}

// Helper to safely format amount
function formatAmount(amount) {
  const num = Number(amount);
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

// Helper to draw table header
function drawTableHeader(doc, y) {
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Date & Time", 30, y, { width: 100 });
  doc.text("Type", 140, y, { width: 80 });
  doc.text("Amount (MWK)", 230, y, { width: 100 });
  doc.text("Customer", 340, y, { width: 150 });
  doc.text("Account#", 500, y, { width: 70 });
  doc.moveDown(0.5);
  doc.moveTo(30, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(0.5);
  return doc.y;
}

// Helper to draw a table row
function drawTableRow(doc, y, tx, index) {
  const rowHeight = 20;
  if (y + rowHeight > doc.page.height - 50) {
    doc.addPage();
    y = drawTableHeader(doc, 30);
  }
  doc.font("Helvetica").fontSize(10);
  doc.text(new Date(tx.created_at).toLocaleString(), 30, y, { width: 100 });
  doc.text(tx.type, 140, y, { width: 80 });
  doc.text(formatAmount(tx.amount), 230, y, { width: 100 });
  doc.text(`${tx.first_name} ${tx.last_name}`, 340, y, { width: 150 });
  doc.text(tx.account_number, 500, y, { width: 70 });
  return y + rowHeight;
}

// Main PDF generator
async function generatePDF(transactions, res, sendEmail = false) {
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    let buffers = [];
    if (sendEmail) {
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(buffers);
        await sendReportEmail(pdfBuffer);
        if (!res.headersSent) {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
          res.send(pdfBuffer);
        }
      });
    } else {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
      doc.pipe(res);
    }
  
    // Title
    doc.fontSize(20).text("Daily Banking Transactions", { align: "center", underline: true });
    doc.moveDown(1);
  
    // Table header
    let y = drawTableHeader(doc, doc.y);
  
    // Table rows (all black)
    let totalDeposited = 0;
    let totalWithdrawn = 0;
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      doc.fillColor("black"); // ALL rows in black
      y = drawTableRow(doc, y, tx, i);
  
      if (tx.type.toLowerCase() === "deposit") totalDeposited += Number(tx.amount);
      if (tx.type.toLowerCase() === "withdraw") totalWithdrawn += Number(tx.amount);
    }
  
    // Bank total left
    const bankBalanceResult = await pool.query(`SELECT SUM(balance) as total_balance FROM accounts`);
    const totalLeftInBank = bankBalanceResult.rows[0].total_balance || 0;
  
    // Totals summary as a mini-table across the page with colors
    doc.moveDown(2);
    doc.font("Helvetica-Bold").fontSize(12);
    const summaryX = [30, 220, 410];
    const summaryY = doc.y;
    const summaryLabels = ["Total Deposited (MWK):", "Total Withdrawn (MWK):", "Total Left in Bank (MWK):"];
    const summaryValues = [totalDeposited, totalWithdrawn, totalLeftInBank];
    const summaryColors = ["green", "red", "black"];
  
    for (let i = 0; i < 3; i++) {
      doc.fillColor("black").text(summaryLabels[i], summaryX[i], summaryY);
      doc.fillColor(summaryColors[i]).text(formatAmount(summaryValues[i]), summaryX[i], summaryY + 20);
    }
    doc.fillColor("black");
  
    // Footer
    doc.moveDown(3);
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });
  
    doc.end();
  }
  
// Route to generate today’s report
router.get("/daily", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const result = await pool.query(`
      SELECT t.id, t.type, t.amount, t.created_at,
             a.account_number, c.first_name, c.last_name
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN customers c ON a.customer_id = c.id
      WHERE t.created_at >= $1 AND t.created_at < $2
      ORDER BY t.created_at ASC
    `, [startOfDay, endOfDay]);

    await generatePDF(result.rows, res);
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) res.status(500).send("Server error");
  }
});

// Route to generate, send to HR, and download
router.get("/daily/send", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const result = await pool.query(`
      SELECT t.id, t.type, t.amount, t.created_at,
             a.account_number, c.first_name, c.last_name
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN customers c ON a.customer_id = c.id
      WHERE t.created_at >= $1 AND t.created_at < $2
      ORDER BY t.created_at ASC
    `, [startOfDay, endOfDay]);

    await generatePDF(result.rows, res, true);
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) res.status(500).send("Server error");
  }
});

module.exports = router;
