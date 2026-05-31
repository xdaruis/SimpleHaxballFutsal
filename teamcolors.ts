export const teamColorConfig = {
    red: 0xbc0000,
    blue: 0x0069b9,
} as const;

const TEAM_ID = { red: 1, blue: 2 } as const;

export function applyTeamColors(room: RoomObject): void {
    room.setTeamColors(TEAM_ID.red, 0, 0xffffff, [teamColorConfig.red]);
    room.setTeamColors(TEAM_ID.blue, 0, 0xffffff, [teamColorConfig.blue]);
}

export function setCustomStadiumWithTeamColors(room: RoomObject, stadium: string): void {
    room.setCustomStadium(stadium);
    applyTeamColors(room);
}
