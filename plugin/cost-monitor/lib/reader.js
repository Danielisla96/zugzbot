import fs from 'node:fs/promises';
import { getQuotaStatePath, getSessionFilePathForDate } from './paths';
export async function readQuotaState() {
    try {
        const filePath = getQuotaStatePath();
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export async function readQuotaFile(dateStr) {
    try {
        const filePath = getSessionFilePathForDate(dateStr);
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
