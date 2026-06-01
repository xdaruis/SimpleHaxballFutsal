import HaxballJS from "haxball.js";
import * as fs from "fs";
import { handlePlayerActivity, checkAndHandleInactivePlayers } from "./afkdetection.js";
import { handlePlayerJoining } from "./playerjoining.js";
import { handlePlayerLeaving } from "./playerleaving.js";
import { handleTeamWin, type Team } from "./teammanagement.js";
import { checkAndHandleSpam } from "./moderation.js";
import { checkAndHandleCommands } from "./commands.js";
import { initRoster } from "./roster.js";
import { getPracticeStadium } from "./practice.js";
import { setCustomStadiumWithTeamColors } from "./teamcolors.js";

export const debuggingMode = false;
const scoreLimit: number = 3;
const timeLimit: number = 3;

export const playerConnStrings = new Map<number, string>();
export const activeConnStrings = new Set<string>();
export const adminAuthList: Set<string> = new Set(fs.readFileSync("lists/adminlist.txt", "utf8").split("\n").map((line: string) => line.trim()));
const tokenFile: string = fs.readFileSync("token.txt", "utf8");
const stadium1x1: string = fs.readFileSync("stadiums/futsal1x1.hbs", "utf8");
const stadium2x2: string = fs.readFileSync("stadiums/futsal2x2.hbs", "utf8");
const stadium3x3: string = fs.readFileSync("stadiums/futsal3x3.hbs", "utf8");

export let room: RoomObject;

function teamIdToTeam(teamId: number): Team {
  return teamId === 1 ? "red" : "blue";
}

HaxballJS.then((HBInit) => {
  room = HBInit({
    roomName: "▶ 𝐃𝐀𝐑𝐔𝐈𝐒 𝐅𝐔𝐓𝐒𝐀𝐋 3x3 BOT ◀",
    maxPlayers: 16,
    public: !debuggingMode,
    noPlayer: true,
    geo: {
      code: "RO",
      lat: 45.75372,
      lon: 21.22571
    },
    token: tokenFile, // https://haxball.com/headlesstoken
  });
  initRoster(room);

  room.setScoreLimit(scoreLimit);
  room.setTimeLimit(timeLimit);
  room.setTeamsLock(true);
  room.setRequireRecaptcha(true);
  setCustomStadiumWithTeamColors(room, getPracticeStadium());

  room.onRoomLink = function (url: string) {
    console.log(url);
  };

  room.onPlayerJoin = function (player: PlayerObject): void {
    handlePlayerJoining(player);
  }

  room.onPlayerLeave = function (player: PlayerObject): void {
    handlePlayerLeaving(player);
  }

  room.onTeamGoal = function (teamId: number) {
    const scores = room.getScores();
    const teamScore = teamId === 1 ? scores.red : scores.blue;
    const winningTeam = teamIdToTeam(teamId);
    if (teamScore === scoreLimit || scores.time > timeLimit * 60) restartGameWithCallback(() => handleTeamWin(winningTeam));
  }

  //triggers *only* when a team is winning and the timer runs out, 
  //because the room is also listening for the onTeamGoal event, which triggers first
  room.onTeamVictory = function (scores: ScoresObject): void {
    const winningTeam: Team = scores.red > scores.blue ? "red" : "blue";
    restartGameWithCallback(() => handleTeamWin(winningTeam));
  }

  room.onPlayerActivity = function (player: PlayerObject): void {
    handlePlayerActivity(player.id);
  }

  let tickCounter = 0;
  room.onGameTick = function (): void {
    if (!debuggingMode) {
      ++tickCounter;
      if (tickCounter >= 60) {
        checkAndHandleInactivePlayers();
        tickCounter = 0;
      }
    }
  }

  room.onPlayerChat = function (player: PlayerObject, message: string): boolean {
    console.log(`${player.name}: ${message}`);
    return !checkAndHandleCommands(player, message) && !checkAndHandleSpam(player, message);
  }
});

export function restartGameWithCallback(callback: () => void): void {
  room.stopGame();
  callback();
  setAppropriateStadium();
  room.startGame();
  const playerList: PlayerObject[] = room.getPlayerList();
  if (playerList.length !== 1) pauseUnpauseGame();
}

function setAppropriateStadium() {
  const playerListLength = room.getPlayerList().length;
  if (playerListLength === 1) {
    setCustomStadiumWithTeamColors(room, getPracticeStadium());
  } else if (playerListLength <= 3) {
    setCustomStadiumWithTeamColors(room, stadium1x1);
  } else if (playerListLength >= 6) {
    setCustomStadiumWithTeamColors(room, stadium3x3);
  } else {
    setCustomStadiumWithTeamColors(room, stadium2x2);
  }
}

export function pauseUnpauseGame() {
  room.pauseGame(true);
  room.pauseGame(false);
}
