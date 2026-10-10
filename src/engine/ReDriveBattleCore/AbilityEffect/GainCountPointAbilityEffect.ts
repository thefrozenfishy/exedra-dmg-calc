// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { CountPointVariationAbilityEffectBase } from "./CountPointVariationAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";

// ---- ReDriveBattleCore.AbilityEffect.GainCountPointAbilityEffect  (TypeDefIndex 1167, public class) ----
export class GainCountPointAbilityEffect extends CountPointVariationAbilityEffectBase {
    /** 0x60 protected int gainPoint */
    gainPoint: int = 0;
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("GainCountPointAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18ED6B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("GainCountPointAbilityEffect..ctor", 0x18ED6B0); }
    /** @rva 0x8A2200 slot 8  protected override int GetModifyCountPoint() { } */
    GetModifyCountPoint(): int { return this.gainPoint; /* asm: mov eax, dword ptr [rcx + 0x60]; ret */ }
    /** @rva 0x18F2950 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("GainCountPointAbilityEffect.GetAIFilteredTargets", 0x18F2950); }
}
