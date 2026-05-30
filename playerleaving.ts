import { removePlayerFromAfkMapsAndSets } from "./afkdetection.js";
import { playerConnStrings, activeConnStrings, room, pauseUnpauseGame, restartGameWithCallback } from "./index.js";
import {
    movePlayerToTeam,
    moveLastOppositeTeamMemberToSpec,
    getTeam,
    removeFromRoster,
    firstSpec,
    specCount,
    type Team,
} from "./roster.js";

export function handlePlayerLeaving(player: PlayerObject): void {
    const playerId: number = player.id;
    const team = getTeam(playerId);
    const playerList = room.getPlayerList();

    if (team === "red" || team === "blue") {
        if (playerList.length !== 0) handleTeamPlayerLeaving(team, playerList);
    }

    const conn = playerConnStrings.get(playerId);
    if (conn !== undefined) activeConnStrings.delete(conn);
    removeFromRoster(playerId);
    removePlayerFromAfkMapsAndSets(playerId);
    playerConnStrings.delete(playerId);
    if (playerList.length === 0) room.stopGame();
    console.log(`>>> ${player.name} leave.`);
}

function handleTeamPlayerLeaving(leavingTeam: Team, playerList: PlayerObject[]) {
    const oppositeTeam: Team = leavingTeam === "red" ? "blue" : "red";
    if (playerList.length === 1) {
        restartGameWithCallback(() => movePlayerToTeam(playerList[0]!.id, "red"));
    } else if (specCount() === 0) {
        restartGameWithCallback(() => moveLastOppositeTeamMemberToSpec(oppositeTeam));
    } else {
        movePlayerToTeam(firstSpec()!, leavingTeam);
        pauseUnpauseGame();
    }
}
