import { isCommand } from "./commands.js";
import { room } from "./index.js";

const playerConsecutiveMessages = new Map<number, string[]>();
const playerMessageTimestamps = new Map<number, number[]>();
const rateLimit = 5;
const rateLimitTimeSpan = 4000;

export function checkAndHandleSpam(player: PlayerObject, message: string): boolean {
    const playerId: number = player.id;
    if (!isCommand(message) && (isPlayerAboveRateLimit(playerId) || is3rdConsecutiveMessage(playerId, message))) {
        room.kickPlayer(playerId, "Spam", false);
        console.warn(`>>> ${player.name} kick. Reason: spam.`);
        return true;
    }
    return false;
}

function isPlayerAboveRateLimit(playerId: number): boolean {
    const currentTimestamp = Date.now();
    let messageTimestamps: number[] = playerMessageTimestamps.get(playerId) || [];
    while (messageTimestamps.length > 0 && currentTimestamp - messageTimestamps[0]! > rateLimitTimeSpan) messageTimestamps.shift();
    if (messageTimestamps.length >= rateLimit) return true;
    messageTimestamps.push(currentTimestamp);
    playerMessageTimestamps.set(playerId, messageTimestamps);
    return false;
}

function is3rdConsecutiveMessage(playerId: number, message: string): boolean {
    const messages = playerConsecutiveMessages.get(playerId) || [];
    const lastMessage = messages[messages.length - 1];
    if (lastMessage === message) {
        messages.push(message);
        playerConsecutiveMessages.set(playerId, messages);
        if (messages.length === 3) return true;
    } else {
        playerConsecutiveMessages.delete(playerId);
        playerConsecutiveMessages.set(playerId, [message]);
    }
    return false;
}
