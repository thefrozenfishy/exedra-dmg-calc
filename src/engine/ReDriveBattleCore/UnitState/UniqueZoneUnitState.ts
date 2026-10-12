// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List, int } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectBase_TargetSideType } from "../AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { INeutralState } from "./INeutralState";
import type { ITargetTeam, ITargetTeam_TeamTargetType } from "./ITargetTeam";
import { UniqueUnitStateBase } from "./UniqueUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueZoneUnitState  (TypeDefIndex 679, public class) ----
export class UniqueZoneUnitState extends UniqueUnitStateBase {  // implements INeutralState, ITargetTeam
    static readonly __interfaces: readonly string[] = ['INeutralState', 'ITargetTeam'];
    /** 0x98 protected int targetTypeNum */
    targetTypeNum: int = 0;
    get TargetTeam(): ITargetTeam_TeamTargetType { return this.get_TargetTeam(); }
    get INeutralState$TargetSide(): AbilityEffectBase_TargetSideType { return this.get_INeutralState$TargetSide(); }
    /** @rva 0x820790 slot 27  public ITargetTeam.TeamTargetType get_TargetTeam() { } */
    get_TargetTeam(): ITargetTeam_TeamTargetType { return this.targetTypeNum as ITargetTeam_TeamTargetType; /* asm: mov eax, dword ptr [rcx + 0x98]; ret */ }
    /** @rva 0x759B30 slot 25  private AbilityEffectBase.TargetSideType ReDriveBattleCore.UnitState.INeutralState.get_TargetSide() { } */
    get_INeutralState$TargetSide(): AbilityEffectBase_TargetSideType { return 1 as AbilityEffectBase_TargetSideType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x7E1AD0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 2 as UnitStateBase_DirectionType; /* asm: mov eax, 2; ret */ }
    /** @rva 0x76F830 slot 12  public override bool get_IsDontShowAddStateFlip() { } */
    get_IsDontShowAddStateFlip(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x16DE0F0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x16DF6B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this.iconName = "";
        super.ctor$AbilityEffectInfo(info);
        this._UniqueStatePatternMstId = info._EffectValue1;
        this.targetTypeNum = info._EffectValue2;
        return this;
    }
    /** @rva 0x16DF4F0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        return targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__11_0
    }
    /** @rva 0x16DF620 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
