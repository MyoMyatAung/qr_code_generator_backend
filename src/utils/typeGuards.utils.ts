import {Employee, Media, Social} from "../models/qr.model";

// Type guard to check if data is of type Employee
export function isEmployee(data: any): data is Employee {
  return data && typeof data === "object" && 'firstName' in data && 'lastName' in data;
}

// Type guard to check if data is of type Media
export function isMedia(data: any): data is Media {
  return data && typeof data === "object" && 'title' in data && 'description' in data;
}

// Type guard to check if data is of type Social
export function isSocial(data: any): data is Social {
  return data && typeof data === "object" && 'title' in data && 'description' in data && 'socialMedia' in data;
}