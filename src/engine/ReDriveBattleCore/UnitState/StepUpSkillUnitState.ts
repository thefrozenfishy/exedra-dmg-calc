// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { SkillMstRecord } from "../../Network/Definition/Skill/SkillMstRecord";
import { SkillMstModel } from "../Model/SkillMstModel";
import { BattleMstReaderBase } from "../Reader/BattleMstReaderBase";
import { notPorted } from "../../runtime";
import type { IEnumerable, List, int } from "../../runtime";

import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.StepUpSkillUnitState  (TypeDefIndex 669, public class) ----
export class StepUpSkillUnitState extends UnitStateBase {
    /** 0x88 private readonly int stepLevel */
    stepLevel: int = 0;
    /** 0x8C private readonly int skillUniqueId */
    skillUniqueId: int = 0;
    get StepLevel(): int { return this.get_StepLevel(); }
    get StepUpSkillUniqueId(): int { return this.get_StepUpSkillUniqueId(); }
    /** @rva 0x7421D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x9009C0  public int get_StepLevel() { } */
    get_StepLevel(): int { return this.stepLevel; /* asm: mov eax, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0xA06F50  public int get_StepUpSkillUniqueId() { } */
    get_StepUpSkillUniqueId(): int { return this.skillUniqueId; /* asm: mov eax, dword ptr [rcx + 0x8c]; ret */ }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15DE2E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.stepLevel = info._EffectValue1;
        this.skillUniqueId = info._EffectValue2;
        return this;
    }
    /** @rva 0x1702580  public int GetSkillMstId(BattleUnit battleUnit) { } */
    GetSkillMstId$BattleUnit(battleUnit: BattleUnit): int {
        if (battleUnit == null) return 0;
        // the unit's first Battle Skill gives the level (Nullable<int>, 0 without one)
        const first = battleUnit._SkillSet == null || battleUnit._SkillSet._ActiveSkills == null ? null : (battleUnit._SkillSet._ActiveSkills[0] ?? null);
        const activeSkillLevel = first == null ? 0 : first._Level;
        if (!(0 < this.skillUniqueId && 0 < activeSkillLevel)) return 0;
        const mst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel)
            .GetModel(m => m.skillUniqueId === this.skillUniqueId && m.level === activeSkillLevel); // <>c__DisplayClass11_0.<GetSkillMstId>b__0
        return mst == null ? 0 : mst.SkillMstId;
    }
    /** @rva 0x17023E0  public int GetSkillMstId(int activeSkillLevel) { } */
    GetSkillMstId$int(activeSkillLevel: int): int {
        if (this.skillUniqueId < 1 || activeSkillLevel < 1) return 0;
        const mst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel)
            .GetModel(m => m.skillUniqueId === this.skillUniqueId && m.level === activeSkillLevel); // <>c__DisplayClass11_0.<GetSkillMstId>b__0
        return mst == null ? 0 : mst.SkillMstId;
    }
    /** @rva 0x17027B0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
