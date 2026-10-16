// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { HashSet, List } from "../../runtime";
import type { BattleUnit_TeamType } from "../BattleUnit";

// ---- ReDriveBattleCore.AI.AIActionEffectHistory  (TypeDefIndex 1078, public class) ----
export class AIActionEffectHistory {
    /** 0x10 private HashSet<string> allyActionEffectTypes */
    allyActionEffectTypes: HashSet<string> = null!;
    /** 0x18 private HashSet<string> enemyActionEffectTypes */
    enemyActionEffectTypes: HashSet<string> = null!;
    /** @rva 0x18067E0  public void AddAppliedEffectTypes(List<string> appliedSkillEffectTypes, BattleUnit.TeamType teamType) { } */
    AddAppliedEffectTypes(appliedSkillEffectTypes: List<string>, teamType: BattleUnit_TeamType): void {
        const hashSet = teamType === 0 ? this.allyActionEffectTypes : this.enemyActionEffectTypes;
        if (appliedSkillEffectTypes == null) return;
        for (const effectType of appliedSkillEffectTypes) hashSet.add(effectType);
    }
    /** @rva 0x1806920  public HashSet<string> GetAppliedEffectTypes(BattleUnit.TeamType teamType) { } */
    GetAppliedEffectTypes(teamType: BattleUnit_TeamType): HashSet<string> {
        return teamType === 0 ? this.allyActionEffectTypes : this.enemyActionEffectTypes;
    }
    /** @rva 0x1806930  public void .ctor() { } */
    ctor(): this {
        this.allyActionEffectTypes = new Set<string>();
        this.enemyActionEffectTypes = new Set<string>();
        return this;
    }
}
