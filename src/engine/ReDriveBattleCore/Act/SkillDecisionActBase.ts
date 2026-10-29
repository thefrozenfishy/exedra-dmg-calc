// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { ActBase } from "./ActBase";

// ---- ReDriveBattleCore.Act.SkillDecisionActBase  (TypeDefIndex 1104, public abstract class) ----
export abstract class SkillDecisionActBase extends ActBase {
    /** 0x30 private bool <IsDecided>k__BackingField */
    _IsDecided: boolean = false;
    /** 0x34 public int skillMstId */
    skillMstId: int = 0;
    get IsDecided(): boolean { return this.get_IsDecided(); }
    set IsDecided(v: boolean) { this.set_IsDecided(v); }
    get IsCanInterrupt(): boolean { return this.get_IsCanInterrupt(); }
    /** @rva 0x75F800  public bool get_IsDecided() { } */
    get_IsDecided(): boolean { return this._IsDecided; /* auto-property */ }
    /** @rva 0x75F830  public void set_IsDecided(bool value) { } */
    set_IsDecided(value: boolean): void { this._IsDecided = value; /* auto-property */ }
    /** @rva 0x7360C0 slot 7  public virtual bool get_IsCanInterrupt() { } */
    get_IsCanInterrupt(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0xAAC2B0  public void Decide() { } */
    Decide(): void { this._IsDecided = true; /* asm: mov byte ptr [rcx + 0x30], 1; ret */ }
    /** @rva 0x191F050  public void ResetDecision() { } */
    ResetDecision(): void {
        this._IsDecided = false;
        this.skillMstId = 0;
    }
    /** @rva 0x190AA40  protected void .ctor() { } */
    ctor(): this { return super.ctor(); /* folded: ActBase..ctor */ }
}
