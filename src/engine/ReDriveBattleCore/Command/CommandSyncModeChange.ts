// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { ModeChangeReferee_ModeChangeInfo } from "../ModeChangeReferee";

// ---- ReDriveBattleCore.Command.CommandSyncModeChange  (TypeDefIndex 1022, public class) ----
export class CommandSyncModeChange extends CommandBase {
    /** 0x18 private List<ModeChangeReferee.ModeChangeInfo> <ModeChangeInfoList>k__BackingField */
    _ModeChangeInfoList: List<ModeChangeReferee_ModeChangeInfo> = null!;
    /** 0x20 private int <ModeChangeCurrentStep>k__BackingField */
    _ModeChangeCurrentStep: int = 0;
    get ModeChangeInfoList(): List<ModeChangeReferee_ModeChangeInfo> { return this.get_ModeChangeInfoList(); }
    set ModeChangeInfoList(v: List<ModeChangeReferee_ModeChangeInfo>) { this.set_ModeChangeInfoList(v); }
    get ModeChangeCurrentStep(): int { return this.get_ModeChangeCurrentStep(); }
    set ModeChangeCurrentStep(v: int) { this.set_ModeChangeCurrentStep(v); }
    /** @rva 0x17EB860 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 33 as CommandType; /* asm: mov eax, 0x21; ret */ }
    /** @rva 0x733E90  public List<ModeChangeReferee.ModeChangeInfo> get_ModeChangeInfoList() { } */
    get_ModeChangeInfoList(): List<ModeChangeReferee_ModeChangeInfo> { return this._ModeChangeInfoList; /* auto-property */ }
    /** @rva 0x736AB0  public void set_ModeChangeInfoList(List<ModeChangeReferee.ModeChangeInfo> value) { } */
    set_ModeChangeInfoList(value: List<ModeChangeReferee_ModeChangeInfo>): void { this._ModeChangeInfoList = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_ModeChangeCurrentStep() { } */
    get_ModeChangeCurrentStep(): int { return this._ModeChangeCurrentStep; /* auto-property */ }
    /** @rva 0x8A2230  public void set_ModeChangeCurrentStep(int value) { } */
    set_ModeChangeCurrentStep(value: int): void { this._ModeChangeCurrentStep = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17EB870  public void .ctor(List<ModeChangeReferee.ModeChangeInfo> modeChangeInfoList, int modeChangeCurrentStep) { } */
    ctor$ListModeChangeRefereeModeChangeInfo_int(modeChangeInfoList: List<ModeChangeReferee_ModeChangeInfo>, modeChangeCurrentStep: int): this {
        this._ModeChangeInfoList = modeChangeInfoList;
        this._ModeChangeCurrentStep = modeChangeCurrentStep;
        return this;
    }
}
