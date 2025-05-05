/**
 * Sanitize LaTeX input to prevent command injection
 *
 * This function sanitizes potentially dangerous LaTeX commands and constructs.
 * It blocks commands that might allow arbitrary code execution or file system access.
 */
export function sanitizeLatex(input: string): string {
  if (!input) return input;

  // Block specific dangerous commands
  const dangerousCommands = [
    /\\write18\{/g, // Shell escape
    /\\immediate\s*\\write18/g, // Shell escape
    /\\input\{\/etc\//g, // Reading system files
    /\\include\{\/etc\//g, // Reading system files
    /\\openin\d+\s*=\s*\`/g, // Backtick for command execution
    /\\openout\d+\s*=\s*\`/g, // Backtick for command execution
    /\\catcode/g, // Changing category codes can be dangerous
    /\\csname\s+system\s*\endcsname/g, // System command access
    /\\markup/g, // ConTeXt command that can execute code
    /\\startluacode/g, // LuaTeX code that can execute code
    /\\directlua/g, // Direct Lua code execution
    /\\newread/g, // File I/O
    /\\newwrite/g, // File I/O
    /\\readline/g, // File I/O
    /\\openin/g, // File I/O
    /\\openout/g, // File I/O
    /\\write\d+/g, // File I/O (except standard streams)
  ];

  let sanitized = input;

  // Remove dangerous commands
  dangerousCommands.forEach((regex) => {
    sanitized = sanitized.replace(regex, "\\textbf{BLOCKED-COMMAND}");
  });

  // Replace backticks with single quotes to prevent command execution
  sanitized = sanitized.replace(/`/g, "'");

  // Limit the file paths to relative paths (no absolute paths starting with /)
  sanitized = sanitized.replace(
    /\\(input|include|bibliography)\s*\{\s*\/+/g,
    "\\$1{./"
  );

  return sanitized;
}

export default sanitizeLatex;
