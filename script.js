// script.js
// Handle tool selection and PDF processing using pdf-lib

let selectedTool = "merge"; // default tool

function selectTool(el) {
  // Clear active state
  const boxes = document.querySelectorAll('.tool-box');
  boxes.forEach(box => box.classList.remove('active'));

  // Set selected
  el.classList.add('active');
  selectedTool = el.getAttribute('data-tool');
}

async function processTool() {
  const input = document.getElementById('pdfFiles');
  const files = input.files;

  if (files.length === 0) {
    alert('Please select at least one PDF file.');
    return;
  }

  document.getElementById('statusMsg').innerText = "Processing, please wait...";

  if (selectedTool === 'merge') {
    await mergePDFs(files);
  } else if (selectedTool === 'compress') {
    await compressPDF(files[0]);
  } else if (selectedTool === 'base64') {
    await pdfToBase64(files[0]);
  }

  document.getElementById('statusMsg').innerText = "Done!";
}

// Merge PDFs
async function mergePDFs(files) {
  const { PDFDocument } = PDFLib;
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const arrayBuffer = await files[i].arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfFile = await mergedPdf.save();
  downloadBlob(mergedPdfFile, 'merged_document.pdf');
}

// Compress PDF
async function compressPDF(file) {
  const { PDFDocument } = PDFLib;
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
  copiedPages.forEach((page) => newPdf.addPage(page));

  newPdf.setTitle('');
  newPdf.setAuthor('');
  const compressedPdf = await newPdf.save();
  downloadBlob(compressedPdf, 'compressed_document.pdf');
}

// Convert PDF to base64 (text view)
async function pdfToBase64(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const base64 = reader.result.split(',')[1];
    downloadBlob(base64, 'pdf_base64.txt', 'text/plain');
  };
  reader.readAsDataURL(file);
}

// Trigger download of blob data
function downloadBlob(data, filename, type = 'application/pdf') {
  const blob = new Blob([data], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}