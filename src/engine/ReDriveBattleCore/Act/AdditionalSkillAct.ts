// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { ActBase, ActBase_Define } from "./ActBase";

// ---- ReDriveBattleCore.Act.AdditionalSkillAct  (TypeDefIndex 1112, public class) ----
export class AdditionalSkillAct extends ActBase {
    /** 0x30 private int <Priority>k__BackingField */
    _Priority$AdditionalSkillAct: int = 0;
    /** 0x34 public int skillMstId */
    skillMstId: int = 0;
    /** 0x38 public bool IsTargetingCurrentActUnit */
    IsTargetingCurrentActUnit: boolean = false;
    /** 0x39 public bool IsForcedAct */
    IsForcedAct: boolean = false;
    /** @rva 0x75DD60 slot 4  public override int get_Priority() { } */
    get_Priority(): int { return this._Priority$AdditionalSkillAct; /* auto-property */ }
    /** @rva 0x8735A0 slot 5  public override void set_Priority(int value) { } */
    set_Priority(value: int): void { this._Priority$AdditionalSkillAct = value; /* auto-property */ }
    /** @rva 0x1920B60  public void .ctor() { } */
    ctor(): this {
        this._Priority$AdditionalSkillAct = ActBase_Define.AdditionalSkillDefaultPriority;
        return super.ctor();
    }
}
