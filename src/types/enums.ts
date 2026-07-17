export enum KiokuElement {
    Flame = "Flame",
    Aqua = "Aqua",
    Forest = "Forest",
    Light = "Light",
    Dark = "Dark",
    Void = "Void"
}

export enum Aliment {
    BURN = "BURN",
    CURSE = "CURSE",
    POISON = "POISON",
    STUN = "STUN",
    VORTEX = "VORTEX",
    WEAKNESS = "WEAKNESS",
    WOUND = "BLEED",
}

export const elementAlimentMap: Record<KiokuElement, Aliment> = {
    [KiokuElement.Flame]: Aliment.BURN,
    [KiokuElement.Aqua]: Aliment.WEAKNESS,
    [KiokuElement.Forest]: Aliment.POISON,
    [KiokuElement.Light]: Aliment.STUN,
    [KiokuElement.Dark]: Aliment.CURSE,
    [KiokuElement.Void]: Aliment.WOUND,
};

export enum KiokuRole {
    Attacker = "Attacker",
    Buffer = "Buffer",
    Debuffer = "Debuffer",
    Healer = "Healer",
    Breaker = "Breaker",
    Defender = "Defender"
}

export const roleMap: Record<string, KiokuRole> = {
    1: KiokuRole.Attacker,
    2: KiokuRole.Breaker,
    3: KiokuRole.Healer,
    4: KiokuRole.Buffer,
    5: KiokuRole.Debuffer,
    6: KiokuRole.Defender,
};

export type SupportKey = KiokuRole | KiokuElement

export const elementMap: Record<string, KiokuElement> = {
    1: KiokuElement.Flame,
    2: KiokuElement.Aqua,
    3: KiokuElement.Forest,
    4: KiokuElement.Light,
    5: KiokuElement.Dark,
    6: KiokuElement.Void,
};