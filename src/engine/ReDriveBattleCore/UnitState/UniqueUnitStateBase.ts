// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { UniqueStatePatternMstRecord } from "../../Network/Definition/Skill/UniqueStatePatternMstRecord";
import { UniqueStatePatternMstModel } from "../Model/UniqueStatePatternMstModel";
import { BattleMstReaderBase } from "../Reader/BattleMstReaderBase";
import { notPorted } from "../../runtime";
import type { IEnumerable, List, int } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IRemoveByUserUnitDeath } from "./IRemoveByUserUnitDeath";
import { UnitStateBase } from "./UnitStateBase";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.UniqueUnitStateBase  (TypeDefIndex 665, public abstract class) ----
export abstract class UniqueUnitStateBase extends UnitStateBase {  // implements IRemoveByUserUnitDeath
    static readonly __interfaces: readonly string[] = ['IRemoveByUserUnitDeath'];
    /** 0x88 private string iconName */
    iconName: string = null!;
    /** 0x90 private int <UniqueStatePatternMstId>k__BackingField */
    _UniqueStatePatternMstId: int = 0;
    get UniqueStatePatternMstId(): int { return this.get_UniqueStatePatternMstId(); }
    set UniqueStatePatternMstId(v: int) { this.set_UniqueStatePatternMstId(v); }
    /** @rva 0x76F830 slot 9  public override bool get_ShowStateIconAttachedByPassiveSkill() { } */
    get_ShowStateIconAttachedByPassiveSkill(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x16DF3A0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        if (this.iconName !== "") return this.iconName;
        const model = BattleMstReaderBase.get_Instance<UniqueStatePatternMstModel, UniqueStatePatternMstRecord, int>(UniqueStatePatternMstModel).GetModelByKey(this._UniqueStatePatternMstId);
        if (model == null) return "";
        this.iconName = model.record.iconName; // IconName getter inlined in the game
        return this.iconName;
    }
    /** @rva 0x16DEE90  private string GetIconName() { } */
    GetIconName(): string {
        if (this.iconName !== "") return this.iconName;
        const model = BattleMstReaderBase.get_Instance<UniqueStatePatternMstModel, UniqueStatePatternMstRecord, int>(UniqueStatePatternMstModel).GetModelByKey(this._UniqueStatePatternMstId);
        if (model == null) return "";
        this.iconName = model.record.iconName; // IconName getter inlined in the game
        return this.iconName;
    }
    /** @rva 0x902980  public int get_UniqueStatePatternMstId() { } */
    get_UniqueStatePatternMstId(): int { return this._UniqueStatePatternMstId; /* auto-property */ }
    /** @rva 0x9029B0  public void set_UniqueStatePatternMstId(int value) { } */
    set_UniqueStatePatternMstId(value: int): void { this._UniqueStatePatternMstId = value; /* auto-property */ }
    /** @rva 0x16DF310  protected void .ctor() { } */
    ctor(): this {
        this.iconName = "";
        this._IconName = "";
        return this;
    }
    /** @rva 0x16DE100  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this.iconName = "";
        super.ctor$AbilityEffectInfo(info);
        this._UniqueStatePatternMstId = info._EffectValue1;
        return this;
    }
    /** @rva 0x16DECD0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__12_0
        if (list.length > 0) list = list.filter(unit => this.$GetAIFilteredTargets$b__12_1(unit));
        return list;
    }
    /** @rva 0x16DEFF0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x16DF1C0  private bool <GetAIFilteredTargets>b__12_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__12_1(unit: BattleUnit): boolean {
        return !unit._Condition.GetSameStateList(this, false).some(state => state._EffectTurn === UnitStateBase.EffectTurnOfPermanent || state._RemainingTurn > 1); // <>c.b__12_2
    }
}
