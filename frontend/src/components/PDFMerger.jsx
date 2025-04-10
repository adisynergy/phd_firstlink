import { useState } from 'react';
import { Button } from './ui/button';
import { Upload, Combine, Loader2, Link } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';

export default function PDFMerger() {
  const [pdf1, setPdf1] = useState(null);
  const [pdf2, setPdf2] = useState(null);
  const [pdf1Url, setPdf1Url] = useState('');
  const [pdf2Url, setPdf2Url] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

  const handleFileChange = (e, setPdf) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdf(file);
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  const handleUrlChange = (e, setUrl) => {
    setUrl(e.target.value);
  };

  const mergePDFs = async () => {
    try {
      setIsLoading(true);
      
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      // Handle first PDF (either file or URL)
      if (pdf1) {
        const pdf1Bytes = await pdf1.arrayBuffer();
        const pdf1Doc = await PDFDocument.load(pdf1Bytes);
        const pages1 = await mergedPdf.copyPages(pdf1Doc, pdf1Doc.getPageIndices());
        pages1.forEach(page => mergedPdf.addPage(page));
      } else if (pdf1Url) {
        const pdf1Response = await fetch(pdf1Url);
        const pdf1Bytes = await pdf1Response.arrayBuffer();
        const pdf1Doc = await PDFDocument.load(pdf1Bytes);
        const pages1 = await mergedPdf.copyPages(pdf1Doc, pdf1Doc.getPageIndices());
        pages1.forEach(page => mergedPdf.addPage(page));
      }

      // Handle second PDF (either file or URL)
      if (pdf2) {
        const pdf2Bytes = await pdf2.arrayBuffer();
        const pdf2Doc = await PDFDocument.load(pdf2Bytes);
        const pages2 = await mergedPdf.copyPages(pdf2Doc, pdf2Doc.getPageIndices());
        pages2.forEach(page => mergedPdf.addPage(page));
      } else if (pdf2Url) {
        const pdf2Response = await fetch(pdf2Url);
        const pdf2Bytes = await pdf2Response.arrayBuffer();
        const pdf2Doc = await PDFDocument.load(pdf2Bytes);
        const pages2 = await mergedPdf.copyPages(pdf2Doc, pdf2Doc.getPageIndices());
        pages2.forEach(page => mergedPdf.addPage(page));
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      toast.success('PDFs merged successfully!');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error('Failed to merge PDFs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">PDF Merger</h1>
      
      <div className="space-y-6">
        {/* First PDF */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">First PDF</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF File
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, setPdf1)}
                  className="flex-1"
                />
                {pdf1 && (
                  <span className="text-sm text-gray-500">
                    {pdf1.name}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter PDF URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  value={pdf1Url}
                  onChange={(e) => handleUrlChange(e, setPdf1Url)}
                  className="flex-1 p-2 border rounded"
                />
                <Link className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Second PDF */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Second PDF</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF File
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, setPdf2)}
                  className="flex-1"
                />
                {pdf2 && (
                  <span className="text-sm text-gray-500">
                    {pdf2.name}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter PDF URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  value={pdf2Url}
                  onChange={(e) => handleUrlChange(e, setPdf2Url)}
                  className="flex-1 p-2 border rounded"
                />
                <Link className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Merge Button */}
        <div className="flex justify-center">
          <Button
            onClick={mergePDFs}
            disabled={isLoading || (!pdf1 && !pdf1Url) || (!pdf2 && !pdf2Url)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Combine className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Merging...' : 'Merge PDFs'}
          </Button>
        </div>

        {/* Preview */}
        {mergedPdfUrl && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Merged PDF Preview</h2>
            <iframe
              src={mergedPdfUrl}
              className="w-full h-[600px] border border-gray-200 rounded"
              title="Merged PDF"
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => window.print()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Print PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 