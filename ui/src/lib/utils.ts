import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const rawMessage = `to=functions.createPatientTool json{"name":"Ahmet Mehmetoglu"}commentary to=functions.createAppointmentTool json{"patientId":"<patientId>","doctorId":"<doctorId>","date":"2025-11-24T12:00:00.000Z","notes":"Genel görüşme"}commentaryHarika! Randevunuz oluşturuldu 📅 24 Kasım 12:00 👨‍⚕️ Dr. Ahmet. Görüşme için sabırsızlanıyoruz!`;

function parseMessage(content: string) {
  // Logic to strip tool calls
  // Pattern seems to be: to=... json{...}commentary
  // We want to remove everything up to the last "commentary" or just extract the text.

  // Regex to find tool calls: /to=[\w\.]+ json\{.*?\}commentary/g
  // But "commentary" might be followed by text immediately.

  let cleaned = content;

  // Remove tool calls with commentary marker
  // Using non-greedy match for json content
  cleaned = cleaned.replace(/to=[\w\.]+\s+json\{.*?\}commentary/g, "");

  return cleaned;
}