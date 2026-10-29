// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { IComparer } from "./IComparer";
import { StringValueComparer } from "./StringValueComparer";
import { BoolValueComparer } from "./BoolValueComparer";
import { IntValueComparer } from "./IntValueComparer";
import { RangeType } from "../../Network/Definition/Battle/RangeType";
import { SkillType } from "../../Network/Definition/Battle/SkillType";
import { DamageAbilityEffectBase } from "../AbilityEffect/DamageAbilityEffectBase";
import { ComboTurnUnitAct } from "../Act/ComboTurnUnitAct";
import { AdditionalSkill } from "../AdditionalSkill";
import { SpecialAttack } from "../SpecialAttack";
import { ActiveSkill } from "../ActiveSkill";
import { NormalAttack } from "../NormalAttack";
import { SoloRaidGameDirector } from "../SoloRaidGameDirector";
import { enumParse, enumToString, notPorted } from "../../runtime";
import type { AbilityEffectBase } from "../AbilityEffect/AbilityEffectBase";
import type { ActBase } from "../Act/ActBase";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { BattleConditionUtils_Condition } from "./BattleConditionUtils";
import { ConditionCheckerBase } from "./ConditionCheckerBase";
import type { CountdownReferee } from "../CountdownReferee";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { Nullable } from "../../runtime";

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
    /** @rva 0x17F4E30  public void .ctor(BattleConditionUtils.Condition condition, ActBase act, ActiveSkillBase actorActiveSkill, AbilityEffectBase actorAbilityEffect, GameDirectorBase gameDirector) { } */
    ctor$Condition_ActBase_ActiveSkillBase_AbilityEffectBase_GameDirectorBase(condition: BattleConditionUtils_Condition, act: ActBase, actorActiveSkill: ActiveSkillBase, actorAbilityEffect: AbilityEffectBase, gameDirector: GameDirectorBase): this {
        this.condition = condition; // base..ctor(condition) inlined in the game
        this.act = act;
        this.actorActiveSkill = actorActiveSkill;
        this.actorAbilityEffect = actorAbilityEffect;
        if (gameDirector instanceof SoloRaidGameDirector) {
            this.countdownReferee = gameDirector.countdownReferee;
            this.isSeasonBuffActive = gameDirector.soloRaidBuffReferee.isSeasonBuffActive;
        }
        return this;
    }
    /** @rva 0x17F48A0 slot 4  public override bool Check() { } */
    Check(): boolean {
        let comparer: IComparer | null = null;
        switch (this.condition._CompareContent) {
            case 401: {
                let skillType: Nullable<SkillType>;
                const s = this.actorActiveSkill;
                if (s instanceof NormalAttack) skillType = 3;
                else if (s instanceof ActiveSkill) skillType = 1;
                else if (s instanceof SpecialAttack) skillType = 2;
                else if (s instanceof AdditionalSkill) skillType = s.skillType;
                else return false;
                if (skillType == null) return false;
                comparer = new IntValueComparer().ctor$int_int(skillType, enumParse(SkillType, this.condition._CompareValue));
                break;
            }
            case 402: {
                if (!(this.act instanceof ComboTurnUnitAct)) return false;
                comparer = new IntValueComparer().ctor$int_int(this.act._ActionStep, this.condition.get_CompareValueInt() /* inlined in the game */);
                break;
            }
            case 403: {
                const e = this.actorAbilityEffect;
                if (!(e instanceof DamageAbilityEffectBase)) return false;
                const category = e.get_DamageCategory();
                if (!(category === 1 || category === 2)) return false;
                comparer = new StringValueComparer().ctor$string_string(enumToString(RangeType, e._EffectRange), this.condition._CompareValue.trim());
                break;
            }
            case 1101:
                comparer = new BoolValueComparer().ctor$bool_bool(this.isSeasonBuffActive, this.condition.get_CompareValueBool() /* inlined in the game */);
                break;
            case 1201: {
                let countdown = 0;
                if (this.countdownReferee != null) countdown = this.countdownReferee.countdown;
                comparer = new IntValueComparer().ctor$int_int(countdown, this.condition.get_CompareValueInt() /* inlined in the game */);
                break;
            }
            case 1202: {
                let isCancelReached = false;
                if (this.countdownReferee != null && 0 < this.countdownReferee.cancelMaxTotalDamage) {
                    isCancelReached = this.countdownReferee.cancelMaxTotalDamage <= this.countdownReferee.cancelTotalDamage;
                }
                comparer = new BoolValueComparer().ctor$bool_bool(isCancelReached, this.condition.get_CompareValueBool() /* inlined in the game */);
                break;
            }
            default:
                return false;
        }
        if (comparer == null) return false;
        return comparer.Compare(this.condition._CompareOperator);
    }
}
