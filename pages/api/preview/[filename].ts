import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;

  if (!filename || typeof filename !== "string") {
    return res.status(400).json({ error: "Invalid filename" });
  }

  // Security check to prevent directory traversal attacks
  if (filename.includes("..") || !filename.endsWith(".pdf")) {
    return res.status(403).json({ error: "Access denied" });
  }

  const filePath = path.join(process.cwd(), "public", filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "PDF not found" });
    }

    // Read file
    const fileData = fs.readFileSync(filePath);

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", fileData.length);
    res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 minutes

    // Send file
    res.status(200).send(fileData);
  } catch (error) {
    console.error("Error serving PDF:", error);
    return res.status(500).json({ error: "Error serving PDF file" });
  }
}
