import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";

const execAsync = promisify(exec);

// Create temporary directories
const TEMP_DIR = path.join(process.cwd(), "temp");

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    return true;
  } catch (error) {
    console.error("Error creating temp directory:", error);
    return false;
  }
}

// Check if LaTeX is installed on the system
async function isLatexInstalled() {
  try {
    await execAsync("pdflatex --version");
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const dirCreated = await ensureTempDir();
    if (!dirCreated) {
      return NextResponse.json(
        { error: "Could not create temporary directory" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { latex, engine = "pdflatex", options = {} } = body;

    if (!latex) {
      return NextResponse.json(
        { error: "LaTeX content is required" },
        { status: 400 }
      );
    }

    // Check if LaTeX is installed
    const latexInstalled = await isLatexInstalled();
    if (!latexInstalled) {
      // If LaTeX isn't installed, use client-side rendering (return error with special flag)
      return NextResponse.json(
        {
          error: "LaTeX is not installed on the server",
          notInstalled: true,
        },
        { status: 500 }
      );
    }

    // Generate unique file names
    const fileId = uuidv4();
    const texFileName = `resume_${fileId}.tex`;
    const texFilePath = path.join(TEMP_DIR, texFileName);

    // Write LaTeX content to temp file
    await fs.writeFile(texFilePath, latex);

    // Compile the LaTeX document
    try {
      const { stdout, stderr } = await execAsync(
        `${engine} -interaction=nonstopmode -output-directory=${TEMP_DIR} ${texFilePath}`
      );

      if (stderr) {
        console.warn("LaTeX compilation warning:", stderr);
      }
    } catch (error: any) {
      console.error("LaTeX compilation error:", error);

      // Check if it's because LaTeX is not installed
      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            error: `${engine}: not found. LaTeX compilation engine is not installed.`,
            notInstalled: true,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Compilation error: ${error.message}` },
        { status: 500 }
      );
    }

    // Generate PDF file path
    const pdfFileName = texFileName.replace(".tex", ".pdf");
    const pdfFilePath = path.join(TEMP_DIR, pdfFileName);

    // Check if PDF was generated
    try {
      await fs.access(pdfFilePath);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to generate PDF file" },
        { status: 500 }
      );
    }

    // Read the generated PDF
    const pdfFile = await fs.readFile(pdfFilePath);

    // Create response with PDF content
    const response = new NextResponse(pdfFile);

    // Set appropriate headers for file download
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="resume.pdf"`
    );
    response.headers.set("Content-Length", pdfFile.length.toString());

    return response;
  } catch (error) {
    console.error("Error processing PDF download:", error);
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
