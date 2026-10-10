// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectBase } from "../AbilityEffect/AbilityEffectBase";
import type { ActBase } from "../Act/ActBase";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { BattleConditionUtils_Condition } from "./BattleConditionUtils";
import { ConditionCheckerBase } from "./ConditionCheckerBase";
import type { CountdownReferee } from "../CountdownReferee";
import type { GameDirectorBase } from "../GameDirectorBase";

// ---- ReDriveBattleCore.BattleCondition.BattleOtherConditionChecker  (TypeDefIndex 1063, public class) ----
export class BattleOtherConditionChecker extends ConditionCheckerBase {
    /** 0x18 private ActBase act */
    act: ActBase = null!;
    /** 0x20 private ActiveSkillBase actorActiveSkill */
    actorActiveSkill: ActiveSkillBase = null!;
    /** 0x28 private AbilityEffectBase actorAbilityEffect */
    actorAbilityEffect: AbilityEffectBase = null!;
    /** 0x30 private CountdownReferee countdownReferee */
    countdownReferee: CountdownReferee = null!;
    /** 0x38 private bool isSeasonBuffActive */
    isSeasonBuffActive: boolean = false;
    /** @rva 0x17E3DE0  public void .ctor(BattleConditionUtils.Condition condition, ActBase act, ActiveSkillBase actorActiveSkill, AbilityEffectBase actorAbilityEffect, GameDirectorBase gameDirector) { } */
    ctor$Condition_ActBase_ActiveSkillBase_AbilityEffectBase_GameDirectorBase(condition: BattleConditionUtils_Condition, act: ActBase, actorActiveSkill: ActiveSkillBase, actorAbilityEffect: AbilityEffectBase, gameDirector: GameDirectorBase): this { return notPorted("BattleOtherConditionChecker..ctor", 0x17E3DE0); }
    /** @rva 0x17E3850 slot 4  public override bool Check() { } */
    Check(): boolean { return notPorted("BattleOtherConditionChecker.Check", 0x17E3850); }
}
