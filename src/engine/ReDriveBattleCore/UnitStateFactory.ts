// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { UpWeakElementDmgRatioUnitState } from "./UnitState/UpWeakElementDmgRatioUnitState";
import { UpWeakElementDmgConsumeRatioUnitState } from "./UnitState/UpWeakElementDmgConsumeRatioUnitState";
import { UpWeakElementDmgAccumRatioUnitState } from "./UnitState/UpWeakElementDmgAccumRatioUnitState";
import { UpSpdRatioUnitState } from "./UnitState/UpSpdRatioUnitState";
import { UpSpdFixedUnitState } from "./UnitState/UpSpdFixedUnitState";
import { UpSpdAccumRatioUnitState } from "./UnitState/UpSpdAccumRatioUnitState";
import { UpRecoveryEpRateRatioRatioUnitState } from "./UnitState/UpRecoveryEpRateRatioRatioUnitState";
import { UpRcvDmgRatioUnitState } from "./UnitState/UpRcvDmgRatioUnitState";
import { UpRcvCtrRatioUnitState } from "./UnitState/UpRcvCtrRatioUnitState";
import { UpRcvCtdRatioUnitState } from "./UnitState/UpRcvCtdRatioUnitState";
import { UpRcvBreakPointDmgRatioUnitState } from "./UnitState/UpRcvBreakPointDmgRatioUnitState";
import { UpHpRatioUnitState } from "./UnitState/UpHpRatioUnitState";
import { UpHpFixedUnitState } from "./UnitState/UpHpFixedUnitState";
import { UpHealRateRatioUnitState } from "./UnitState/UpHealRateRatioUnitState";
import { UpHateUnitState } from "./UnitState/UpHateUnitState";
import { UpGivVortexDmgRatioUnitState } from "./UnitState/UpGivVortexDmgRatioUnitState";
import { UpGivSlipDmgRatioUnitState } from "./UnitState/UpGivSlipDmgRatioUnitState";
import { UpGivPoisonDmgRatioUnitState } from "./UnitState/UpGivPoisonDmgRatioUnitState";
import { UpGivDmgRatioUnitState } from "./UnitState/UpGivDmgRatioUnitState";
import { UpGivDmgConsumeRatioUnitState } from "./UnitState/UpGivDmgConsumeRatioUnitState";
import { UpGivDmgAccumRatioUnitState } from "./UnitState/UpGivDmgAccumRatioUnitState";
import { UpGivCurseDmgRatioUnitState } from "./UnitState/UpGivCurseDmgRatioUnitState";
import { UpGivBurnDmgRatioUnitState } from "./UnitState/UpGivBurnDmgRatioUnitState";
import { UpGivBreakPointDmgRatioUnitState } from "./UnitState/UpGivBreakPointDmgRatioUnitState";
import { UpGivBreakPointDmgFixedUnitState } from "./UnitState/UpGivBreakPointDmgFixedUnitState";
import { UpGivBleedDmgRatioUnitState } from "./UnitState/UpGivBleedDmgRatioUnitState";
import { UpElementResistRatioUnitState } from "./UnitState/UpElementResistRatioUnitState";
import { UpElementResistRatioAccumUnitState } from "./UnitState/UpElementResistRatioAccumUnitState";
import { UpElementDmgRateRatioUnitState } from "./UnitState/UpElementDmgRateRatioUnitState";
import { UpEffectParryRateRatioUnitState } from "./UnitState/UpEffectParryRateRatioUnitState";
import { UpEffectHitRateRatioUnitState } from "./UnitState/UpEffectHitRateRatioUnitState";
import { UpDefRatioUnitState } from "./UnitState/UpDefRatioUnitState";
import { UpDefFixedUnitState } from "./UnitState/UpDefFixedUnitState";
import { UpDefAccumRatioUnitState } from "./UnitState/UpDefAccumRatioUnitState";
import { UpDebuffEffectValueUnitState } from "./UnitState/UpDebuffEffectValueUnitState";
import { UpCtrFixedUnitState } from "./UnitState/UpCtrFixedUnitState";
import { UpCtrConsumeFixedUnitState } from "./UnitState/UpCtrConsumeFixedUnitState";
import { UpCtrAccumRatioUnitState } from "./UnitState/UpCtrAccumRatioUnitState";
import { UpCtdFixedUnitState } from "./UnitState/UpCtdFixedUnitState";
import { UpCtdConsumeFixedUnitState } from "./UnitState/UpCtdConsumeFixedUnitState";
import { UpCtdAccumRatioUnitState } from "./UnitState/UpCtdAccumRatioUnitState";
import { UpBuffEffectValueUnitState } from "./UnitState/UpBuffEffectValueUnitState";
import { UpBreakedDamageReceiveRatioUnitState } from "./UnitState/UpBreakedDamageReceiveRatioUnitState";
import { UpBreakEffectRatioUnitState } from "./UnitState/UpBreakEffectRatioUnitState";
import { UpAtkRatioUnitState } from "./UnitState/UpAtkRatioUnitState";
import { UpAtkFixedUnitState } from "./UnitState/UpAtkFixedUnitState";
import { UpAtkConsumeRatioUnitState } from "./UnitState/UpAtkConsumeRatioUnitState";
import { UpAtkConsumeFixedUnitState } from "./UnitState/UpAtkConsumeFixedUnitState";
import { UpAtkAccumRatioUnitState } from "./UnitState/UpAtkAccumRatioUnitState";
import { UpAimRcvDmgRatioUnitState } from "./UnitState/UpAimRcvDmgRatioUnitState";
import { UpAimGivDmgRatioUnitState } from "./UnitState/UpAimGivDmgRatioUnitState";
import { UpAbnormalParryRateRatioUnitState } from "./UnitState/UpAbnormalParryRateRatioUnitState";
import { UpAbnormalHitRateRatioUnitState } from "./UnitState/UpAbnormalHitRateRatioUnitState";
import { UniqueZoneUnitState } from "./UnitState/UniqueZoneUnitState";
import { UniqueEnemy639002UnitState } from "./UnitState/UniqueEnemy639002UnitState";
import { UniqueElementStackUnitState } from "./UnitState/UniqueElementStackUnitState";
import { UniqueElementBreakUnitState } from "./UnitState/UniqueElementBreakUnitState";
import { UniqueDebuffUnitState } from "./UnitState/UniqueDebuffUnitState";
import { UniqueDebuffAccumUnitState } from "./UnitState/UniqueDebuffAccumUnitState";
import { UniqueBuffUnitState } from "./UnitState/UniqueBuffUnitState";
import { UniqueBuffAccumUnitState } from "./UnitState/UniqueBuffAccumUnitState";
import { Unique10070201UnitState } from "./UnitState/Unique10070201UnitState";
import { Unique10030301UnitState } from "./UnitState/Unique10030301UnitState";
import { TsubameLinkUnitState } from "./UnitState/TsubameLinkUnitState";
import { TsubameCoreUnitState } from "./UnitState/TsubameCoreUnitState";
import { SwitchSkillUnitState } from "./UnitState/SwitchSkillUnitState";
import { ShieldUnitState } from "./UnitState/ShieldUnitState";
import { RegainHpUnitState } from "./UnitState/RegainHpUnitState";
import { RegainDefUnitState } from "./UnitState/RegainDefUnitState";
import { RegainAtkUnitState } from "./UnitState/RegainAtkUnitState";
import { ReflectionRatioUnitState } from "./UnitState/ReflectionRatioUnitState";
import { RcvFinalDamageUnitState } from "./UnitState/RcvFinalDamageUnitState";
import { PreventAbnormalUnitState } from "./UnitState/PreventAbnormalUnitState";
import { LockTurnOrderUnitState } from "./UnitState/LockTurnOrderUnitState";
import { LockSpecialAttackUnitState } from "./UnitState/LockSpecialAttackUnitState";
import { GveUpSpecialAttackFinalGiveDamageRatioUnitState } from "./UnitState/GveUpSpecialAttackFinalGiveDamageRatioUnitState";
import { GveUpFinalGainEpRatioUnitState } from "./UnitState/GveUpFinalGainEpRatioUnitState";
import { DwnSpdRatioUnitState } from "./UnitState/DwnSpdRatioUnitState";
import { DwnSpdFixedUnitState } from "./UnitState/DwnSpdFixedUnitState";
import { DwnSpdAccumRatioUnitState } from "./UnitState/DwnSpdAccumRatioUnitState";
import { DwnRecoveryEpRateRatioRatioUnitState } from "./UnitState/DwnRecoveryEpRateRatioRatioUnitState";
import { DwnRcvRecoveryRatioUnitState } from "./UnitState/DwnRcvRecoveryRatioUnitState";
import { DwnRcvDmgRatioUnitState } from "./UnitState/DwnRcvDmgRatioUnitState";
import { DwnRcvBreakPointDmgRatioUnitState } from "./UnitState/DwnRcvBreakPointDmgRatioUnitState";
import { DwnHealRateRatioUnitState } from "./UnitState/DwnHealRateRatioUnitState";
import { DwnHateUnitState } from "./UnitState/DwnHateUnitState";
import { DwnGivVortexDmgRatioUnitState } from "./UnitState/DwnGivVortexDmgRatioUnitState";
import { DwnGivSlipDmgRatioUnitState } from "./UnitState/DwnGivSlipDmgRatioUnitState";
import { DwnGivPoisonDmgRatioUnitState } from "./UnitState/DwnGivPoisonDmgRatioUnitState";
import { DwnGivDmgRatioUnitState } from "./UnitState/DwnGivDmgRatioUnitState";
import { DwnGivDmgConsumeRatioUnitState } from "./UnitState/DwnGivDmgConsumeRatioUnitState";
import { DwnGivDmgAccumRatioUnitState } from "./UnitState/DwnGivDmgAccumRatioUnitState";
import { DwnGivCurseDmgRatioUnitState } from "./UnitState/DwnGivCurseDmgRatioUnitState";
import { DwnGivBurnDmgRatioUnitState } from "./UnitState/DwnGivBurnDmgRatioUnitState";
import { DwnGivBreakPointDmgFixedUnitState } from "./UnitState/DwnGivBreakPointDmgFixedUnitState";
import { DwnGivBleedDmgRatioUnitState } from "./UnitState/DwnGivBleedDmgRatioUnitState";
import { DwnElementResistRatioAccumUnitState } from "./UnitState/DwnElementResistRatioAccumUnitState";
import { DwnElementDmgRateRatioUnitState } from "./UnitState/DwnElementDmgRateRatioUnitState";
import { DwnDefRatioUnitState } from "./UnitState/DwnDefRatioUnitState";
import { DwnDefAccumRatioUnitState } from "./UnitState/DwnDefAccumRatioUnitState";
import { DwnDebuffEffectValueUnitState } from "./UnitState/DwnDebuffEffectValueUnitState";
import { DwnCtrFixedUnitState } from "./UnitState/DwnCtrFixedUnitState";
import { DwnCtrConsumeFixedUnitState } from "./UnitState/DwnCtrConsumeFixedUnitState";
import { DwnCtrAccumRatioUnitState } from "./UnitState/DwnCtrAccumRatioUnitState";
import { DwnCtdFixedUnitState } from "./UnitState/DwnCtdFixedUnitState";
import { DwnCtdConsumeFixedUnitState } from "./UnitState/DwnCtdConsumeFixedUnitState";
import { DwnCtdAccumRatioUnitState } from "./UnitState/DwnCtdAccumRatioUnitState";
import { DwnBuffEffectValueUnitState } from "./UnitState/DwnBuffEffectValueUnitState";
import { DwnBreakedDamageReceiveRatioUnitState } from "./UnitState/DwnBreakedDamageReceiveRatioUnitState";
import { DwnBarrierValueUnitState } from "./UnitState/DwnBarrierValueUnitState";
import { DwnAtkRatioUnitState } from "./UnitState/DwnAtkRatioUnitState";
import { DwnAtkConsumeRatioUnitState } from "./UnitState/DwnAtkConsumeRatioUnitState";
import { DwnAtkAccumRatioUnitState } from "./UnitState/DwnAtkAccumRatioUnitState";
import { DwnAimRcvDmgRatioUnitState } from "./UnitState/DwnAimRcvDmgRatioUnitState";
import { DwnAimGivDmgRatioUnitState } from "./UnitState/DwnAimGivDmgRatioUnitState";
import { CutoutUnitState } from "./UnitState/CutoutUnitState";
import { CpnUpGivDmgRatioUnitState } from "./UnitState/CpnUpGivDmgRatioUnitState";
import { CpnUpGivBreakPointDmgRatioUnitState } from "./UnitState/CpnUpGivBreakPointDmgRatioUnitState";
import { CountdownStartUnitState } from "./UnitState/CountdownStartUnitState";
import { CountUnitState } from "./UnitState/CountUnitState";
import { ContinuousRecoveryUnitState } from "./UnitState/ContinuousRecoveryUnitState";
import { ComboUnitState } from "./UnitState/ComboUnitState";
import { BarrierUnitState } from "./UnitState/BarrierUnitState";
import { AdditionalDamageUnitState } from "./UnitState/AdditionalDamageUnitState";
import { AddDebuffTurnUnitState } from "./UnitState/AddDebuffTurnUnitState";
import { AddBuffTurnUnitState } from "./UnitState/AddBuffTurnUnitState";
import { notPorted, runCctor } from "../runtime";
import type { Dictionary, List } from "../runtime";
import type { AbilityEffectInfo } from "./AbilityEffectInfo";
import type { UnitStateBase } from "./UnitState/UnitStateBase";
import { BleedAtkUnitState } from "./UnitState/BleedAtkUnitState";
import { BleedDefUnitState } from "./UnitState/BleedDefUnitState";
import { BleedHpUnitState } from "./UnitState/BleedHpUnitState";
import { BurnAtkUnitState } from "./UnitState/BurnAtkUnitState";
import { BurnDefUnitState } from "./UnitState/BurnDefUnitState";
import { BurnHpUnitState } from "./UnitState/BurnHpUnitState";
import { CurseAtkUnitState } from "./UnitState/CurseAtkUnitState";
import { CurseDefUnitState } from "./UnitState/CurseDefUnitState";
import { CurseHpUnitState } from "./UnitState/CurseHpUnitState";
import { PoisonAtkUnitState } from "./UnitState/PoisonAtkUnitState";
import { PoisonDefUnitState } from "./UnitState/PoisonDefUnitState";
import { PoisonHpUnitState } from "./UnitState/PoisonHpUnitState";
import { StunUnitState } from "./UnitState/StunUnitState";
import { VortexAtkUnitState } from "./UnitState/VortexAtkUnitState";
import { WeaknessUnitState } from "./UnitState/WeaknessUnitState";

// ---- ReDriveBattleCore.UnitStateFactory  (TypeDefIndex 482, public static class) ----
export class UnitStateFactory {
    /** 0x0 private static readonly Dictionary<string, Func<AbilityEffectInfo, UnitStateBase>> createDic */
    static createDic: Dictionary<string, ((a0: AbilityEffectInfo) => UnitStateBase)> = null!;
    static get AbilityEffectTypeList(): List<string> { return UnitStateFactory.get_AbilityEffectTypeList(); }
    /** @rva 0x15CEDD0  public static List<string> get_AbilityEffectTypeList() { } */
    static get_AbilityEffectTypeList(): List<string> {
        runCctor(UnitStateFactory);
        return [...UnitStateFactory.createDic.keys()];
    }
    /** @rva 0x15CAFD0  public static bool CanCreate(string effectType) { } */
    static CanCreate(effectType: string): boolean {
        runCctor(UnitStateFactory);
        return UnitStateFactory.createDic.has(effectType);
    }
    /** @rva 0x15CB050  public static UnitStateBase Create(AbilityEffectInfo info) { } */
    static Create(info: AbilityEffectInfo): UnitStateBase {
        runCctor(UnitStateFactory);
        if (!UnitStateFactory.createDic.has(info.EffectType)) return null!;
        return UnitStateFactory.createDic.get(info.EffectType)!(info);
    }
    /** @rva 0x15CB180  private static void .cctor() { } */
    static cctor(): void {
        // lazy (runCctor): the lambdas construct classes that import this module
        const dic = new Map<string, (info: AbilityEffectInfo) => UnitStateBase>();
        dic.set("UP_ATK_RATIO", info => new UpAtkRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_0
        dic.set("UP_ATK_FIXED", info => new UpAtkFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_1
        dic.set("DWN_ATK_RATIO", info => new DwnAtkRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_2
        dic.set("UP_ATK_ACCUM_RATIO", info => new UpAtkAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_3
        dic.set("DWN_ATK_ACCUM_RATIO", info => new DwnAtkAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_4
        dic.set("UP_ATK_CONSUME_RATIO", info => new UpAtkConsumeRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_5
        dic.set("UP_ATK_CONSUME_FIXED", info => new UpAtkConsumeFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_6
        dic.set("DWN_ATK_CONSUME_RATIO", info => new DwnAtkConsumeRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_7
        dic.set("UP_DEF_RATIO", info => new UpDefRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_8
        dic.set("UP_DEF_FIXED", info => new UpDefFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_9
        dic.set("DWN_DEF_RATIO", info => new DwnDefRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_10
        dic.set("UP_DEF_ACCUM_RATIO", info => new UpDefAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_11
        dic.set("DWN_DEF_ACCUM_RATIO", info => new DwnDefAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_12
        dic.set("UP_HP_RATIO", info => new UpHpRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_13
        dic.set("UP_HP_FIXED", info => new UpHpFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_14
        dic.set("UP_SPD_RATIO", info => new UpSpdRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_15
        dic.set("UP_SPD_FIXED", info => new UpSpdFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_16
        dic.set("DWN_SPD_RATIO", info => new DwnSpdRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_17
        dic.set("DWN_SPD_FIXED", info => new DwnSpdFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_18
        dic.set("UP_SPD_ACCUM_RATIO", info => new UpSpdAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_19
        dic.set("DWN_SPD_ACCUM_RATIO", info => new DwnSpdAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_20
        dic.set("UP_CTR_RATIO", info => new UpCtrFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_21
        dic.set("UP_CTR_FIXED", info => new UpCtrFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_22
        dic.set("UP_CTD_RATIO", info => new UpCtdFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_23
        dic.set("UP_CTD_FIXED", info => new UpCtdFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_24
        dic.set("DWN_CTR_RATIO", info => new DwnCtrFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_25
        dic.set("DWN_CTR_FIXED", info => new DwnCtrFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_26
        dic.set("DWN_CTD_RATIO", info => new DwnCtdFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_27
        dic.set("DWN_CTD_FIXED", info => new DwnCtdFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_28
        dic.set("UP_CTR_ACCUM_RATIO", info => new UpCtrAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_29
        dic.set("DWN_CTR_ACCUM_RATIO", info => new DwnCtrAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_30
        dic.set("UP_CTD_ACCUM_RATIO", info => new UpCtdAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_31
        dic.set("DWN_CTD_ACCUM_RATIO", info => new DwnCtdAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_32
        dic.set("UP_CTR_CONSUME_FIXED", info => new UpCtrConsumeFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_33
        dic.set("DWN_CTR_CONSUME_FIXED", info => new DwnCtrConsumeFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_34
        dic.set("UP_CTD_CONSUME_FIXED", info => new UpCtdConsumeFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_35
        dic.set("DWN_CTD_CONSUME_FIXED", info => new DwnCtdConsumeFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_36
        dic.set("UP_RCV_CTR_RATIO", info => new UpRcvCtrRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_37
        dic.set("UP_RCV_CTD_RATIO", info => new UpRcvCtdRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_38
        dic.set("UP_HEAL_RATE_RATIO", info => new UpHealRateRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_39
        dic.set("DWN_HEAL_RATE_RATIO", info => new DwnHealRateRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_40
        dic.set("DWN_RCV_RECOVERY_RATIO", info => new DwnRcvRecoveryRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_41
        dic.set("UP_EFFECT_HIT_RATE_RATIO", info => new UpEffectHitRateRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_42
        dic.set("UP_EFFECT_PARRY_RATE_RATIO", info => new UpEffectParryRateRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_43
        dic.set("UP_ABNORMAL_HIT_RATE_RATIO", info => new UpAbnormalHitRateRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_44
        dic.set("UP_ABNORMAL_PARRY_RATE_RATIO", info => new UpAbnormalParryRateRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_45
        dic.set("UP_ELEMENT_DMG_RATE_RATIO", info => new UpElementDmgRateRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_46
        dic.set("DWN_ELEMENT_DMG_RATE_RATIO", info => new DwnElementDmgRateRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_47
        dic.set("UP_ELEMENT_RESIST_RATIO", info => new UpElementResistRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_48
        dic.set("UP_ELEMENT_RESIST_ACCUM_RATIO", info => new UpElementResistRatioAccumUnitState().ctor$AbilityEffectInfo(info)); // b__5_49
        dic.set("DWN_ELEMENT_RESIST_ACCUM_RATIO", info => new DwnElementResistRatioAccumUnitState().ctor$AbilityEffectInfo(info)); // b__5_50
        dic.set("UP_BREAK_EFFECT", info => new UpBreakEffectRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_51
        dic.set("UP_EP_RECOVER_RATE_RATIO", info => new UpRecoveryEpRateRatioRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_52
        dic.set("DWN_EP_RECOVER_RATE_RATIO", info => new DwnRecoveryEpRateRatioRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_53
        dic.set("UP_RECOVERY_EP_RATE_RATIO", info => new UpRecoveryEpRateRatioRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_54
        dic.set("DWN_RECOVERY_EP_RATE_RATIO", info => new DwnRecoveryEpRateRatioRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_55
        dic.set("UP_BREAK_DAMAGE_RECEIVE_RATIO", info => new UpBreakedDamageReceiveRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_56
        dic.set("DWN_BREAK_DAMAGE_RECEIVE_RATIO", info => new DwnBreakedDamageReceiveRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_57
        dic.set("UP_BREAKED_DAMAGE_RECEIVE_RATIO", info => new UpBreakedDamageReceiveRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_58
        dic.set("DWN_BREAKED_DAMAGE_RECEIVE_RATIO", info => new DwnBreakedDamageReceiveRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_59
        dic.set("DWN_RCV_DMG_RATIO", info => new DwnRcvDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_60
        dic.set("UP_GIV_DMG_RATIO", info => new UpGivDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_61
        dic.set("UP_RCV_DMG_RATIO", info => new UpRcvDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_62
        dic.set("DWN_GIV_DMG_RATIO", info => new DwnGivDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_63
        dic.set("DWN_AIM_RCV_DMG_RATIO", info => new DwnAimRcvDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_64
        dic.set("UP_AIM_GIV_DMG_RATIO", info => new UpAimGivDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_65
        dic.set("UP_GIV_DMG_ACCUM_RATIO", info => new UpGivDmgAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_66
        dic.set("DWN_GIV_DMG_ACCUM_RATIO", info => new DwnGivDmgAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_67
        dic.set("UP_AIM_RCV_DMG_RATIO", info => new UpAimRcvDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_68
        dic.set("DWN_AIM_GIV_DMG_RATIO", info => new DwnAimGivDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_69
        dic.set("UP_GIV_DMG_CONSUME_RATIO", info => new UpGivDmgConsumeRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_70
        dic.set("DWN_GIV_DMG_CONSUME_RATIO", info => new DwnGivDmgConsumeRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_71
        dic.set("UP_GIV_BREAK_POINT_DMG_FIXED", info => new UpGivBreakPointDmgFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_72
        dic.set("UP_GIV_BREAK_POINT_DMG_RATIO", info => new UpGivBreakPointDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_73
        dic.set("UP_RCV_BREAK_POINT_DMG_RATIO", info => new UpRcvBreakPointDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_74
        dic.set("DWN_GIV_BREAK_POINT_DMG_FIXED", info => new DwnGivBreakPointDmgFixedUnitState().ctor$AbilityEffectInfo(info)); // b__5_75
        dic.set("DWN_RCV_BREAK_POINT_DMG_RATIO", info => new DwnRcvBreakPointDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_76
        dic.set("UP_WEAK_ELEMENT_DMG_RATIO", info => new UpWeakElementDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_77
        dic.set("UP_WEAK_ELEMENT_DMG_ACCUM_RATIO", info => new UpWeakElementDmgAccumRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_78
        dic.set("UP_WEAK_ELEMENT_DMG_CONSUME_RATIO", info => new UpWeakElementDmgConsumeRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_79
        dic.set("BURN_ATK", info => new BurnAtkUnitState().ctor$AbilityEffectInfo(info)); // b__5_80
        dic.set("BURN_DEF", info => new BurnDefUnitState().ctor$AbilityEffectInfo(info)); // b__5_81
        dic.set("BURN_HP", info => new BurnHpUnitState().ctor$AbilityEffectInfo(info)); // b__5_82
        dic.set("WEAKNESS", info => new WeaknessUnitState().ctor$AbilityEffectInfo(info)); // b__5_83
        dic.set("POISON_ATK", info => new PoisonAtkUnitState().ctor$AbilityEffectInfo(info)); // b__5_84
        dic.set("POISON_DEF", info => new PoisonDefUnitState().ctor$AbilityEffectInfo(info)); // b__5_85
        dic.set("POISON_HP", info => new PoisonHpUnitState().ctor$AbilityEffectInfo(info)); // b__5_86
        dic.set("STUN", info => new StunUnitState().ctor$AbilityEffectInfo(info)); // b__5_87
        dic.set("CURSE_ATK", info => new CurseAtkUnitState().ctor$AbilityEffectInfo(info)); // b__5_88
        dic.set("CURSE_DEF", info => new CurseDefUnitState().ctor$AbilityEffectInfo(info)); // b__5_89
        dic.set("CURSE_HP", info => new CurseHpUnitState().ctor$AbilityEffectInfo(info)); // b__5_90
        dic.set("BLEED_ATK", info => new BleedAtkUnitState().ctor$AbilityEffectInfo(info)); // b__5_91
        dic.set("BLEED_DEF", info => new BleedDefUnitState().ctor$AbilityEffectInfo(info)); // b__5_92
        dic.set("BLEED_HP", info => new BleedHpUnitState().ctor$AbilityEffectInfo(info)); // b__5_93
        dic.set("VORTEX_ATK", info => new VortexAtkUnitState().ctor$AbilityEffectInfo(info)); // b__5_94
        dic.set("UP_GIV_SLIP_DMG_RATIO", info => new UpGivSlipDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_95
        dic.set("UP_GIV_BURN_DMG_RATIO", info => new UpGivBurnDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_96
        dic.set("UP_GIV_POISON_DMG_RATIO", info => new UpGivPoisonDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_97
        dic.set("UP_GIV_CURSE_DMG_RATIO", info => new UpGivCurseDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_98
        dic.set("UP_GIV_BLEED_DMG_RATIO", info => new UpGivBleedDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_99
        dic.set("UP_GIV_VORTEX_DMG_RATIO", info => new UpGivVortexDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_100
        dic.set("DWN_GIV_SLIP_DMG_RATIO", info => new DwnGivSlipDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_101
        dic.set("DWN_GIV_BURN_DMG_RATIO", info => new DwnGivBurnDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_102
        dic.set("DWN_GIV_POISON_DMG_RATIO", info => new DwnGivPoisonDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_103
        dic.set("DWN_GIV_CURSE_DMG_RATIO", info => new DwnGivCurseDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_104
        dic.set("DWN_GIV_BLEED_DMG_RATIO", info => new DwnGivBleedDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_105
        dic.set("DWN_GIV_VORTEX_DMG_RATIO", info => new DwnGivVortexDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_106
        dic.set("RCV_FINAL_DAMAGE", info => new RcvFinalDamageUnitState().ctor$AbilityEffectInfo(info)); // b__5_107
        dic.set("UP_HATE", info => new UpHateUnitState().ctor$AbilityEffectInfo(info)); // b__5_108
        dic.set("DWN_HATE", info => new DwnHateUnitState().ctor$AbilityEffectInfo(info)); // b__5_109
        dic.set("SWITCH_SKILL", info => new SwitchSkillUnitState().ctor$AbilityEffectInfo(info)); // b__5_110
        dic.set("REFLECTION_RATIO", info => new ReflectionRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_111
        dic.set("COMBO", info => new ComboUnitState().ctor$AbilityEffectInfo(info)); // b__5_112
        dic.set("CUTOUT", info => new CutoutUnitState().ctor$AbilityEffectInfo(info)); // b__5_113
        dic.set("TSUBAME_CORE", info => new TsubameCoreUnitState().ctor$AbilityEffectInfo(info)); // b__5_114
        dic.set("TSUBAME_LINK", info => new TsubameLinkUnitState().ctor$AbilityEffectInfo(info)); // b__5_115
        dic.set("LOCK_TURN_ORDER", info => new LockTurnOrderUnitState().ctor$AbilityEffectInfo(info)); // b__5_116
        dic.set("LOCK_SPECIAL_ATTACK", info => new LockSpecialAttackUnitState().ctor$AbilityEffectInfo(info)); // b__5_117
        dic.set("SHIELD", info => new ShieldUnitState().ctor$AbilityEffectInfo(info)); // b__5_118
        dic.set("BARRIER", info => new BarrierUnitState().ctor$AbilityEffectInfo(info)); // b__5_119
        dic.set("GVE_UP_SPECIAL_ATTACK_FINAL_GIV_DMG_RATIO", info => new GveUpSpecialAttackFinalGiveDamageRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_120
        dic.set("GVE_UP_FINAL_GAIN_EP_RATIO", info => new GveUpFinalGainEpRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_121
        dic.set("CPN_UP_GIV_DMG_RATIO", info => new CpnUpGivDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_122
        dic.set("CPN_UP_GIV_BREAK_POINT_DMG_RATIO", info => new CpnUpGivBreakPointDmgRatioUnitState().ctor$AbilityEffectInfo(info)); // b__5_123
        dic.set("PREVENT_ABNORMAL", info => new PreventAbnormalUnitState().ctor$AbilityEffectInfo(info)); // b__5_124
        dic.set("ADD_BUFF_TURN", info => new AddBuffTurnUnitState().ctor$AbilityEffectInfo(info)); // b__5_125
        dic.set("ADD_DEBUFF_TURN", info => new AddDebuffTurnUnitState().ctor$AbilityEffectInfo(info)); // b__5_126
        dic.set("UP_BUFF_EFFECT_VALUE", info => new UpBuffEffectValueUnitState().ctor$AbilityEffectInfo(info)); // b__5_127
        dic.set("UP_DEBUFF_EFFECT_VALUE", info => new UpDebuffEffectValueUnitState().ctor$AbilityEffectInfo(info)); // b__5_128
        dic.set("DWN_BUFF_EFFECT_VALUE", info => new DwnBuffEffectValueUnitState().ctor$AbilityEffectInfo(info)); // b__5_129
        dic.set("DWN_DEBUFF_EFFECT_VALUE", info => new DwnDebuffEffectValueUnitState().ctor$AbilityEffectInfo(info)); // b__5_130
        dic.set("DWN_BARRIER_VALUE", info => new DwnBarrierValueUnitState().ctor$AbilityEffectInfo(info)); // b__5_131
        dic.set("CONTINUOUS_RECOVERY", info => new ContinuousRecoveryUnitState().ctor$AbilityEffectInfo(info)); // b__5_132
        dic.set("REGAIN_HP", info => new RegainHpUnitState().ctor$AbilityEffectInfo(info)); // b__5_133
        dic.set("REGAIN_ATK", info => new RegainAtkUnitState().ctor$AbilityEffectInfo(info)); // b__5_134
        dic.set("REGAIN_DEF", info => new RegainDefUnitState().ctor$AbilityEffectInfo(info)); // b__5_135
        dic.set("COUNT", info => new CountUnitState().ctor$AbilityEffectInfo(info)); // b__5_136
        dic.set("COUNTDOWN_START", info => new CountdownStartUnitState().ctor$AbilityEffectInfo(info)); // b__5_137
        dic.set("ADDITIONAL_DAMAGE", info => new AdditionalDamageUnitState().ctor$AbilityEffectInfo(info)); // b__5_138
        dic.set("UNIQUE_10030301", info => new Unique10030301UnitState().ctor$AbilityEffectInfo(info)); // b__5_139
        dic.set("UNIQUE_10070201", info => new Unique10070201UnitState().ctor$AbilityEffectInfo(info)); // b__5_140
        dic.set("UNIQUE_BUFF", info => new UniqueBuffUnitState().ctor$AbilityEffectInfo(info)); // b__5_141
        dic.set("UNIQUE_DEBUFF", info => new UniqueDebuffUnitState().ctor$AbilityEffectInfo(info)); // b__5_142
        dic.set("UNIQUE_BUFF_ACCUM", info => new UniqueBuffAccumUnitState().ctor$AbilityEffectInfo(info)); // b__5_143
        dic.set("UNIQUE_DEBUFF_ACCUM", info => new UniqueDebuffAccumUnitState().ctor$AbilityEffectInfo(info)); // b__5_144
        dic.set("UNIQUE_ELEMENT_STACK", info => new UniqueElementStackUnitState().ctor$AbilityEffectInfo(info)); // b__5_145
        dic.set("UNIQUE_ELEMENT_BREAK", info => new UniqueElementBreakUnitState().ctor$AbilityEffectInfo(info)); // b__5_146
        dic.set("UNIQUE_ZONE", info => new UniqueZoneUnitState().ctor$AbilityEffectInfo(info)); // b__5_147
        dic.set("UNIQUE_ENEMY_639002", info => new UniqueEnemy639002UnitState().ctor$AbilityEffectInfo(info)); // b__5_148
        UnitStateFactory.createDic = dic;
    }
}
