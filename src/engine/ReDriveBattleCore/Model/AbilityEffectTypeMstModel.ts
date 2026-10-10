// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { AbilityEffectCategory } from "../../Network/Definition/Skill/AbilityEffectCategory";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.AbilityEffectTypeMstModel  (TypeDefIndex 876, public class) ----
export class AbilityEffectTypeMstModel extends MstModelBase<any /* AbilityEffectTypeMstRecord */> {
    get AbilityEffectTypeMstId(): int { return this.get_AbilityEffectTypeMstId(); }
    get EffectType(): string { return this.get_EffectType(); }
    get IconName(): string { return this.get_IconName(); }
    get Name(): string { return this.get_Name(); }
    get StateFlipName(): string { return this.get_StateFlipName(); }
    get TargetParams(): string { return this.get_TargetParams(); }
    get ParamEffectType(): int { return this.get_ParamEffectType(); }
    get DisplayType(): int { return this.get_DisplayType(); }
    get Category(): AbilityEffectCategory { return this.get_Category(); }
    /** @rva 0x16CBE40  public void .ctor(AbilityEffectTypeMstRecord record) { } */
    ctor$AbilityEffectTypeMstRecord(record: any /* AbilityEffectTypeMstRecord */): this { return notPorted("AbilityEffectTypeMstModel..ctor", 0x16CBE40); }
    /** @rva 0x901770  public int get_AbilityEffectTypeMstId() { } */
    get_AbilityEffectTypeMstId(): int { return notPorted("AbilityEffectTypeMstModel.get_AbilityEffectTypeMstId", 0x901770); }
    /** @rva 0x9017E0  public string get_EffectType() { } */
    get_EffectType(): string { return notPorted("AbilityEffectTypeMstModel.get_EffectType", 0x9017E0); }
    /** @rva 0x16CBEB0  public string get_IconName() { } */
    get_IconName(): string { return notPorted("AbilityEffectTypeMstModel.get_IconName", 0x16CBEB0); }
    /** @rva 0x85E540  public string get_Name() { } */
    get_Name(): string { return notPorted("AbilityEffectTypeMstModel.get_Name", 0x85E540); }
    /** @rva 0x7F9C00  public string get_StateFlipName() { } */
    get_StateFlipName(): string { return notPorted("AbilityEffectTypeMstModel.get_StateFlipName", 0x7F9C00); }
    /** @rva 0x7F9BC0  public string get_TargetParams() { } */
    get_TargetParams(): string { return notPorted("AbilityEffectTypeMstModel.get_TargetParams", 0x7F9BC0); }
    /** @rva 0x16CBED0  public int get_ParamEffectType() { } */
    get_ParamEffectType(): int { return notPorted("AbilityEffectTypeMstModel.get_ParamEffectType", 0x16CBED0); }
    /** @rva 0x16CBE90  public int get_DisplayType() { } */
    get_DisplayType(): int { return notPorted("AbilityEffectTypeMstModel.get_DisplayType", 0x16CBE90); }
    /** @rva 0xA0E790  public AbilityEffectCategory get_Category() { } */
    get_Category(): AbilityEffectCategory { return notPorted("AbilityEffectTypeMstModel.get_Category", 0xA0E790); }
}
