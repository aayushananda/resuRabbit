import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import axios from "axios";
import FormData from "form-data";
import latexCache from "@/utils/latexCache";

const execAsync = promisify(exec);

// Create temporary directories
const TEMP_DIR = path.join(process.cwd(), "temp");

// Overleaf's public compilation service
const OVERLEAF_LATEX_API = "https://texlive2020.latexonline.cc/compile";

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    // Verify the directory was created by writing a test file
    const testFile = path.join(TEMP_DIR, ".test");
    await fs.writeFile(testFile, "test");
    await fs.unlink(testFile);
    return true;
  } catch (error) {
    console.error("Error creating temp directory:", error);
    return false;
  }
}

// Clean up old files (run periodically)
async function cleanupOldFiles() {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);

      // Delete files older than 1 hour
      if (now - stats.mtime.getTime() > 3600000) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error("Error cleaning up old files:", error);
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

// Compile LaTeX using Overleaf's service
async function compileWithOverleaf(
  latex: string,
  engine: string,
  options: any
) {
  try {
    // Create form data with the LaTeX content
    const formData = new FormData();
    formData.append("fileContents", latex);
    formData.append("engine", engine);

    // Send request to Overleaf's public compiler
    const overleafResponse = await axios.post(OVERLEAF_LATEX_API, formData, {
      headers: {
        ...formData.getHeaders(),
        Accept: "application/pdf",
      },
      responseType: "arraybuffer",
      timeout: options?.timeout || 30000,
    });

    // Generate unique filename for PDF
    const pdfFilename = `resume_${uuidv4()}.pdf`;
    const pdfFilePath = path.join(TEMP_DIR, pdfFilename);

    // Write PDF file
    await fs.writeFile(pdfFilePath, Buffer.from(overleafResponse.data));

    return {
      pdfFilename,
      pdfFilePath,
      service: "overleaf",
    };
  } catch (error) {
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const dirCreated = await ensureTempDir();
    if (!dirCreated) {
      return NextResponse.json(
        { error: "Could not create or access temp directory" },
        { status: 500 }
      );
    }

    // Run cleanup in the background
    cleanupOldFiles().catch(console.error);

    const body = await req.json();
    const { latex, engine = "pdflatex", options = {} } = body;

    if (!latex) {
      return NextResponse.json(
        { error: "LaTeX content is required" },
        { status: 400 }
      );
    }

    // Check cache first to avoid unnecessary compilation
    const cachedPdfUrl = latexCache.get(latex);
    if (cachedPdfUrl) {
      return NextResponse.json({
        previewUrl: cachedPdfUrl,
        source: "cache",
        success: true,
      });
    }

    // Check if LaTeX is installed
    const latexInstalled = await isLatexInstalled();

    let pdfFilename, pdfFilePath, compilationService;

    if (latexInstalled) {
      // Local compilation with pdflatex
      try {
        // Generate unique file names
        const fileId = uuidv4();
        const texFileName = `resume_${fileId}.tex`;
        const texFilePath = path.join(TEMP_DIR, texFileName);

        // Write LaTeX content to temp file
        await fs.writeFile(texFilePath, latex);

        // Verify file was written
        try {
          await fs.access(texFilePath);
          // Read the file to verify its content
          const content = await fs.readFile(texFilePath, "utf-8");
          if (!content.includes("\\documentclass")) {
            throw new Error("LaTeX file content appears invalid");
          }
        } catch (error) {
          return NextResponse.json(
            {
              error: `Failed to create LaTeX source file: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
            { status: 500 }
          );
        }

        // Set up compilation options
        const engineCmd = engine || "pdflatex";
        const passes = options.passes || 1;

        // Compile the LaTeX document (with multiple passes if requested)
        for (let i = 0; i < passes; i++) {
          const { stdout, stderr } = await execAsync(
            `${engineCmd} -interaction=nonstopmode -output-directory=${TEMP_DIR} ${texFilePath}`
          );

          if (stderr) {
            console.warn("LaTeX compilation warning:", stderr);
          }
        }

        // Generate PDF file path
        pdfFilename = texFileName.replace(".tex", ".pdf");
        pdfFilePath = path.join(TEMP_DIR, pdfFilename);
        compilationService = "pdflatex";

        // Verify PDF was created successfully
        await fs.access(pdfFilePath);
      } catch (localError) {
        console.error("Local compilation error:", localError);

        // Fallback to Overleaf if local compilation fails
        try {
          const overleafResult = await compileWithOverleaf(
            latex,
            engine,
            options
          );
          pdfFilename = overleafResult.pdfFilename;
          pdfFilePath = overleafResult.pdfFilePath;
          compilationService = overleafResult.service;
        } catch (overleafError) {
          return NextResponse.json(
            {
              error: `Compilation failed with both local and remote services: ${localError.message}`,
            },
            { status: 500 }
          );
        }
      }
    } else {
      // LaTeX is not installed, try Overleaf instead
      try {
        const overleafResult = await compileWithOverleaf(
          latex,
          engine,
          options
        );
        pdfFilename = overleafResult.pdfFilename;
        pdfFilePath = overleafResult.pdfFilePath;
        compilationService = overleafResult.service;
      } catch (overleafError) {
        return NextResponse.json(
          {
            error: "LaTeX is not installed and Overleaf compilation failed",
            details: overleafError.message,
            notInstalled: true,
          },
          { status: 500 }
        );
      }
    }

    // Create a URL to access the PDF
    const pdfUrl = `/api/view-pdf?file=${pdfFilename}`;

    // Cache the result
    latexCache.set(latex, pdfUrl);

    return NextResponse.json({
      previewUrl: pdfUrl,
      source: compilationService,
      success: true,
    });
  } catch (error) {
    console.error("Error processing LaTeX:", error);
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
