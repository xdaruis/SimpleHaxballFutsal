export const teamColorConfig = {
    red: 0xff4c4c,
    blue: 0x62cbff,
} as const;

const TEAM_ID = { red: 1, blue: 2 } as const;

export function applyTeamColors(room: RoomObject): void {
    room.setTeamColors(TEAM_ID.red, 0, 0, [teamColorConfig.red]);
    room.setTeamColors(TEAM_ID.blue, 0, 0, [teamColorConfig.blue]);
}

export function setCustomStadiumWithTeamColors(room: RoomObject, stadium: string): void {
    room.setCustomStadium(stadium);
    applyTeamColors(room);
}
