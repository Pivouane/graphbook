import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "eo"],
  defaultLocale: "en",
  localeDetection: true,
});
