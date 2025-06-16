import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formattedName = (name: string | undefined, maxLenght = 10) => {
  if (!name) return "";
  if (name.length < maxLenght) return name;
  return `${name.substring(0, maxLenght)}...${name.substring(name.length - maxLenght)}`;
};

export const pad = (n: number) => n.toString().padStart(2, "0");
