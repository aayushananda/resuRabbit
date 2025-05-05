import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Initialize PDF.js worker
// Only run this on the client side
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

// Define the props for the PDFViewer component
interface PDFViewerProps {
  file: string;
  currentPage: number;
  scale: number;
  numPages: number;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  changePage: (offset: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  file,
  currentPage,
  scale,
  numPages,
  onDocumentLoadSuccess,
  changePage,
  zoomIn,
  zoomOut,
}) => {
  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="pdf-viewer w-full h-full">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<LoadingSpinner />}
        error={<div className="text-red-500 p-4">Error loading PDF</div>}
      >
        <Page
          pageNumber={currentPage}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>

      <div className="flex justify-center items-center mt-2 gap-2">
        <button
          onClick={() => changePage(-1)}
          disabled={currentPage <= 1}
          className="p-1 px-3 bg-gray-200 text-gray-700 rounded disabled:bg-gray-100 disabled:text-gray-400"
        >
          Previous
        </button>

        <span className="text-sm text-gray-700">
          Page {currentPage} of {numPages}
        </span>

        <button
          onClick={() => changePage(1)}
          disabled={currentPage >= numPages}
          className="p-1 px-3 bg-gray-200 text-gray-700 rounded disabled:bg-gray-100 disabled:text-gray-400"
        >
          Next
        </button>

        <div className="border-l border-gray-300 mx-2 h-6"></div>

        <button
          onClick={zoomOut}
          className="p-1 px-2 bg-gray-200 text-gray-700 rounded"
        >
          -
        </button>

        <span className="text-sm text-gray-700 w-14 text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={zoomIn}
          className="p-1 px-2 bg-gray-200 text-gray-700 rounded"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
