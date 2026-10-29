// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { AbilityEffectCategory } from "../../Network/Definition/Skill/AbilityEffectCategory";
import { MstModelBase } from "./MstModelBase";
import type { AbilityEffectTypeMstRecord } from "../../Network/Definition/Skill/AbilityEffectTypeMstRecord";

// ---- ReDriveBattleCore.Model.AbilityEffectTypeMstModel  (TypeDefIndex 876, public class) ----
export class AbilityEffectTypeMstModel extends MstModelBase<AbilityEffectTypeMstRecord> {
    get AbilityEffectTypeMstId(): int { return this.get_AbilityEffectTypeMstId(); }
    get EffectType(): string { return this.get_EffectType(); }
    get IconName(): string { return this.get_IconName(); }
    get Name(): string { return this.get_Name(); }
    get StateFlipName(): string { return this.get_StateFlipName(); }
    get TargetParams(): string { return this.get_TargetParams(); }
    get ParamEffectType(): int { return this.get_ParamEffectType(); }
    get DisplayType(): int { return this.get_DisplayType(); }
    get Category(): AbilityEffectCategory { return this.get_Category(); }
    /** @rva 0x16DF600  public void .ctor(AbilityEffectTypeMstRecord record) { } */
    ctor$AbilityEffectTypeMstRecord(record: AbilityEffectTypeMstRecord): this {
        super.ctor$TRecord(record);
        return this;
    }
    /** @rva 0x902330  public int get_AbilityEffectTypeMstId() { } */
    get_AbilityEffectTypeMstId(): int { return this.record.abilityEffectTypeMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x902E70  public string get_EffectType() { } */
    get_EffectType(): string { return this.record.effectType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017f6; mov rax, qword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0x16DF670  public string get_IconName() { } */
    get_IconName(): string { return this.record.iconName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbec6; mov rax, qword ptr [rax + 0x40]; add rsp, 0x28; ret */ }
    /** @rva 0x85E540  public string get_Name() { } */
    get_Name(): string { return this.record.name; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x85e556; mov rax, qword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x7F9C00  public string get_StateFlipName() { } */
    get_StateFlipName(): string { return this.record.stateFlipName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x7f9c16; mov rax, qword ptr [rax + 0x48]; add rsp, 0x28; ret */ }
    /** @rva 0x7F9BC0  public string get_TargetParams() { } */
    get_TargetParams(): string { return this.record.targetParams; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x7f9bd6; mov rax, qword ptr [rax + 0x30]; add rsp, 0x28; ret */ }
    /** @rva 0x902F10  public int get_ParamEffectType() { } */
    get_ParamEffectType(): int { return this.record.paramEffectType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbee5; mov eax, dword ptr [rax + 0x38]; add rsp, 0x28; ret */ }
    /** @rva 0x16DF650  public int get_DisplayType() { } */
    get_DisplayType(): int { return this.record.displayType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbea5; mov eax, dword ptr [rax + 0x50]; add rsp, 0x28; ret */ }
    /** @rva 0xA05290  public AbilityEffectCategory get_Category() { } */
    get_Category(): AbilityEffectCategory { return this.record.category as AbilityEffectCategory; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
}
