import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.jsonl");

export type LeadRecord = {
  timestamp: string;
  nome: string;
  email: string;
  whatsapp: string;
  payload: unknown;
  report_summary?: string;
};

export async function saveLead(record: LeadRecord): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(LEADS_FILE, JSON.stringify(record) + "\n", "utf-8");
}
