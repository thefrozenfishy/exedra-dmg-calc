// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IBattleStartTriggerPriority } from "../IBattleStartTriggerPriority";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.StateAbilityEffect  (TypeDefIndex 1217, public class) ----
export class StateAbilityEffect extends AbilityEffectBase {  // implements IBattleStartTriggerPriority
    static readonly __interfaces: readonly string[] = ['IBattleStartTriggerPriority'];
    /** 0x60 private UnitStateBase <GiveUnitState>k__BackingField */
    _GiveUnitState: UnitStateBase = null!;
    get GiveUnitState(): UnitStateBase { return this.get_GiveUnitState(); }
    set GiveUnitState(v: UnitStateBase) { this.set_GiveUnitState(v); }
    get IBattleStartTriggerPriority$Priority(): int { return this.get_IBattleStartTriggerPriority$Priority(); }
    /** @rva 0x737A10  public UnitStateBase get_GiveUnitState() { } */
    get_GiveUnitState(): UnitStateBase { return this._GiveUnitState; /* auto-property */ }
    /** @rva 0x737A50  public void set_GiveUnitState(UnitStateBase value) { } */
    set_GiveUnitState(value: UnitStateBase): void { this._GiveUnitState = value; /* auto-property */ }
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x19023D0  public void .ctor(AbilityEffectInfo info, UnitStateBase giveUnitState, bool isIncludeDeadUnitInTarget) { } */
    ctor$AbilityEffectInfo_UnitStateBase_bool(info: AbilityEffectInfo, giveUnitState: UnitStateBase, isIncludeDeadUnitInTarget: boolean): this { return notPorted("StateAbilityEffect..ctor", 0x19023D0); }
    /** @rva 0x1901CB0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("StateAbilityEffect.Triggering", 0x1901CB0); }
    /** @rva 0x19013A0  private UnitStateBase ChangeGiveUnitState(BattleUnit userUnit, UnitStateBase giveUnitState) { } */
    ChangeGiveUnitState(userUnit: BattleUnit, giveUnitState: UnitStateBase): UnitStateBase { return notPorted("StateAbilityEffect.ChangeGiveUnitState", 0x19013A0); }
    /** @rva 0x1901990 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("StateAbilityEffect.GetAIFilteredTargets", 0x1901990); }
    /** @rva 0x1901A70 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("StateAbilityEffect.SelectTargetInAIAction", 0x1901A70); }
    /** @rva 0x19019E0 slot 8  private int ReDriveBattleCore.IBattleStartTriggerPriority.get_Priority() { } */
    get_IBattleStartTriggerPriority$Priority(): int { return notPorted("StateAbilityEffect.ReDriveBattleCore.IBattleStartTriggerPriority.get_Priority", 0x19019E0); }
}
