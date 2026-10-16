// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { ConsumeSelfHpAbilityEffect } from "./AbilityEffect/ConsumeSelfHpAbilityEffect";
import { ZoneStackAbilityEffect } from "./AbilityEffect/ZoneStackAbilityEffect";
import { ZoneReleaseAbilityEffect } from "./AbilityEffect/ZoneReleaseAbilityEffect";
import { ZoneExpandAbilityEffect } from "./AbilityEffect/ZoneExpandAbilityEffect";
import { SummonAbilityEffect } from "./AbilityEffect/SummonAbilityEffect";
import { SlowAbilityEffect } from "./AbilityEffect/SlowAbilityEffect";
import { RevivalRatioAbilityEffect } from "./AbilityEffect/RevivalRatioAbilityEffect";
import { ResetUniqueDebuffAbilityEffect } from "./AbilityEffect/ResetUniqueDebuffAbilityEffect";
import { ResetUniqueBuffAbilityEffect } from "./AbilityEffect/ResetUniqueBuffAbilityEffect";
import { RemoveAllUnableActionAbilityEffect } from "./AbilityEffect/RemoveAllUnableActionAbilityEffect";
import { RemoveAllDebuffAbilityEffect } from "./AbilityEffect/RemoveAllDebuffAbilityEffect";
import { RemoveAllBuffAbilityEffect } from "./AbilityEffect/RemoveAllBuffAbilityEffect";
import { RemoveAllAbnormalAbilityEffect } from "./AbilityEffect/RemoveAllAbnormalAbilityEffect";
import { RecoveryHpAtkAbilityEffect } from "./AbilityEffect/RecoveryHpAtkAbilityEffect";
import { RecoveryHpAbilityEffect } from "./AbilityEffect/RecoveryHpAbilityEffect";
import { ReActionTurnUnitActAbilityEffect } from "./AbilityEffect/ReActionTurnUnitActAbilityEffect";
import { LoseEpRatioAbilityEffect } from "./AbilityEffect/LoseEpRatioAbilityEffect";
import { LoseEpFixedAbilityEffect } from "./AbilityEffect/LoseEpFixedAbilityEffect";
import { LoseBpFixedAbilityEffect } from "./AbilityEffect/LoseBpFixedAbilityEffect";
import { ImmSlipDmgAbilityEffect } from "./AbilityEffect/ImmSlipDmgAbilityEffect";
import { HasteAbilityEffect } from "./AbilityEffect/HasteAbilityEffect";
import { GainZoneStackAbilityEffect } from "./AbilityEffect/GainZoneStackAbilityEffect";
import { GainSpFixedAbilityEffect } from "./AbilityEffect/GainSpFixedAbilityEffect";
import { GainSoloRaidBuffPointAbilityEffect } from "./AbilityEffect/GainSoloRaidBuffPointAbilityEffect";
import { GainEpRatioAbilityEffect } from "./AbilityEffect/GainEpRatioAbilityEffect";
import { GainEpFixedAbilityEffect } from "./AbilityEffect/GainEpFixedAbilityEffect";
import { GainCountPointAbilityEffect } from "./AbilityEffect/GainCountPointAbilityEffect";
import { GainChargePointAbilityEffect } from "./AbilityEffect/GainChargePointAbilityEffect";
import { GainBpFixedAbilityEffect } from "./AbilityEffect/GainBpFixedAbilityEffect";
import { DmgRatioAbilityEffect } from "./AbilityEffect/DmgRatioAbilityEffect";
import { DmgRandomAbilityEffect } from "./AbilityEffect/DmgRandomAbilityEffect";
import { DmgHpAbilityEffect } from "./AbilityEffect/DmgHpAbilityEffect";
import { DmgDefAbilityEffect } from "./AbilityEffect/DmgDefAbilityEffect";
import { DmgAtkAbilityEffect } from "./AbilityEffect/DmgAtkAbilityEffect";
import { DecDebuffTurnImmAbilityEffect } from "./AbilityEffect/DecDebuffTurnImmAbilityEffect";
import { DecBuffTurnImmAbilityEffect } from "./AbilityEffect/DecBuffTurnImmAbilityEffect";
import { CountdownDecreaseAbilityEffect } from "./AbilityEffect/CountdownDecreaseAbilityEffect";
import { CountdownCancelAbilityEffect } from "./AbilityEffect/CountdownCancelAbilityEffect";
import { ConsumeZoneStackAbilityEffect } from "./AbilityEffect/ConsumeZoneStackAbilityEffect";
import { ConsumeCountPointAbilityEffect } from "./AbilityEffect/ConsumeCountPointAbilityEffect";
import { ConsumeChargePointAbilityEffect } from "./AbilityEffect/ConsumeChargePointAbilityEffect";
import { ChargeAbilityEffect } from "./AbilityEffect/ChargeAbilityEffect";
import { AdditionalTurnUnitActAbilityEffect } from "./AbilityEffect/AdditionalTurnUnitActAbilityEffect";
import { AdditionalSkillActAbilityEffect } from "./AbilityEffect/AdditionalSkillActAbilityEffect";
import { AdditionalCountdownZeroSkillActAbilityEffect } from "./AbilityEffect/AdditionalCountdownZeroSkillActAbilityEffect";
import { AdditionalCountdownCancelSkillActAbilityEffect } from "./AbilityEffect/AdditionalCountdownCancelSkillActAbilityEffect";
import { AddDebuffTurnImmAbilityEffect } from "./AbilityEffect/AddDebuffTurnImmAbilityEffect";
import { AddBuffTurnImmAbilityEffect } from "./AbilityEffect/AddBuffTurnImmAbilityEffect";
import { StateTeamAbilityEffect } from "./AbilityEffect/StateTeamAbilityEffect";
import { StateAbilityEffect } from "./AbilityEffect/StateAbilityEffect";
import { UnitStateFactory } from "./UnitStateFactory";
import { isImpl, notPorted, runCctor } from "../runtime";
import type { Dictionary } from "../runtime";
import type { AbilityEffectBase } from "./AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "./AbilityEffectInfo";

// ---- ReDriveBattleCore.AbilityEffectFactory  (TypeDefIndex 271, public static class) ----
export class AbilityEffectFactory {
    /** 0x0 private static readonly Dictionary<string, Func<AbilityEffectInfo, AbilityEffectBase>> createDic */
    static createDic: Dictionary<string, ((a0: AbilityEffectInfo) => AbilityEffectBase)> = null!;
    /** @rva 0x128D1F0  public static bool CanCreate(string effectType) { } */
    static CanCreate(effectType: string): boolean {
        runCctor(AbilityEffectFactory);
        return AbilityEffectFactory.createDic.has(effectType);
    }
    /** @rva 0x128D270  public static AbilityEffectBase Create(AbilityEffectInfo info, bool isIncludeDeadUnitInTarget) { } */
    static Create(info: AbilityEffectInfo, isIncludeDeadUnitInTarget: boolean): AbilityEffectBase {
        runCctor(AbilityEffectFactory);
        if (UnitStateFactory.CanCreate(info.EffectType)) {
            const state = UnitStateFactory.Create(info);
            if (!isImpl(state, "ITargetTeam")) return new StateAbilityEffect().ctor$AbilityEffectInfo_UnitStateBase_bool(info, state, isIncludeDeadUnitInTarget);
            return new StateTeamAbilityEffect().ctor$AbilityEffectInfo_UnitStateBase_bool(info, state, isIncludeDeadUnitInTarget);
        }
        if (!AbilityEffectFactory.createDic.has(info.EffectType)) return null!;
        return AbilityEffectFactory.createDic.get(info.EffectType)!(info);
    }
    /** @rva 0x128D4D0  private static void .cctor() { } */
    static cctor(): void {
        // lazy (runCctor): the lambdas construct classes that import this module
        const dic = new Map<string, (info: AbilityEffectInfo) => AbilityEffectBase>();
        dic.set("DMG_ATK", info => new DmgAtkAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_0
        dic.set("DMG_DEF", info => new DmgDefAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_1
        dic.set("DMG_HP", info => new DmgHpAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_2
        dic.set("DMG_RANDOM", info => new DmgRandomAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_3
        dic.set("IMM_SLIP_DMG", info => new ImmSlipDmgAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_4
        dic.set("DMG_RATIO", info => new DmgRatioAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_5
        dic.set("RECOVERY_HP", info => new RecoveryHpAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_6
        dic.set("RECOVERY_HP_ATK", info => new RecoveryHpAtkAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_7
        dic.set("REVIVAL_RATIO", info => new RevivalRatioAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_8
        dic.set("CONSUME_SELF_HP", info => new ConsumeSelfHpAbilityEffect().ctor$AbilityEffectInfo(info)); // 3.21.0
        dic.set("GAIN_EP_FIXED", info => new GainEpFixedAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_9
        dic.set("GAIN_EP_RATIO", info => new GainEpRatioAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_10
        dic.set("LOSE_EP_FIXED", info => new LoseEpFixedAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_11
        dic.set("LOSE_EP_RATIO", info => new LoseEpRatioAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_12
        dic.set("GAIN_SP_FIXED", info => new GainSpFixedAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_13
        dic.set("GAIN_BP_FIXED", info => new GainBpFixedAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_14
        dic.set("LOSE_BP_FIXED", info => new LoseBpFixedAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_15
        dic.set("REMOVE_ALL_BUFF", info => new RemoveAllBuffAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_16
        dic.set("REMOVE_ALL_DEBUFF", info => new RemoveAllDebuffAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_17
        dic.set("REMOVE_ALL_ABNORMAL", info => new RemoveAllAbnormalAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_18
        dic.set("REMOVE_ALL_UNABLE_ACTION", info => new RemoveAllUnableActionAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_19
        dic.set("RESET_UNIQUE_BUFF", info => new ResetUniqueBuffAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_20
        dic.set("RESET_UNIQUE_DEBUFF", info => new ResetUniqueDebuffAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_21
        dic.set("HASTE", info => new HasteAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_22
        dic.set("SLOW", info => new SlowAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_23
        dic.set("SUMMON", info => new SummonAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_24
        dic.set("ADDITIONAL_SKILL_ACT", info => new AdditionalSkillActAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_25
        dic.set("ADDITIONAL_TURN_UNIT_ACT", info => new AdditionalTurnUnitActAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_26
        dic.set("RE_ACTION_TURN_UNIT_ACT", info => new ReActionTurnUnitActAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_27
        dic.set("CHARGE", info => new ChargeAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_28
        dic.set("GAIN_CHARGE_POINT", info => new GainChargePointAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_29
        dic.set("CONSUME_CHARGE_POINT", info => new ConsumeChargePointAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_30
        dic.set("GAIN_COUNT_POINT", info => new GainCountPointAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_31
        dic.set("CONSUME_COUNT_POINT", info => new ConsumeCountPointAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_32
        dic.set("COUNTDOWN_DECREASE", info => new CountdownDecreaseAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_33
        dic.set("COUNTDOWN_CANCEL", info => new CountdownCancelAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_34
        dic.set("ADDITIONAL_COUNTDOWN_CANCEL_SKILL_ACT", info => new AdditionalCountdownCancelSkillActAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_35
        dic.set("ADDITIONAL_COUNTDOWN_ZERO_SKILL_ACT", info => new AdditionalCountdownZeroSkillActAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_36
        dic.set("ADD_BUFF_TURN_IMM", info => new AddBuffTurnImmAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_37
        dic.set("DEC_BUFF_TURN_IMM", info => new DecBuffTurnImmAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_38
        dic.set("ADD_DEBUFF_TURN_IMM", info => new AddDebuffTurnImmAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_39
        dic.set("DEC_DEBUFF_TURN_IMM", info => new DecDebuffTurnImmAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_40
        dic.set("ZONE_EXPAND", info => new ZoneExpandAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_41
        dic.set("ZONE_RELEASE", info => new ZoneReleaseAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_42
        dic.set("ZONE_STACK", info => new ZoneStackAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_43
        dic.set("GAIN_ZONE_STACK", info => new GainZoneStackAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_44
        dic.set("CONSUME_ZONE_STACK", info => new ConsumeZoneStackAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_45
        dic.set("GAIN_SOLO_RAID_BUFF_POINT", info => new GainSoloRaidBuffPointAbilityEffect().ctor$AbilityEffectInfo(info)); // b__3_46
        AbilityEffectFactory.createDic = dic;
    }
}
