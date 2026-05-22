import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Audita programáticamente si una dependencia de terceros cumple con la regla de estabilidad y seguridad de cooldown (mínimo 3 días / 4320 minutos de antigüedad). Consulta APIs reales de NPM y PyPI.",
  args: {
    package: tool.schema.string().describe("Nombre del paquete o dependencia (ej: 'lodash', 'fastapi')"),
    version: tool.schema.string().optional().describe("Versión del paquete a auditar. Si no se especifica, audita la última versión."),
    ecosystem: tool.schema.enum(["npm", "pypi"]).optional().describe("El ecosistema del paquete. Por defecto se infiere del stack.")
  },
  async execute(args) {
    const pkg = args.package;
    let targetVersion = args.version;
    let eco = args.ecosystem;

    // Inferir ecosistema si no está presente
    if (!eco) {
      if (pkg.startsWith("@") || pkg.includes("/") || pkg === "lodash" || pkg === "axios" || pkg === "express") {
        eco = "npm";
      } else {
        // Enfoque por defecto: intentar NPM primero, luego PyPI
        eco = "npm";
      }
    }

    try {
      if (eco === "npm") {
        const url = `https://registry.npmjs.org/${encodeURIComponent(pkg)}`;
        const res = await fetch(url);
        if (!res.ok) {
          // Si falla NPM, chequear si es PyPI
          if (!args.ecosystem) {
            return await checkPyPI(pkg, targetVersion);
          }
          return `[Cooldown Blocked] Error: No se encontró el paquete '${pkg}' en NPM.`;
        }

        const data: any = await res.json();
        
        // Obtener última versión si no se provee
        if (!targetVersion) {
          targetVersion = data["dist-tags"]?.latest;
        }

        if (!targetVersion) {
          return `[Cooldown Blocked] Error: No se pudo resolver la versión para el paquete '${pkg}' en NPM.`;
        }

        const publishTimeString = data.time?.[targetVersion];
        if (!publishTimeString) {
          return `[Cooldown Blocked] Error: No se encontró la versión '${targetVersion}' para '${pkg}' en NPM.`;
        }

        return evaluateCooldown(pkg, targetVersion, publishTimeString, "NPM");
      } else {
        return await checkPyPI(pkg, targetVersion);
      }
    } catch (e: any) {
      return `[Cooldown Warning] Error al consultar la API de dependencias: ${e.message || e}. Por seguridad, verifica manualmente.`;
    }
  }
})

async function checkPyPI(pkg: string, targetVersion?: string) {
  try {
    const url = `https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`;
    const res = await fetch(url);
    if (!res.ok) {
      return `[Cooldown Blocked] Error: No se encontró el paquete '${pkg}' en NPM ni PyPI.`;
    }

    const data: any = await res.json();
    
    // Resolver versión
    const version = targetVersion || data.info?.version;
    if (!version) {
      return `[Cooldown Blocked] Error: No se pudo resolver la versión para '${pkg}' en PyPI.`;
    }

    const releases = data.releases?.[version];
    if (!releases || releases.length === 0) {
      return `[Cooldown Blocked] Error: No se encontró la versión '${version}' para '${pkg}' en PyPI.`;
    }

    // PyPI expone fecha de subida del primer archivo
    const uploadTime = releases[0]?.upload_time_iso_8601 || releases[0]?.upload_time;
    if (!uploadTime) {
      return `[Cooldown Blocked] Error: No se encontró fecha de publicación para '${pkg}@${version}' en PyPI.`;
    }

    return evaluateCooldown(pkg, version, uploadTime, "PyPI");
  } catch (e: any) {
    return `[Cooldown Blocked] Error de conexión con PyPI: ${e.message || e}`;
  }
}

function evaluateCooldown(pkg: string, version: string, publishTimeStr: string, registryName: string) {
  const publishTime = new Date(publishTimeStr);
  const now = new Date();
  const diffMs = now.getTime() - publishTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const cooldownRequired = 4320; // 3 días en minutos

  const publishDateStr = publishTime.toISOString().split('T')[0];

  if (diffMinutes < cooldownRequired) {
    const remainingMinutes = cooldownRequired - diffMinutes;
    const remainingHours = Math.ceil(remainingMinutes / 60);
    const remainingDays = (remainingMinutes / 1440).toFixed(1);

    return JSON.stringify({
      status: "BLOCKED",
      package: pkg,
      version: version,
      registry: registryName,
      publishDate: publishDateStr,
      ageMinutes: diffMinutes,
      ageDays: (diffMinutes / 1440).toFixed(1),
      cooldownMinutesRequired: cooldownRequired,
      message: `❌ COOLDOWN BLOQUEADO: El paquete '${pkg}@${version}' fue publicado hace solo ${(diffMinutes / 1440).toFixed(1)} días (${diffMinutes} minutos) el ${publishDateStr}. Requiere superar los 3 días de estabilidad. Faltan aproximadamente ${remainingDays} días (${remainingHours} horas) para que expire el cooldown.`
    }, null, 2);
  } else {
    return JSON.stringify({
      status: "APPROVED",
      package: pkg,
      version: version,
      registry: registryName,
      publishDate: publishDateStr,
      ageMinutes: diffMinutes,
      ageDays: (diffMinutes / 1440).toFixed(1),
      cooldownMinutesRequired: cooldownRequired,
      message: `✅ COOLDOWN APROBADO: El paquete '${pkg}@${version}' fue publicado el ${publishDateStr} (hace ${(diffMinutes / 1440).toFixed(1)} días). Cumple plenamente con la regla de estabilidad mínima de 3 días.`
    }, null, 2);
  }
}
