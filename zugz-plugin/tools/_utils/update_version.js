import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "..")

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"))
  const version = pkg.version
  console.log(`Updating agent markdown files with version v${version}...`)

  const agentsDir = path.join(ROOT, "agents")
  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith(".md"))

  for (const file of files) {
    const filePath = path.join(agentsDir, file)
    let content = fs.readFileSync(filePath, "utf-8")
    
    // Replace versions
    const replacedWelcome = content.replace(/Bienvenido a Zugzbot v\d+\.\d+\.\d+/g, `Bienvenido a Zugzbot v${version}`)
    const replacedRouter = replacedWelcome.replace(/Router cognitivo de Zugzbot v\d+\.\d+\.\d+/g, `Router cognitivo de Zugzbot v${version}`)
    const replacedRouterHeader = replacedRouter.replace(/Router Cognitivo v\d+\.\d+\.\d+/g, `Router Cognitivo v${version}`)

    if (content !== replacedRouterHeader) {
      fs.writeFileSync(filePath, replacedRouterHeader, "utf-8")
      console.log(`  Updated: ${file}`)
    }
  }
  console.log("Version updates complete.")
} catch (err) {
  console.error("Error updating versions in agent prompts:", err)
  process.exit(1)
}
