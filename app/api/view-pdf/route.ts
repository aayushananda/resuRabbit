import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const TEMP_DIR = path.join(process.cwd(), "temp");

// Helper function to verify if a file is a valid PDF
async function isValidPDF(filePath: string) {
  try {
    // Check if the file exists
    await fs.access(filePath);

    // Read the first few bytes to verify it's a PDF
    const buffer = Buffer.alloc(5);
    const fileHandle = await fs.open(filePath, "r");
    await fileHandle.read(buffer, 0, 5, 0);
    await fileHandle.close();

    // Check for PDF signature
    return buffer.toString("utf8") === "%PDF-";
  } catch (error) {
    console.error("PDF validation error:", error);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    // Get the filename from the URL query params
    const url = new URL(request.url);
    const fileParam = url.searchParams.get("file");

    if (!fileParam) {
      return NextResponse.json(
        { error: "File parameter is required" },
        { status: 400 }
      );
    }

    // Sanitize the filename to prevent directory traversal attacks
    const filename = path.basename(fileParam);
    const filePath = path.join(TEMP_DIR, filename);

    // Verify file exists and is a valid PDF
    if (!(await isValidPDF(filePath))) {
      return NextResponse.json(
        { error: "File not found or not a valid PDF" },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);

    // Create a response with the PDF content
    const response = new NextResponse(fileBuffer);

    // Set appropriate headers
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `inline; filename="${filename}"`
    );
    response.headers.set("Content-Length", fileBuffer.length.toString());

    // Add caching headers for better performance
    response.headers.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes

    return response;
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json(
      {
        error: `Server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
