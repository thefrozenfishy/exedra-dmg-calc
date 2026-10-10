// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
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
    /** @rva 0x17DCD80  public void AddAppliedEffectTypes(List<string> appliedSkillEffectTypes, BattleUnit.TeamType teamType) { } */
    AddAppliedEffectTypes(appliedSkillEffectTypes: List<string>, teamType: BattleUnit_TeamType): void { return notPorted("AIActionEffectHistory.AddAppliedEffectTypes", 0x17DCD80); }
    /** @rva 0x17DCEC0  public HashSet<string> GetAppliedEffectTypes(BattleUnit.TeamType teamType) { } */
    GetAppliedEffectTypes(teamType: BattleUnit_TeamType): HashSet<string> { return notPorted("AIActionEffectHistory.GetAppliedEffectTypes", 0x17DCEC0); }
    /** @rva 0x17DCED0  public void .ctor() { } */
    ctor(): this { return notPorted("AIActionEffectHistory..ctor", 0x17DCED0); }
}
