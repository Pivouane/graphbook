import { prisma } from "@/lib/prisma/client";
import { ModulePayload } from "@/modules/types";
import { readdirSync } from "fs";
import { join } from "path";

export async function getActiveModulePayloads(userId: string): Promise<ModulePayload[]> {
  const allSlugs = readdirSync(join(process.cwd(), "src/modules")).filter(
    (f) => !f.startsWith("_") && !f.endsWith(".ts")
  );

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeModules: { select: { slug: true, args: true } } },
  });

  const userModuleMap = new Map(
    (user?.activeModules ?? []).map((m) => [m.slug, m.args])
  );

  const payloads = await Promise.all(
    allSlugs.map(async (slug) => {
      try {
        const manifest = (await import(`@/modules/${slug}/manifest.json`, {
          with: { type: "json" },
        })).default;

        const isActive = manifest.default || userModuleMap.has(slug);
        if (!isActive) return null;

        return {
          slug,
          args: {
            ...manifest.args ?? {},
            ...(userModuleMap.get(slug) as Record<string, unknown> ?? {}),
          },
        } satisfies ModulePayload;
      } catch {
        return null;
      }
    })
  );

  return payloads.filter(Boolean) as ModulePayload[];
}
