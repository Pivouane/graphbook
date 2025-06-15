import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pascalCase(name: string): string {
  return name
    .replace(/\./g, " ")
    .replace(/(\s[a-zA-Z0-9])+/g, (chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (chr) => chr.toUpperCase());
}

export function firstName(name: string): string {
  return name.split(".")[0].replace(/^[a-z]/, (chr) => chr.toUpperCase());
}

export function initials(name: string): string {
  return name
    .split(".")
    .map((part) => part[0].toUpperCase())
    .join("");
}
