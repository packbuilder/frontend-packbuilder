import { clsx, type ClassValue } from "clsx"
import { jwtDecode } from "jwt-decode"
import { twMerge } from "tailwind-merge"

type CustomJwtPayload = {
  exp: number,
  Avatar: string,
  UpdatedAt: string,
  CreatedAt: string,
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string,
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string,
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseUserToken(jwt: string) {
  const data = jwtDecode(jwt) as CustomJwtPayload;   
  
  return {
    email: data["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
    name: data["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
    id: parseInt(data["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]),
    avatar: data.Avatar
  }
}

export function enumNameFromValue<T extends Record<string, string>>(
  enumObj: T,
  value: string
): keyof T | undefined {
  return (Object.keys(enumObj) as (keyof T)[])
    .find(k => enumObj[k] === value);
}
