// App side (not game code): builds the server's per-battle unit (Network.Definition.QuestBattle.BattleUnit) from the
// app's kioku build. The server computes these numbers; the app's stat model (src/models/Kioku) stands in for it.
// Passive list order = the order the game triggers them in (ability, crystalis, ascensions, portrait, support),
// see PvPKioku.triggerOrderEffects.
import { BattleUnit as NetworkBattleUnit } from "../Network/Definition/QuestBattle/BattleUnit";
import { AttackInfo } from "../Network/Definition/QuestBattle/AttackInfo";
import { PassiveSkillInfo } from "../Network/Definition/QuestBattle/PassiveSkillInfo";
import styleMstList from "../../assets/base_data/getStyleMstList.json";
/** The parts of src/models/Kioku used here (kept structural so the engine does not type-check src/models). */
export interface Kioku {
    data: any;
    critRate: number;
    critDamage: number;
    getBaseHp(): number;
    getBaseAtk(): number;
    getBaseDef(): number;
}

const styleById = new Map<number, any>((styleMstList as any[]).map(s => [s.styleMstId, s]));

function attack(skillId: number, level: number): AttackInfo {
    const a = new AttackInfo();
    a.skillMstId = skillId * 100 + level;
    a.level = level;
    return a;
}
function passive(passiveSkillMstId: number, level: number, abilitySourceType: number): PassiveSkillInfo {
    const p = new PassiveSkillInfo();
    p.passiveSkillMstId = passiveSkillMstId;
    p.level = level;
    p.abilitySourceType = abilitySourceType;
    return p;
}

/** position 1..5 = battleUnitDataId (QuestBattleUnitProvider uses the data id as the position). */
export function kiokuToNetworkUnit(kioku: Kioku, position: number): NetworkBattleUnit {
    const k = kioku as any;
    const data = kioku.data;
    const style = styleById.get(data.id) ?? {};
    const u = new NetworkBattleUnit();
    u.battleUnitDataId = position;
    u.battleUnitType = 1;
    u.battleUnitMstId = Math.trunc(data.id / 100); // characterMstId
    // a made-up style (same kit, another element / role: the Kioku Grid bench's identities, battle/EngineBench.ts)
    u.styleMstId = k.engineStyleMstId ?? data.id;
    u.maxHp = kioku.getBaseHp();
    u.atk = kioku.getBaseAtk();
    u.def = kioku.getBaseDef();
    u.speed = data.minSpd;
    u.criticalRate = kioku.critRate;
    u.criticalDamageRate = kioku.critDamage;
    for (const key of ["breakDamageRate", "healRate", "recoveryEpRate", "effectHitRate", "effectParryRate",
        "fireDamageRate", "aquaDamageRate", "forestDamageRate", "lightDamageRate", "darkDamageRate", "neutralDamageRate",
        "fireResistRate", "aquaResistRate", "forestResistRate", "lightResistRate", "darkResistRate", "neutralResistRate"]) {
        (u as any)[key] = style[key] ?? 0;
    }
    // made-up skills (same rows, another damage element: the Kioku Grid bench's identities, battle/EngineBench.ts)
    const ids = k.engineSkillIds ?? {};
    u.normalAttackInfo = attack(ids.attack ?? data.attack_id, k.attackLvl);
    u.attackInfoList = [attack(ids.skill ?? data.skill_id, k.skillLvl)];
    u.specialAttackInfo = attack(ids.special ?? data.special_id, Math.max(1, k.specialLvl));
    const passives: PassiveSkillInfo[] = [];
    passives.push(passive(data.ability_id * 100 + k.abilityLvl, k.abilityLvl, 1)); // AbilitySourceType.Unit
    for (const c of k.crys as number[]) passives.push(passive(c, c % 100, 4)); // SelectionAbility (crystalis passive id already has its level)
    for (let i = 1; i <= k.ascension; i++) {
        const id = (data as any)[`ascension_${i}_effect_2_id`];
        if (id) passives.push(passive(id * 100 + 1, 1, 1));
    }
    if (k.portrait) passives.push(passive(k.portrait.passiveSkill1 * 100 + 6, 6, 2)); // Card
    if (k.support && [data.role, data.element].includes(k.support.data.support_target)) {
        passives.push(passive(k.support.data.support_id * 100 + k.support.supportLvl, k.support.supportLvl, 3)); // Support
    }
    u.passiveSkillInfoList = passives;
    return u;
}
