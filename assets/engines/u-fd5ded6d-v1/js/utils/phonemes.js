const OBSTRUENT_MANNERS = new Set([
    "stop", "fricative", "affricate", "sibilant",
]);
export function isObstruent(p) {
    return OBSTRUENT_MANNERS.has(p.mannerOfArticulation);
}
export function isNasal(p) {
    return p.mannerOfArticulation === "nasal";
}
export function isStop(p) {
    return p.mannerOfArticulation === "stop";
}
