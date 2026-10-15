// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { BattleUnit_TeamType } from "../BattleUnit";

// ---- ReDriveBattleCore.Act.ActBase  (TypeDefIndex 1101, public abstract class) ----
export abstract class ActBase {
    /** 0x10 public int id */
    id: int = 0;
    /** 0x14 public int actUnitId */
    actUnitId: int = 0;
    /** 0x18 public BattleUnit.TeamType actUnitTeam */
    actUnitTeam: BattleUnit_TeamType = 0 as BattleUnit_TeamType;
    /** 0x1C public int targetUnitId */
    targetUnitId: int = 0;
    /** 0x20 public int targetFriendUnitId */
    targetFriendUnitId: int = 0;
    /** 0x24 private int <Priority>k__BackingField */
    _Priority: int = 0;
    /** 0x28 private bool <IsExecuted>k__BackingField */
    _IsExecuted: boolean = false;
    get Priority(): int { return this.get_Priority(); }
    set Priority(v: int) { this.set_Priority(v); }
    get IsExecuted(): boolean { return this.get_IsExecuted(); }
    set IsExecuted(v: boolean) { this.set_IsExecuted(v); }
    get ShouldShow(): boolean { return this.get_ShouldShow(); }
    /** @rva 0x759830 slot 4  public virtual int get_Priority() { } */
    get_Priority(): int { return this._Priority; /* auto-property */ }
    /** @rva 0x759840 slot 5  public virtual void set_Priority(int value) { } */
    set_Priority(value: int): void { this._Priority = value; /* auto-property */ }
    /** @rva 0x7394E0  public bool get_IsExecuted() { } */
    get_IsExecuted(): boolean { return this._IsExecuted; /* auto-property */ }
    /** @rva 0x7394F0  public void set_IsExecuted(bool value) { } */
    set_IsExecuted(value: boolean): void { this._IsExecuted = value; /* auto-property */ }
    /** @rva 0x76E830 slot 6  public virtual bool get_ShouldShow() { } */
    get_ShouldShow(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x810D40  public void SetIsExecuted() { } */
    SetIsExecuted(): void { this._IsExecuted = true; /* asm: mov byte ptr [rcx + 0x28], 1; ret */ }
    /** @rva 0x191AEB0  protected void .ctor() { } */
    ctor(): this {
        this._Priority = ActBase_Define.DefaultPriority;
        return this;
    }
}

// ---- ReDriveBattleCore.Act.ActBase.Define  (TypeDefIndex 1100, public static class) ----
export class ActBase_Define {
    /** 0x0 public static readonly int DefaultPriority */
    static DefaultPriority: int = 0;
    /** 0x4 public static readonly int TurnBeginPriority */
    static TurnBeginPriority: int = 0;
    /** 0x8 public static readonly int TurnEndPriority */
    static TurnEndPriority: int = 0;
    /** 0xC public static readonly int AdditionalSkillDefaultPriority */
    static AdditionalSkillDefaultPriority: int = 0;
    /** 0x10 public static readonly int HpGaugeReviveActPriority */
    static HpGaugeReviveActPriority: int = 0;
    /** 0x14 public static readonly int ModeChangeActPriority */
    static ModeChangeActPriority: int = 0;
    /** 0x18 public static readonly int StartTimingActPriority */
    static StartTimingActPriority: int = 0;
    /** 0x1C public static readonly int CountdownAdditionalSkillActPriority */
    static CountdownAdditionalSkillActPriority: int = 0;
    /** @rva 0x19260B0  private static void .cctor() { } */
    static cctor(): void {
        ActBase_Define.DefaultPriority = 0;
        ActBase_Define.TurnBeginPriority = 100;
        ActBase_Define.TurnEndPriority = -100;
        ActBase_Define.AdditionalSkillDefaultPriority = 50;
        ActBase_Define.HpGaugeReviveActPriority = 200;
        ActBase_Define.ModeChangeActPriority = 300;
        ActBase_Define.StartTimingActPriority = 500;
        ActBase_Define.CountdownAdditionalSkillActPriority = 1000;
    }
}

ActBase_Define.cctor(); // C# static constructor (side-effect free, so run at module load)