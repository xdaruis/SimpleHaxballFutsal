import * as fs from "fs";

let practiceWallsEnabled = false;

const practiceStadiumPlain = fs.readFileSync("stadiums/practice.hbs", "utf8");
const practiceStadiumWithWalls = fs.readFileSync("stadiums/practice+walls.hbs", "utf8");

export function getPracticeStadium(): string {
    return practiceWallsEnabled ? practiceStadiumWithWalls : practiceStadiumPlain;
}

export function isPracticeWallsEnabled(): boolean {
    return practiceWallsEnabled;
}

export function togglePracticeWalls(): boolean {
    practiceWallsEnabled = !practiceWallsEnabled;
    return practiceWallsEnabled;
}
