import { room } from "./index.js";

interface Command {
    name: string;
    description: string;
    emoji: string;
    adminOnly: boolean
    response: (player: PlayerObject) => void;
}

const commands: Command[] = [
    {
        name: "help",
        description: "show command list",
        emoji: "❓",
        adminOnly: false,
        response: (player: PlayerObject) => {
            commands.forEach((command) => {
                if (command.adminOnly && !player.admin) return;
                sendBoldWhiteAnnouncement(`${command.emoji} !${command.name}: ${command.description}.`, player.id);
            });
        }
    },
    {
        name: "github",
        description: "show room github link",
        emoji: "👨‍💻",
        adminOnly: false,
        response: (player: PlayerObject) => {
            sendBoldWhiteAnnouncement("👨‍💻 Code open source: github.com/DazzDev/SimpleHaxballFutsal.", player.id);
        }
    },
    {
        name: "bb",
        description: "leave room",
        emoji: "👋",
        adminOnly: false,
        response: (player: PlayerObject) => {
            room.kickPlayer(player.id, "Command !bb", false);
        }
    }
];

export function checkAndHandleCommands(player: PlayerObject, message: string): boolean {
    if (!isCommand(message)) return false;
    const commandMessage = message.substring(1);
    const command = commands.find((command) => command.name === commandMessage);
    if (!command) {
        room.sendAnnouncement("🚫 Command no exist. Type !help.", player.id, 0xFF0000, "bold", 0);
        return true;
    }
    command.response(player);
    return true;
}

export function isCommand(message: string): boolean {
    return (message !== "!" && message.startsWith("!"))
}

function sendBoldWhiteAnnouncement(message: string, playerId: number) {
    room.sendAnnouncement(message, playerId, 0xFFFFFF, "bold", 0);
}