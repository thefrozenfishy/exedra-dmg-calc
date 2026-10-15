// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { SkillDecisionActBase } from "./Act/SkillDecisionActBase";
import { ComboTurnUnitAct } from "./Act/ComboTurnUnitAct";
import { StartTimingAct } from "./Act/StartTimingAct";
import { ReActionTurnUnitAct } from "./Act/ReActionTurnUnitAct";
import { AdditionalTurnUnitAct } from "./Act/AdditionalTurnUnitAct";
import { AdditionalSkillAct } from "./Act/AdditionalSkillAct";
import { SpecialAttackAct } from "./Act/SpecialAttackAct";
import { TurnUnitAct } from "./Act/TurnUnitAct";
import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { ActBase } from "./Act/ActBase";
import type { DisplayActType } from "./DisplayActType";

// ---- ReDriveBattleCore.ActOrderUnitInfo  (TypeDefIndex 298, public class) ----
export class ActOrderUnitInfo {
    /** 0x10 private int <ActId>k__BackingField */
    _ActId: int = 0;
    /** 0x14 private int <BattleUnitId>k__BackingField */
    _BattleUnitId: int = 0;
    /** 0x18 private bool <ShouldShow>k__BackingField */
    _ShouldShow: boolean = false;
    /** 0x1C private DisplayActType <ActType>k__BackingField */
    _ActType: DisplayActType = 0 as DisplayActType;
    /** 0x20 private int <ComboActionId>k__BackingField */
    _ComboActionId: int = 0;
    /** 0x24 private bool <IsDecided>k__BackingField */
    _IsDecided: boolean = false;
    get ActId(): int { return this.get_ActId(); }
    set ActId(v: int) { this.set_ActId(v); }
    get BattleUnitId(): int { return this.get_BattleUnitId(); }
    set BattleUnitId(v: int) { this.set_BattleUnitId(v); }
    get ShouldShow(): boolean { return this.get_ShouldShow(); }
    set ShouldShow(v: boolean) { this.set_ShouldShow(v); }
    get ActType(): DisplayActType { return this.get_ActType(); }
    set ActType(v: DisplayActType) { this.set_ActType(v); }
    get ComboActionId(): int { return this.get_ComboActionId(); }
    set ComboActionId(v: int) { this.set_ComboActionId(v); }
    get IsDecided(): boolean { return this.get_IsDecided(); }
    set IsDecided(v: boolean) { this.set_IsDecided(v); }
    /** @rva 0x7354F0  public int get_ActId() { } */
    get_ActId(): int { return this._ActId; /* auto-property */ }
    /** @rva 0x738D00  public void set_ActId(int value) { } */
    set_ActId(value: int): void { this._ActId = value; /* auto-property */ }
    /** @rva 0x802350  public int get_BattleUnitId() { } */
    get_BattleUnitId(): int { return this._BattleUnitId; /* auto-property */ }
    /** @rva 0x802540  public void set_BattleUnitId(int value) { } */
    set_BattleUnitId(value: int): void { this._BattleUnitId = value; /* auto-property */ }
    /** @rva 0x7F87F0  public bool get_ShouldShow() { } */
    get_ShouldShow(): boolean { return this._ShouldShow; /* auto-property */ }
    /** @rva 0x7F8810  public void set_ShouldShow(bool value) { } */
    set_ShouldShow(value: boolean): void { this._ShouldShow = value; /* auto-property */ }
    /** @rva 0x7F8800  public DisplayActType get_ActType() { } */
    get_ActType(): DisplayActType { return this._ActType; /* auto-property */ }
    /** @rva 0x7F8820  public void set_ActType(DisplayActType value) { } */
    set_ActType(value: DisplayActType): void { this._ActType = value; /* auto-property */ }
    /** @rva 0x75DD70  public int get_ComboActionId() { } */
    get_ComboActionId(): int { return this._ComboActionId; /* auto-property */ }
    /** @rva 0x8A1230  public void set_ComboActionId(int value) { } */
    set_ComboActionId(value: int): void { this._ComboActionId = value; /* auto-property */ }
    /** @rva 0x8A11C0  public bool get_IsDecided() { } */
    get_IsDecided(): boolean { return this._IsDecided; /* auto-property */ }
    /** @rva 0x8A1270  public void set_IsDecided(bool value) { } */
    set_IsDecided(value: boolean): void { this._IsDecided = value; /* auto-property */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x139B730  public void .ctor(ActBase act) { } */
    ctor$ActBase(act: ActBase): this {
        if (act == null) return this;
        this._ActId = act.id;
        this._BattleUnitId = act.actUnitId;
        this._ActType = this.GetDisplayActType(act); // inlined in the game
        this._ShouldShow = act.get_ShouldShow();
        if (act instanceof ComboTurnUnitAct) this._ComboActionId = act._ActionStep - 1;
        if (act instanceof SkillDecisionActBase) this._IsDecided = act._IsDecided;
        return this;
    }
    /** @rva 0x139B570  public DisplayActType GetDisplayActType(ActBase act) { } */
    GetDisplayActType(act: ActBase): DisplayActType {
        if (act instanceof TurnUnitAct) return 1 as DisplayActType;
        if (act instanceof SpecialAttackAct) return 2 as DisplayActType;
        if (act instanceof AdditionalSkillAct) return 3 as DisplayActType;
        if (act instanceof AdditionalTurnUnitAct) return 4 as DisplayActType;
        if (act instanceof ReActionTurnUnitAct) return 5 as DisplayActType;
        if (act instanceof StartTimingAct) return 1 as DisplayActType;
        return (act.get_ShouldShow() ? 6 : 0) as DisplayActType; // ActBase vslot 6
    }
}
