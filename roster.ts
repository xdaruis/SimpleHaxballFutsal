import { removePlayerFromAfkMapsAndSets, setLastPlayerActivityTimestamp } from "./afkdetection.js";

export type Team = "red" | "blue";

const specQueue: number[] = [];
const redQueue: number[] = [];
const blueQueue: number[] = [];
const specIds = new Set<number>();
const redIds = new Set<number>();
const blueIds = new Set<number>();

let room: RoomObject;

export function initRoster(r: RoomObject): void {
    room = r;
}

function removeFromQueue(queue: number[], playerId: number): void {
    const index = queue.indexOf(playerId);
    if (index !== -1) queue.splice(index, 1);
}

export function addSpec(playerId: number): void {
    if (specIds.has(playerId)) return;
    specIds.add(playerId);
    specQueue.push(playerId);
}

export function removeFromRoster(playerId: number): void {
    specIds.delete(playerId);
    redIds.delete(playerId);
    blueIds.delete(playerId);
    removeFromQueue(specQueue, playerId);
    removeFromQueue(redQueue, playerId);
    removeFromQueue(blueQueue, playerId);
}

export function isSpec(playerId: number): boolean {
    return specIds.has(playerId);
}

export function isRed(playerId: number): boolean {
    return redIds.has(playerId);
}

export function isBlue(playerId: number): boolean {
    return blueIds.has(playerId);
}

export function getTeam(playerId: number): Team | "spec" | null {
    if (redIds.has(playerId)) return "red";
    if (blueIds.has(playerId)) return "blue";
    if (specIds.has(playerId)) return "spec";
    return null;
}

export function firstSpec(): number | undefined {
    return specQueue[0];
}

export function specCount(): number {
    return specQueue.length;
}

export function redCount(): number {
    return redQueue.length;
}

export function blueCount(): number {
    return blueQueue.length;
}

function movePlayerToSpec(playerId: number): void {
    removeFromRoster(playerId);
    room.setPlayerTeam(playerId, 0);
    specIds.add(playerId);
    specQueue.push(playerId);
    removePlayerFromAfkMapsAndSets(playerId);
}

export function movePlayerToTeam(playerId: number, team: Team): void {
    const queue = team === "red" ? redQueue : blueQueue;
    const ids = team === "red" ? redIds : blueIds;
    const teamId = team === "red" ? 1 : 2;

    if (ids.has(playerId)) return;

    removeFromRoster(playerId);
    room.setPlayerTeam(playerId, teamId);
    ids.add(playerId);
    queue.push(playerId);
    setLastPlayerActivityTimestamp(playerId);
}

export function moveOneSpecToEachTeam(): void {
    movePlayerToTeam(specQueue[0]!, "red");
    movePlayerToTeam(specQueue[0]!, "blue");
}

export function moveLastOppositeTeamMemberToSpec(oppositeTeam: Team): void {
    const queue = oppositeTeam === "red" ? redQueue : blueQueue;
    movePlayerToSpec(queue[queue.length - 1]!);
}

export function handleTeamWin(winningTeam: Team): void {
    if (winningTeam === "red") {
        if (specCount() === 0) return;
        for (let i = 0; i < blueCount(); ++i) {
            movePlayerToSpec(blueQueue[0]!);
            movePlayerToTeam(specQueue[0]!, "blue");
        }
        return;
    }
    for (let i = 0; i < blueCount(); ++i) {
        if (specCount()) movePlayerToSpec(redQueue[0]!);
        else movePlayerToTeam(redQueue[0]!, "blue");
        movePlayerToTeam(blueQueue[0]!, "red");
        if (specCount()) movePlayerToTeam(specQueue[0]!, "blue");
    }
}
