export function decodeGitPath(gitPath: string): string {
  let cleaned = gitPath.replace(/^"|"$/g, "")
  if (cleaned.includes("\\")) {
    try {
      const bytes: number[] = []
      let i = 0
      while (i < cleaned.length) {
        if (cleaned[i] === "\\" && i + 3 < cleaned.length && /^[0-7]{3}$/.test(cleaned.substring(i + 1, i + 4))) {
          const octalVal = cleaned.substring(i + 1, i + 4)
          bytes.push(parseInt(octalVal, 8))
          i += 4
        } else {
          if (cleaned[i] === "\\" && i + 1 < cleaned.length) {
            const next = cleaned[i + 1]
            if (next === "n") { bytes.push(10); i += 2 }
            else if (next === "t") { bytes.push(9); i += 2 }
            else if (next === "\\") { bytes.push(92); i += 2 }
            else if (next === "\"") { bytes.push(34); i += 2 }
            else { bytes.push(cleaned.charCodeAt(i)); i++ }
          } else {
            const code = cleaned.charCodeAt(i)
            if (code < 128) {
              bytes.push(code)
            } else {
              const buf = Buffer.from(cleaned[i], "utf-8")
              for (let b = 0; b < buf.length; b++) {
                bytes.push(buf[b])
              }
            }
            i++
          }
        }
      }
      return Buffer.from(bytes).toString("utf-8")
    } catch {
      return cleaned.replace(/\\([0-7]{3})/g, (match, octal) => {
        return String.fromCharCode(parseInt(octal, 8))
      })
    }
  }
  return cleaned
}

export function sanitizeGitPath(line: string): string {
  const content = line.substring(3).trim()
  if (content.includes(" -> ")) {
    const parts = content.split(" -> ")
    return decodeGitPath(parts[1])
  }
  return decodeGitPath(content)
}
