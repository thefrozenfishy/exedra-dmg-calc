// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { VortexUnitStateBase } from "./VortexUnitStateBase";
import { BleedUnitStateBase } from "./BleedUnitStateBase";
import { CurseUnitStateBase } from "./CurseUnitStateBase";
import { StunUnitState } from "./StunUnitState";
import { PoisonUnitStateBase } from "./PoisonUnitStateBase";
import { WeaknessUnitState } from "./WeaknessUnitState";
import { BurnUnitStateBase } from "./BurnUnitStateBase";
import { AbnormalType } from "./AbnormalType";
import { isAssignableFrom, notPorted, runCctor } from "../../runtime";
import type { Dictionary, IEnumerable, Ref, Type } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";

import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.AbnormalUnitStateBase  (TypeDefIndex 493, public abstract class) ----
export abstract class AbnormalUnitStateBase extends UnitStateBase {
    /** 0x0 public static readonly Dictionary<AbnormalType, Type> AbnormalUnitStateBaseTypeDic */
    static AbnormalUnitStateBaseTypeDic: Dictionary<AbnormalType, Type> = null!;
    /** @rva 0x15B36A0  public static bool TryGetAbnormalTypeOfState(Type stateType, out AbnormalType abnormalType) { } */
    static TryGetAbnormalTypeOfState(stateType: Type, abnormalType: Ref<AbnormalType>): boolean {
        runCctor(AbnormalUnitStateBase);
        abnormalType.v = 0 as AbnormalType;
        for (const [key, value] of AbnormalUnitStateBase.AbnormalUnitStateBaseTypeDic) {
            if (isAssignableFrom(value, stateType)) { // value.IsAssignableFrom(stateType)
                abnormalType.v = key;
                return true;
            }
        }
        return false;
    }
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("AbnormalUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B3AA0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("AbnormalUnitStateBase..ctor", 0x15B3AA0); }
    /** @rva 0x15B3440 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("AbnormalUnitStateBase.GetUnitFilterFuncOrder", 0x15B3440); }
    /** @rva 0x15B3860  private static void .cctor() { } */
    static cctor(): void {
        // lazy (runCctor): the types below extend this class
        const dic = new Map<AbnormalType, Type>();
        dic.set(AbnormalType.Burn, BurnUnitStateBase);
        dic.set(AbnormalType.Weakness, WeaknessUnitState);
        dic.set(AbnormalType.Poison, PoisonUnitStateBase);
        dic.set(AbnormalType.Stun, StunUnitState);
        dic.set(AbnormalType.Curse, CurseUnitStateBase);
        dic.set(AbnormalType.Bleed, BleedUnitStateBase);
        dic.set(AbnormalType.Vortex, VortexUnitStateBase);
        AbnormalUnitStateBase.AbnormalUnitStateBaseTypeDic = dic;
    }
}
