// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import type { List } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.SwitchSkillUnitState  (TypeDefIndex 656, public class) ----
export class SwitchSkillUnitState extends UnitStateBase {
    /** 0x88 private readonly int switchSkillUniqueId */
    switchSkillUniqueId: int = 0;
    /** 0x8C private readonly int visualEffectNo */
    visualEffectNo: int = 0;
    /** 0x90 private readonly SkillType skillType */
    skillType: SkillType = 0 as SkillType;
    get SwitchSkillUniqueId(): int { return this.get_SwitchSkillUniqueId(); }
    get VisualEffectNo(): int { return this.get_VisualEffectNo(); }
    get SkillType(): SkillType { return this.get_SkillType(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16D8E00 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_switch_skill";
    }
    /** @rva 0xC2A210 slot 8  public override int get_IconPriority() { } */
    get_IconPriority(): int { return 100; /* asm: mov eax, 0x64; ret */ }
    /** @rva 0x76F830 slot 9  public override bool get_ShowStateIconAttachedByPassiveSkill() { } */
    get_ShowStateIconAttachedByPassiveSkill(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x902530  public int get_SwitchSkillUniqueId() { } */
    get_SwitchSkillUniqueId(): int { return this.switchSkillUniqueId; /* asm: mov eax, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x9FD270  public int get_VisualEffectNo() { } */
    get_VisualEffectNo(): int { return this.visualEffectNo; /* asm: mov eax, dword ptr [rcx + 0x8c]; ret */ }
    /** @rva 0x16D8E30  public SkillType get_SkillType() { } */
    get_SkillType(): SkillType { return notPorted("SwitchSkillUnitState.get_SkillType", 0x16D8E30); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x16D8CC0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("SwitchSkillUnitState..ctor", 0x16D8CC0); }
    /** @rva 0x16D8C30 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
