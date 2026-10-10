// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.SkillMstModel  (TypeDefIndex 895, public class) ----
export class SkillMstModel extends MstModelBase<any /* SkillMstRecord */> {  // implements IEnhanceSkill
    static readonly __interfaces: readonly string[] = ['IEnhanceSkill'];
    get SkillMstId(): int { return this.get_SkillMstId(); }
    get SkillUniqueId(): int { return this.get_SkillUniqueId(); }
    get Name(): string { return this.get_Name(); }
    get Type(): SkillType { return this.get_Type(); }
    get Level(): int { return this.get_Level(); }
    get SP(): int { return this.get_SP(); }
    get HitEffectResourceName(): string { return this.get_HitEffectResourceName(); }
    get Description(): string { return this.get_Description(); }
    get BalloonText(): string { return this.get_BalloonText(); }
    get IconName(): string { return this.get_IconName(); }
    get DirectionName(): string { return this.get_DirectionName(); }
    get CueSheetName(): string { return this.get_CueSheetName(); }
    get CueName(): string { return this.get_CueName(); }
    get IsEmphasize(): boolean { return this.get_IsEmphasize(); }
    get SkillButtonIcon(): string { return this.get_SkillButtonIcon(); }
    get IsActiveSkill(): boolean { return this.get_IsActiveSkill(); }
    get IsSpecialAttack(): boolean { return this.get_IsSpecialAttack(); }
    get AdditionalCueName(): string { return this.get_AdditionalCueName(); }
    /** @rva 0x16D82A0  public void .ctor(SkillMstRecord record) { } */
    ctor$SkillMstRecord(record: any /* SkillMstRecord */): this { return notPorted("SkillMstModel..ctor", 0x16D82A0); }
    /** @rva 0x901770  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return notPorted("SkillMstModel.get_SkillMstId", 0x901770); }
    /** @rva 0x901790  public int get_SkillUniqueId() { } */
    get_SkillUniqueId(): int { return notPorted("SkillMstModel.get_SkillUniqueId", 0x901790); }
    /** @rva 0x9017E0 slot 4  public string get_Name() { } */
    get_Name(): string { return notPorted("SkillMstModel.get_Name", 0x9017E0); }
    /** @rva 0x901940  public SkillType get_Type() { } */
    get_Type(): SkillType { return notPorted("SkillMstModel.get_Type", 0x901940); }
    /** @rva 0x902C70  public int get_Level() { } */
    get_Level(): int { return notPorted("SkillMstModel.get_Level", 0x902C70); }
    /** @rva 0xA0E810  public int get_SP() { } */
    get_SP(): int { return notPorted("SkillMstModel.get_SP", 0xA0E810); }
    /** @rva 0x901750  public string get_HitEffectResourceName() { } */
    get_HitEffectResourceName(): string { return notPorted("SkillMstModel.get_HitEffectResourceName", 0x901750); }
    /** @rva 0x116EC30 slot 5  public string get_Description() { } */
    get_Description(): string { return notPorted("SkillMstModel.get_Description", 0x116EC30); }
    /** @rva 0x16CBEB0  public string get_BalloonText() { } */
    get_BalloonText(): string { return notPorted("SkillMstModel.get_BalloonText", 0x16CBEB0); }
    /** @rva 0x7F9C00  public string get_IconName() { } */
    get_IconName(): string { return notPorted("SkillMstModel.get_IconName", 0x7F9C00); }
    /** @rva 0x16D7F70  public string get_DirectionName() { } */
    get_DirectionName(): string { return notPorted("SkillMstModel.get_DirectionName", 0x16D7F70); }
    /** @rva 0x16D8310  public string get_CueSheetName() { } */
    get_CueSheetName(): string { return notPorted("SkillMstModel.get_CueSheetName", 0x16D8310); }
    /** @rva 0x16D3210  public string get_CueName() { } */
    get_CueName(): string { return notPorted("SkillMstModel.get_CueName", 0x16D3210); }
    /** @rva 0x16D8350  public bool get_IsEmphasize() { } */
    get_IsEmphasize(): boolean { return notPorted("SkillMstModel.get_IsEmphasize", 0x16D8350); }
    /** @rva 0x16D8390  public string get_SkillButtonIcon() { } */
    get_SkillButtonIcon(): string { return notPorted("SkillMstModel.get_SkillButtonIcon", 0x16D8390); }
    /** @rva 0x16D8330  public bool get_IsActiveSkill() { } */
    get_IsActiveSkill(): boolean { return notPorted("SkillMstModel.get_IsActiveSkill", 0x16D8330); }
    /** @rva 0x16D8370  public bool get_IsSpecialAttack() { } */
    get_IsSpecialAttack(): boolean { return notPorted("SkillMstModel.get_IsSpecialAttack", 0x16D8370); }
    /** @rva 0x16D82F0  public string get_AdditionalCueName() { } */
    get_AdditionalCueName(): string { return notPorted("SkillMstModel.get_AdditionalCueName", 0x16D82F0); }
}
