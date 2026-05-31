import { room, debuggingMode, playerConnStrings, activeConnStrings, adminAuthList, restartGameWithCallback } from "./index.js";
import { movePlayerToTeam, moveOneSpecToEachTeam, addSpec, firstSpec, specCount } from "./roster.js";

export function handlePlayerJoining(player: PlayerObject): void {
    const playerId: number = player.id;
    const playerName: string = player.name;
    const playerList: PlayerObject[] = room.getPlayerList();
    if (isPlayerAlreadyConnected(player, player.conn)) return;
    if (adminAuthList.has(player.auth)) room.setPlayerAdmin(playerId, true);
    room.sendAnnouncement(`👋 Welcome ${playerName}!`, playerId, 0x00FF00, "bold", 0);
    addSpec(playerId);
    console.log(`>>> ${playerName} enter.`);
    checkAndRestartWithNewMode(playerList);
}

function checkAndRestartWithNewMode(playerList: PlayerObject[]): void {
    const playerListLength: number = playerList.length;
    if (playerListLength === 1) restartGameWithCallback(() => movePlayerToTeam(playerList[0]!.id, "red"));
    if (playerListLength === 2) restartGameWithCallback(() => movePlayerToTeam(firstSpec()!, "blue"));
    if (playerListLength <= 6 && specCount() === 2) restartGameWithCallback(() => moveOneSpecToEachTeam());
}

function isPlayerAlreadyConnected(player: PlayerObject, conn: string): boolean {
    const playerId = player.id;
    if (!debuggingMode && activeConnStrings.has(conn)) {
        room.kickPlayer(playerId, "Already connected", false);
        console.warn(`>>> ${player.name} kick. Reason: double connect.`);
        return true;
    }
    playerConnStrings.set(playerId, conn);
    activeConnStrings.add(conn);
    return false;
}
