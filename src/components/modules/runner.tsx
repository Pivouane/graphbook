import { ModuleContext, ModulePayload } from "@/modules/types";

interface Props {
  activeModules: ModulePayload[];
  context: ModuleContext;
}

function ModuleError({ slug }: { slug: string }) {
  return (
    <div className="p-4 text-red-500 text-sm">
      Failed to load module: {slug}
    </div>
  );
}

export async function ModuleRunner({ activeModules, context }: Props) {
  const modules = await Promise.all(
    activeModules.map(async ({ slug, args }) => {
      try {
        const mod = await import(`@/modules/${slug}/index`);
        const manifest = await import(`@/modules/${slug}/manifest.json`, {
          with: { type: "json" },
        });
        return { slug, args, Component: mod.default, manifest: manifest.default };
      } catch {
        return {
          slug,
          args: {},
          Component: () => <ModuleError slug={slug} />,
          manifest: {
            slug,
            name: slug,
            description: "Failed to load module",
            default: false,
          }
        };
      }
    })
  );

  return (
    <div className="relative w-full h-screen">
      {modules.map(({ slug, args, Component, manifest }) => (
        <Component key={slug} context={context} manifest={manifest} {...args} />
      ))}
    </div>
  );
}
