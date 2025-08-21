import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAdmin(userRole?: string): boolean {
  return userRole === "admin"
}

export function isBusiness(userRole?: string): boolean {
  return userRole === "business"
}

export function isRep(userRole?: string): boolean {
  return userRole === "rep"
}
