import { room } from "./index.js";
import { isSpec } from "./roster.js";

const lastPlayerActivityTimestamp = new Map<number, number>();
const hasPlayerBeenWarnedToMove = new Set<number>();

export function setLastPlayerActivityTimestamp(playerId: number) {
    lastPlayerActivityTimestamp.set(playerId, Date.now());
}

export function handlePlayerActivity(playerId: number) {
    if (!isSpec(playerId)) {
        setLastPlayerActivityTimestamp(playerId);
        hasPlayerBeenWarnedToMove.delete(playerId);
    }
}

export function checkAndHandleInactivePlayers() {
    if (room.getPlayerList().length <= 2) return;

    const now = Date.now();
    for (const [playerId, timestamp] of lastPlayerActivityTimestamp) {
        if (now - timestamp >= 5000 && !hasPlayerBeenWarnedToMove.has(playerId)) {
            room.sendAnnouncement(`❗️ ${room.getPlayer(playerId).name}, move or kick!`, playerId, 0xFF0000, "bold", 2);
            hasPlayerBeenWarnedToMove.add(playerId);
        }
        if (now - timestamp >= 10000) room.kickPlayer(playerId, "AFK", false);
    }
}

export function removePlayerFromAfkMapsAndSets(playerId: number): void {
    lastPlayerActivityTimestamp.delete(playerId);
    hasPlayerBeenWarnedToMove.delete(playerId);
}
