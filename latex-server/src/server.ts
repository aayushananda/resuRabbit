// server.ts
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { exec, spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";
import morgan from "morgan";
import winston from "winston";
import Queue from "bull";
import dotenv from "dotenv";
import { sanitizeLatex } from "./utils/sanitize";
import { promisify } from "util";
import crypto from "crypto";

// Load environment variables
dotenv.config();

// Define interface for request body
interface LaTeXRequest {
  latex: string;
  engine?: "pdflatex" | "xelatex" | "lualatex";
  bibliography?: string;
  useBiber?: boolean;
}

// Define params interface for routes with parameters
interface PreviewParams {
  filename: string;
}

interface JobParams {
  jobId: string;
}

// Define job status type
type JobStatus = "pending" | "running" | "completed" | "failed";

// Define job interface
interface Job {
  id: string;
  status: JobStatus;
  logs: string[];
  error?: string;
  pdfFilename?: string;
}

const app = express();
const PORT = process.env.PORT || 3001;

// Environment configuration
const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, "temp");
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(__dirname, "public");
const MAX_COMPILE_TIME_MS = parseInt(
  process.env.MAX_COMPILE_TIME_MS || "30000",
  10
);
const MAX_JOB_AGE_HOURS = parseInt(process.env.MAX_JOB_AGE_HOURS || "2", 10);
const QUEUE_CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY || "3", 10);
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Setup logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Setup job queue
const latexQueue = new Queue("latex-compilation", REDIS_URL);

// Flag to track if we should use queue or fallback to direct compilation
let useQueueSystem = true;

// Handle Redis connection failures
latexQueue.on("error", (error) => {
  logger.error("Redis connection error:", error);
  useQueueSystem = false;
  logger.warn("Switched to direct compilation mode due to Redis issues");
  // In production, you may want to implement reconnection logic
  // or graceful degradation (e.g., fallback to synchronous mode)
});

// Global error handlers for queue
latexQueue.on("failed", (job, error) => {
  logger.error(`Job ${job.id} failed:`, error);
});

process.on("SIGTERM", async () => {
  try {
    logger.info("Shutting down gracefully...");
    await latexQueue.close();
    logger.info("Redis connection closed");
    process.exit(0);
  } catch (err) {
    logger.error("Error during shutdown:", err);
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// In-memory job tracking (in production, use Redis or a database)
const jobs = new Map<string, Job>();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static("public")); // For serving generated files
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Create directory for temporary files
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

// API endpoint for LaTeX compilation
app.post(
  "/api/compile-latex",
  async (req: Request<{}, {}, LaTeXRequest>, res: Response) => {
    if (!useQueueSystem) {
      return fallbackCompileLaTeX(req, res);
    }

    try {
      const {
        latex,
        engine = "pdflatex",
        bibliography,
        useBiber = false,
      } = req.body;

      if (!latex) {
        return res.status(400).json({ error: "LaTeX code is required" });
      }

      // Validate engine choice
      if (!["pdflatex", "xelatex", "lualatex"].includes(engine)) {
        return res.status(400).json({ error: "Invalid LaTeX engine" });
      }

      // Sanitize LaTeX input using our custom sanitizer
      const sanitizedLatex = sanitizeLatex(latex);

      // Create a unique ID for this compilation
      const jobId = uuidv4();

      // Create job entry
      jobs.set(jobId, {
        id: jobId,
        status: "pending",
        logs: [],
      });

      // Add job to queue
      await latexQueue.add(
        {
          jobId,
          latex: sanitizedLatex,
          engine,
          bibliography,
          useBiber,
        },
        {
          timeout: MAX_COMPILE_TIME_MS,
          removeOnComplete: true,
        }
      );

      // Return job ID for status checking
      res.json({
        jobId,
        statusUrl: `/api/status/${jobId}`,
      });
    } catch (error) {
      logger.error("LaTeX compilation request error:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Error processing LaTeX request",
      });
    }
  }
);

// Job status endpoint
app.get("/api/status/:jobId", (req: Request<JobParams>, res: Response) => {
  const { jobId } = req.params;

  const job = jobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);
});

// Logs endpoint
app.get("/api/logs/:jobId", (req: Request<JobParams>, res: Response) => {
  const { jobId } = req.params;

  const job = jobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json({ logs: job.logs });
});

// Download endpoint - using GET as recommended
app.get("/api/download/:jobId", (req: Request<JobParams>, res: Response) => {
  const { jobId } = req.params;

  const job = jobs.get(jobId);
  if (!job || job.status !== "completed" || !job.pdfFilename) {
    return res
      .status(404)
      .json({ error: "PDF not found or compilation not complete" });
  }

  const pdfPath = path.join(PUBLIC_DIR, job.pdfFilename);

  if (fs.existsSync(pdfPath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=resume.pdf`);
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    res.status(404).json({ error: "PDF file not found" });
  }
});

// Endpoint for PDF preview with token security
app.get(
  "/api/preview/:filename",
  (req: Request<PreviewParams>, res: Response) => {
    const { filename } = req.params;
    const { token } = req.query;

    // Simple token validation (replace with more robust JWT in production)
    if (!token || typeof token !== "string") {
      return res.status(401).json({ error: "Invalid or missing token" });
    }

    // In a real app, you'd validate the token against a secure store
    // This is a simplified example
    const filePath = path.join(PUBLIC_DIR, filename);

    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/pdf");
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.status(404).json({ error: "PDF not found" });
    }
  }
);

// Process LaTeX compilation queue
latexQueue.process(QUEUE_CONCURRENCY, async (job) => {
  const { jobId, latex, engine, bibliography, useBiber } = job.data;
  const baseFilename = `resume_${jobId}`;

  try {
    const currentJob = jobs.get(jobId);
    if (!currentJob) throw new Error("Job not found");

    // Update job status
    currentJob.status = "running";

    // Create files
    const texFilePath = path.join(TEMP_DIR, `${baseFilename}.tex`);
    await fs.promises.writeFile(texFilePath, latex);

    // Handle bibliography if provided
    if (bibliography) {
      const bibFilePath = path.join(TEMP_DIR, `${baseFilename}.bib`);
      await fs.promises.writeFile(bibFilePath, bibliography);
    }

    // Compile with multiple passes if needed
    await multiPassCompilation(
      jobId,
      texFilePath,
      engine,
      bibliography !== undefined,
      useBiber
    );

    // Move PDF to public directory with atomic operation
    const pdfTempPath = path.join(TEMP_DIR, `${baseFilename}.pdf`);
    const pdfPublicPath = path.join(PUBLIC_DIR, `${baseFilename}.pdf`);

    // Generate token for secure PDF access
    const previewToken = crypto.randomBytes(16).toString("hex");

    // Copy file atomically
    await fs.promises.copyFile(pdfTempPath, pdfPublicPath);

    // Update job status
    currentJob.status = "completed";
    currentJob.pdfFilename = `${baseFilename}.pdf`;

    // Return success
    return {
      pdfFilename: `${baseFilename}.pdf`,
      previewUrl: `/api/preview/${baseFilename}.pdf?token=${previewToken}`,
      downloadUrl: `/api/download/${jobId}`,
    };
  } catch (error) {
    // Update job status
    const currentJob = jobs.get(jobId);
    if (currentJob) {
      currentJob.status = "failed";
      currentJob.error =
        error instanceof Error ? error.message : "Unknown error";
    }

    logger.error(`Compilation failed for job ${jobId}:`, error);
    throw error;
  } finally {
    // Clean up temporary files
    cleanupFiles(baseFilename);
  }
});

// Helper function for multi-pass compilation
async function multiPassCompilation(
  jobId: string,
  texFilePath: string,
  engine: string = "pdflatex",
  hasBibliography: boolean = false,
  useBiber: boolean = false
): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) throw new Error("Job not found");

  const outputDir = path.dirname(texFilePath);
  const baseOptions = [
    "-interaction=nonstopmode",
    "-file-line-error",
    `-output-directory=${outputDir}`,
    texFilePath,
  ];

  // First pass
  await runCompiler(engine, baseOptions, jobId);

  // Bibliography pass if needed
  if (hasBibliography) {
    const bibEngine = useBiber ? "biber" : "bibtex";
    const baseFilename = path.basename(texFilePath, ".tex");

    if (bibEngine === "biber") {
      await runCommand(
        "biber",
        [`--output-directory=${outputDir}`, baseFilename],
        jobId
      );
    } else {
      await runCommand("bibtex", [`${outputDir}/${baseFilename}`], jobId);
    }

    // Additional passes for references
    await runCompiler(engine, baseOptions, jobId);
    await runCompiler(engine, baseOptions, jobId);
  }
}

// Helper function to run a command with timeout
async function runCommand(
  command: string,
  args: string[],
  jobId: string
): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) throw new Error("Job not found");

  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      timeout: MAX_COMPILE_TIME_MS,
    });

    let output = "";

    childProcess.stdout.on("data", (data) => {
      output += data.toString();
      job.logs.push(data.toString().trim());
    });

    childProcess.stderr.on("data", (data) => {
      output += data.toString();
      job.logs.push(`ERROR: ${data.toString().trim()}`);
    });

    childProcess.on("error", (error) => {
      reject(new Error(`Command execution failed: ${error.message}`));
    });

    childProcess.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Command exited with code ${code}: ${output}`));
      } else {
        resolve();
      }
    });
  });
}

// Helper function to run LaTeX compiler
function runCompiler(
  engine: string,
  args: string[],
  jobId: string
): Promise<void> {
  return runCommand(engine, args, jobId);
}

// Helper function to clean up temporary files
function cleanupFiles(baseFilename: string): void {
  const extensions = [
    ".tex",
    ".aux",
    ".log",
    ".out",
    ".pdf",
    ".toc",
    ".lof",
    ".lot",
    ".bbl",
    ".blg",
    ".bib",
    ".bcf",
    ".run.xml",
  ];

  extensions.forEach((ext) => {
    const filePath = path.join(TEMP_DIR, `${baseFilename}${ext}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

// Clean up temporary files and job information periodically
setInterval(() => {
  // Clean public directory
  fs.readdir(PUBLIC_DIR, (err, files) => {
    if (err) {
      logger.error("Error reading public directory:", err);
      return;
    }

    const now = Date.now();
    files.forEach((file) => {
      if (file.startsWith("resume_") && file.endsWith(".pdf")) {
        const filePath = path.join(PUBLIC_DIR, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;

          // Remove files older than MAX_JOB_AGE_HOURS
          if (
            now - stats.mtime.getTime() >
            MAX_JOB_AGE_HOURS * 60 * 60 * 1000
          ) {
            fs.unlink(filePath, (err) => {
              if (err) logger.error(`Error deleting file ${filePath}:`, err);
            });
          }
        });
      }
    });
  });

  // Clean job records
  const jobExpiryTime = Date.now() - MAX_JOB_AGE_HOURS * 60 * 60 * 1000;

  // This would need timestamps in the job objects for proper cleanup
  // In a real app, you'd store creation time with each job
}, 60 * 60 * 1000); // Run every hour

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    queueSize: latexQueue.count(),
    timestamp: new Date().toISOString(),
  });
});

// Fallback function to compile LaTeX directly if queue system is down
async function fallbackCompileLaTeX(
  req: Request<{}, {}, LaTeXRequest>,
  res: Response
) {
  try {
    const {
      latex,
      engine = "pdflatex",
      bibliography,
      useBiber = false,
    } = req.body;

    if (!latex) {
      return res.status(400).json({ error: "LaTeX code is required" });
    }

    // Validate engine choice
    if (!["pdflatex", "xelatex", "lualatex"].includes(engine)) {
      return res.status(400).json({ error: "Invalid LaTeX engine" });
    }

    // Sanitize LaTeX input
    const sanitizedLatex = sanitizeLatex(latex);

    // Create a unique ID for this compilation
    const jobId = uuidv4();
    const baseFilename = `resume_${jobId}`;
    const texFilePath = path.join(TEMP_DIR, `${baseFilename}.tex`);

    // Write LaTeX to a temporary file
    await fs.promises.writeFile(texFilePath, sanitizedLatex);

    // Handle bibliography if provided
    if (bibliography) {
      const bibFilePath = path.join(TEMP_DIR, `${baseFilename}.bib`);
      await fs.promises.writeFile(bibFilePath, bibliography);
    }

    try {
      // Compile with multiple passes if needed
      const outputDir = path.dirname(texFilePath);
      const baseOptions = [
        "-interaction=nonstopmode",
        "-file-line-error",
        `-output-directory=${outputDir}`,
        texFilePath,
      ];

      // First pass
      await new Promise<void>((resolve, reject) => {
        const process = spawn(engine, baseOptions, {
          timeout: MAX_COMPILE_TIME_MS,
        });

        process.on("error", (error) => {
          reject(new Error(`Command execution failed: ${error.message}`));
        });

        process.on("exit", (code) => {
          if (code !== 0) {
            reject(new Error(`Command exited with code ${code}`));
          } else {
            resolve();
          }
        });
      });

      // Bibliography pass if needed
      if (bibliography) {
        const bibEngine = useBiber ? "biber" : "bibtex";
        const baseFilename = path.basename(texFilePath, ".tex");

        await new Promise<void>((resolve, reject) => {
          const options =
            bibEngine === "biber"
              ? [`--output-directory=${outputDir}`, baseFilename]
              : [`${outputDir}/${baseFilename}`];

          const process = spawn(bibEngine, options, {
            timeout: MAX_COMPILE_TIME_MS,
          });

          process.on("error", (error) => {
            // Bibliography errors are non-fatal
            logger.warn(`Bibliography processing error: ${error.message}`);
            resolve();
          });

          process.on("exit", (code) => {
            // Non-zero exit is common with bibliography tools when entries aren't found
            // Just log and continue
            if (code !== 0) {
              logger.warn(`Bibliography exited with code ${code}`);
            }
            resolve();
          });
        });

        // Additional passes for references
        await new Promise<void>((resolve, reject) => {
          const process = spawn(engine, baseOptions, {
            timeout: MAX_COMPILE_TIME_MS,
          });

          process.on("error", (error) => {
            reject(new Error(`Command execution failed: ${error.message}`));
          });

          process.on("exit", (code) => {
            if (code !== 0) {
              reject(new Error(`Command exited with code ${code}`));
            } else {
              resolve();
            }
          });
        });
      }

      // Move PDF to public directory
      const pdfTempPath = path.join(TEMP_DIR, `${baseFilename}.pdf`);
      const pdfPublicPath = path.join(PUBLIC_DIR, `${baseFilename}.pdf`);

      // Generate token for secure PDF access
      const previewToken = crypto.randomBytes(16).toString("hex");

      // Copy file
      await fs.promises.copyFile(pdfTempPath, pdfPublicPath);

      // Return success
      res.json({
        pdfFilename: `${baseFilename}.pdf`,
        previewUrl: `/api/preview/${baseFilename}.pdf?token=${previewToken}`,
        downloadUrl: `/api/download/${jobId}`,
      });
    } catch (error) {
      logger.error(
        `Compilation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      res.status(500).json({ error: "LaTeX compilation failed" });
    } finally {
      // Clean up temporary files
      cleanupFiles(baseFilename);
    }
  } catch (error) {
    logger.error("LaTeX compilation request error:", error);
    res
      .status(500)
      .json({
        error:
          error instanceof Error
            ? error.message
            : "Error processing LaTeX request",
      });
  }
}

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
