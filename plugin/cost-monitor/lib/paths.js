import path from 'node:path';
import os from 'node:os';
export function getQuotaBaseDir() {
    return path.join(os.homedir(), '.local', 'share', 'opencode');
}
export function getQuotaSessionsDir() {
    return path.join(getQuotaBaseDir(), 'quota-sidebar-sessions');
}
export function getQuotaStatePath() {
    return path.join(getQuotaBaseDir(), 'quota-sidebar.state.json');
}
export function getTodayDateKey() {
    const now = new Date();
    const yyyy = now.getFullYear().toString();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
export function getSessionFilePathForDate(dateStr) {
    // dateStr is formatted as YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
        throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
    }
    const [yyyy, mm, dd] = parts;
    return path.join(getQuotaSessionsDir(), yyyy, mm, `${dd}.json`);
}
