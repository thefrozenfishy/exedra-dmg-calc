// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";

// ---- ReDriveBattleCore.Command.SwitchedActiveSkillInfo  (TypeDefIndex 1030, public class) ----
export class SwitchedActiveSkillInfo {
    /** 0x10 private SkillType <SkillType>k__BackingField */
    _SkillType: SkillType = 0 as SkillType;
    /** 0x14 private int <ActiveSkillMstId>k__BackingField */
    _ActiveSkillMstId: int = 0;
    /** 0x18 private int <VisualEffectNo>k__BackingField */
    _VisualEffectNo: int = 0;
    /** 0x1C private TargetElementType <VisualEffectElement>k__BackingField */
    _VisualEffectElement: TargetElementType = 0 as TargetElementType;
    get SkillType(): SkillType { return this.get_SkillType(); }
    set SkillType(v: SkillType) { this.set_SkillType(v); }
    get ActiveSkillMstId(): int { return this.get_ActiveSkillMstId(); }
    set ActiveSkillMstId(v: int) { this.set_ActiveSkillMstId(v); }
    get VisualEffectNo(): int { return this.get_VisualEffectNo(); }
    set VisualEffectNo(v: int) { this.set_VisualEffectNo(v); }
    get VisualEffectElement(): TargetElementType { return this.get_VisualEffectElement(); }
    set VisualEffectElement(v: TargetElementType) { this.set_VisualEffectElement(v); }
    /** @rva 0x7364F0  public SkillType get_SkillType() { } */
    get_SkillType(): SkillType { return this._SkillType; /* auto-property */ }
    /** @rva 0x739D00  public void set_SkillType(SkillType value) { } */
    set_SkillType(value: SkillType): void { this._SkillType = value; /* auto-property */ }
    /** @rva 0x803350  public int get_ActiveSkillMstId() { } */
    get_ActiveSkillMstId(): int { return this._ActiveSkillMstId; /* auto-property */ }
    /** @rva 0x803540  public void set_ActiveSkillMstId(int value) { } */
    set_ActiveSkillMstId(value: int): void { this._ActiveSkillMstId = value; /* auto-property */ }
    /** @rva 0x763820  public int get_VisualEffectNo() { } */
    get_VisualEffectNo(): int { return this._VisualEffectNo; /* auto-property */ }
    /** @rva 0x8A2240  public void set_VisualEffectNo(int value) { } */
    set_VisualEffectNo(value: int): void { this._VisualEffectNo = value; /* auto-property */ }
    /** @rva 0x7F9800  public TargetElementType get_VisualEffectElement() { } */
    get_VisualEffectElement(): TargetElementType { return this._VisualEffectElement; /* auto-property */ }
    /** @rva 0x7F9820  public void set_VisualEffectElement(TargetElementType value) { } */
    set_VisualEffectElement(value: TargetElementType): void { this._VisualEffectElement = value; /* auto-property */ }
    /** @rva 0xBE7F70  public void .ctor(SkillType skillType, int activeSkillMstId, int visualEffectNo, TargetElementType visualEffectElement) { } */
    ctor$SkillType_int_int_TargetElementType(skillType: SkillType, activeSkillMstId: int, visualEffectNo: int, visualEffectElement: TargetElementType): this {
        this._SkillType = skillType;
        this._VisualEffectNo = visualEffectNo;
        this._VisualEffectElement = visualEffectElement;
        this._ActiveSkillMstId = activeSkillMstId;
        return this;
    }
}
