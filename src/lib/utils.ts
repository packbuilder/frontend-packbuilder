import { clsx, type ClassValue } from "clsx"
import { jwtDecode } from "jwt-decode"
import { twMerge } from "tailwind-merge"

type CustomJwtPayload = {
  exp: number,
  EmailVerified: string,
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string,
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseUserToken(jwt: string) {
  const data = jwtDecode(jwt) as CustomJwtPayload;  
  
  const emailVerified = data.EmailVerified.toLowerCase() === "true" ? true : false;
  
  return {
    id: parseInt(data["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]),
    emailVerified,
  }
}

export function enumNameFromValue<T extends Record<string, string>>(
  enumObj: T,
  value: string
): keyof T | undefined {
  return (Object.keys(enumObj) as (keyof T)[])
    .find(k => enumObj[k] === value);
}

export function timeSinceCurDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 }
  ];

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const interval of intervals) {
    const value = Math.floor(seconds / interval.seconds);
    if (Math.abs(value) >= 1) {
      return rtf.format(value, interval.label as Intl.RelativeTimeFormatUnit);
    }
  }

  return "just now";
}