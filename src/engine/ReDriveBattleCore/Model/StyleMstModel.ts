// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { RoleType } from "../../Network/Definition/Battle/RoleType";
import { ElementType } from "../../Network/Definition/Battle/ElementType";
import { EnumUtil } from "../EnumUtil";
import { notPorted } from "../../runtime";
import type { int } from "../../runtime";

import { MstModelBase } from "./MstModelBase";
import type { StyleMstRecord } from "../../Network/Definition/Style/StyleMstRecord";

// ---- ReDriveBattleCore.Model.StyleMstModel  (TypeDefIndex 898, public class) ----
export class StyleMstModel extends MstModelBase<StyleMstRecord> {  // implements IHaveThumbnailTexture, IHaveOriginalTexture, IHaveTexture
    static readonly __interfaces: readonly string[] = ['IHaveThumbnailTexture', 'IHaveOriginalTexture', 'IHaveTexture'];
    /** 0x18 private readonly int[] <SkillMstIds>k__BackingField */
    _SkillMstIds: int[] = null!;
    /** 0x20 private readonly int[] <PassiveSkillMstIds>k__BackingField */
    _PassiveSkillMstIds: int[] = null!;
    get StyleMstId(): int { return this.get_StyleMstId(); }
    get StyleFigureMstId(): int { return this.get_StyleFigureMstId(); }
    get SpecialAttackMstId(): int { return this.get_SpecialAttackMstId(); }
    get PassiveSkill1(): int { return this.get_PassiveSkill1(); }
    get LimitBreakPassiveSkill1(): int { return this.get_LimitBreakPassiveSkill1(); }
    get SubPassiveSkill(): int { return this.get_SubPassiveSkill(); }
    get NormalAttack(): int { return this.get_NormalAttack(); }
    get SkillMstIds(): int[] { return this.get_SkillMstIds(); }
    get PassiveSkillMstIds(): int[] { return this.get_PassiveSkillMstIds(); }
    get Name(): string { return this.get_Name(); }
    get Rarity(): int { return this.get_Rarity(); }
    get Hp(): int { return this.get_Hp(); }
    get Ep(): int { return this.get_Ep(); }
    get Bp(): int { return this.get_Bp(); }
    get Atk(): int { return this.get_Atk(); }
    get Def(): int { return this.get_Def(); }
    get Speed(): int { return this.get_Speed(); }
    get CriticalRate(): int { return this.get_CriticalRate(); }
    get CriticalDamageRate(): int { return this.get_CriticalDamageRate(); }
    get BreakDamageRate(): int { return this.get_BreakDamageRate(); }
    get HealRate(): int { return this.get_HealRate(); }
    get RecoveryEpRate(): int { return this.get_RecoveryEpRate(); }
    get EffectHitRate(): int { return this.get_EffectHitRate(); }
    get EffectParryRate(): int { return this.get_EffectParryRate(); }
    get FireDamageRate(): int { return this.get_FireDamageRate(); }
    get AquaDamageRate(): int { return this.get_AquaDamageRate(); }
    get ForestDamageRate(): int { return this.get_ForestDamageRate(); }
    get LightDamageRate(): int { return this.get_LightDamageRate(); }
    get DarkDamageRate(): int { return this.get_DarkDamageRate(); }
    get NeutralDamageRate(): int { return this.get_NeutralDamageRate(); }
    get FireResistRate(): int { return this.get_FireResistRate(); }
    get AquaResistRate(): int { return this.get_AquaResistRate(); }
    get ForestResistRate(): int { return this.get_ForestResistRate(); }
    get LightResistRate(): int { return this.get_LightResistRate(); }
    get DarkResistRate(): int { return this.get_DarkResistRate(); }
    get NeutralResistRate(): int { return this.get_NeutralResistRate(); }
    get ReleaseTime(): any /* DateTimeOffset */ { return this.get_ReleaseTime(); }
    get Element(): ElementType { return this.get_Element(); }
    get Role(): RoleType { return this.get_Role(); }
    get IHaveThumbnailTexture$Type(): any /* AssetBundleType */ { return this.get_IHaveThumbnailTexture$Type(); }
    get IHaveOriginalTexture$Type(): any /* AssetBundleType */ { return this.get_IHaveOriginalTexture$Type(); }
    get IHaveTexture$Type(): any /* AssetBundleType */ { return this.get_IHaveTexture$Type(); }
    get IHaveThumbnailTexture$TextureKey(): string { return this.get_IHaveThumbnailTexture$TextureKey(); }
    get IHaveOriginalTexture$TextureKey(): string { return this.get_IHaveOriginalTexture$TextureKey(); }
    get IHaveTexture$TextureKey(): string { return this.get_IHaveTexture$TextureKey(); }
    get ResourceName(): string { return this.get_ResourceName(); }
    get HaveAnimatedStyle(): boolean { return this.get_HaveAnimatedStyle(); }
    get IsReleased(): boolean { return this.get_IsReleased(); }
    /** @rva 0x1702870  public void .ctor(StyleMstRecord record) { } */
    ctor$StyleMstRecord(record: StyleMstRecord): this {
        super.ctor$TRecord(record);
        // new int[1] { record.skill1 }. PassiveSkillMstIds is never assigned in 3.19.0 (stays null).
        this._SkillMstIds = [record.skill1];
        return this;
    }
    /** @rva 0x901380  public int get_StyleMstId() { } */
    get_StyleMstId(): int { return this.record.styleMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0xA06180  public int get_StyleFigureMstId() { } */
    get_StyleFigureMstId(): int { return this.record.styleFigureMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0d855; mov eax, dword ptr [rax + 0x20]; add rsp, 0x28; ret */ }
    /** @rva 0xA06660  public int get_SpecialAttackMstId() { } */
    get_SpecialAttackMstId(): int { return this.record.specialAttackMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0x901F20  public int get_PassiveSkill1() { } */
    get_PassiveSkill1(): int { return this.record.passiveSkill1; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e825; mov eax, dword ptr [rax + 0x34]; add rsp, 0x28; ret */ }
    /** @rva 0x901F40  public int get_LimitBreakPassiveSkill1() { } */
    get_LimitBreakPassiveSkill1(): int { return this.record.limitBreakPassiveSkill1; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbee5; mov eax, dword ptr [rax + 0x38]; add rsp, 0x28; ret */ }
    /** @rva 0x901F00  public int get_SubPassiveSkill() { } */
    get_SubPassiveSkill(): int { return this.record.subPassiveSkill; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d3205; mov eax, dword ptr [rax + 0x3c]; add rsp, 0x28; ret */ }
    /** @rva 0xA06680  public int get_NormalAttack() { } */
    get_NormalAttack(): int { return this.record.normalAttack; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7c5; mov eax, dword ptr [rax + 0x2c]; add rsp, 0x28; ret */ }
    /** @rva 0x732E90  public int[] get_SkillMstIds() { } */
    get_SkillMstIds(): int[] { return this._SkillMstIds; /* auto-property */ }
    /** @rva 0x7359E0  public int[] get_PassiveSkillMstIds() { } */
    get_PassiveSkillMstIds(): int[] { return this._PassiveSkillMstIds; /* auto-property */ }
    /** @rva 0x85D540  public string get_Name() { } */
    get_Name(): string { return this.record.name; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x85e556; mov rax, qword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0xA066A0  public int get_Rarity() { } */
    get_Rarity(): int { return this.record.rarity; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7e5; mov eax, dword ptr [rax + 0x24]; add rsp, 0x28; ret */ }
    /** @rva 0x901F90  public int get_Hp() { } */
    get_Hp(): int { return this.record.hp; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d7fc5; mov eax, dword ptr [rax + 0x44]; add rsp, 0x28; ret */ }
    /** @rva 0xA06560  public int get_Ep() { } */
    get_Ep(): int { return this.record.ep; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9019b5; mov eax, dword ptr [rax + 0x48]; add rsp, 0x28; ret */ }
    /** @rva 0xA06540  public int get_Bp() { } */
    get_Bp(): int { return this.record.bp; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901995; mov eax, dword ptr [rax + 0x4c]; add rsp, 0x28; ret */ }
    /** @rva 0x16FB990  public int get_Atk() { } */
    get_Atk(): int { return this.record.atk; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b15; mov eax, dword ptr [rax + 0x54]; add rsp, 0x28; ret */ }
    /** @rva 0x16FB9B0  public int get_Def() { } */
    get_Def(): int { return this.record.def; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b35; mov eax, dword ptr [rax + 0x58]; add rsp, 0x28; ret */ }
    /** @rva 0x16FE220  public int get_Speed() { } */
    get_Speed(): int { return this.record.speed; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4355; mov eax, dword ptr [rax + 0x5c]; add rsp, 0x28; ret */ }
    /** @rva 0x16FECC0  public int get_CriticalRate() { } */
    get_CriticalRate(): int { return this.record.criticalRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4df5; mov eax, dword ptr [rax + 0x60]; add rsp, 0x28; ret */ }
    /** @rva 0x16FE240  public int get_CriticalDamageRate() { } */
    get_CriticalDamageRate(): int { return this.record.criticalDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4375; mov eax, dword ptr [rax + 0x64]; add rsp, 0x28; ret */ }
    /** @rva 0x16FE260  public int get_BreakDamageRate() { } */
    get_BreakDamageRate(): int { return this.record.breakDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4395; mov eax, dword ptr [rax + 0x68]; add rsp, 0x28; ret */ }
    /** @rva 0x1702AD0  public int get_HealRate() { } */
    get_HealRate(): int { return this.record.healRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8a85; mov eax, dword ptr [rax + 0x6c]; add rsp, 0x28; ret */ }
    /** @rva 0x16F5980  public int get_RecoveryEpRate() { } */
    get_RecoveryEpRate(): int { return this.record.recoveryEpRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbea5; mov eax, dword ptr [rax + 0x50]; add rsp, 0x28; ret */ }
    /** @rva 0x17029A0  public int get_EffectHitRate() { } */
    get_EffectHitRate(): int { return this.record.effectHitRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8955; mov eax, dword ptr [rax + 0x70]; add rsp, 0x28; ret */ }
    /** @rva 0x17029C0  public int get_EffectParryRate() { } */
    get_EffectParryRate(): int { return this.record.effectParryRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8975; mov eax, dword ptr [rax + 0x74]; add rsp, 0x28; ret */ }
    /** @rva 0x1702A30  public int get_FireDamageRate() { } */
    get_FireDamageRate(): int { return this.record.fireDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d89e5; mov eax, dword ptr [rax + 0x78]; add rsp, 0x28; ret */ }
    /** @rva 0x1702940  public int get_AquaDamageRate() { } */
    get_AquaDamageRate(): int { return this.record.aquaDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d88f5; mov eax, dword ptr [rax + 0x7c]; add rsp, 0x28; ret */ }
    /** @rva 0x1702A70  public int get_ForestDamageRate() { } */
    get_ForestDamageRate(): int { return this.record.forestDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8a28; mov eax, dword ptr [rax + 0x80]; add rsp, 0x28; ret */ }
    /** @rva 0x1702B70  public int get_LightDamageRate() { } */
    get_LightDamageRate(): int { return this.record.lightDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8b28; mov eax, dword ptr [rax + 0x84]; add rsp, 0x28; ret */ }
    /** @rva 0x1702980  public int get_DarkDamageRate() { } */
    get_DarkDamageRate(): int { return this.record.darkDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8938; mov eax, dword ptr [rax + 0x88]; add rsp, 0x28; ret */ }
    /** @rva 0x1702BB0  public int get_NeutralDamageRate() { } */
    get_NeutralDamageRate(): int { return this.record.neutralDamageRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8b68; mov eax, dword ptr [rax + 0x8c]; add rsp, 0x28; ret */ }
    /** @rva 0x1702A50  public int get_FireResistRate() { } */
    get_FireResistRate(): int { return this.record.fireResistRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8a08; mov eax, dword ptr [rax + 0x90]; add rsp, 0x28; ret */ }
    /** @rva 0x1702960  public int get_AquaResistRate() { } */
    get_AquaResistRate(): int { return this.record.aquaResistRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8918; mov eax, dword ptr [rax + 0x94]; add rsp, 0x28; ret */ }
    /** @rva 0x1702A90  public int get_ForestResistRate() { } */
    get_ForestResistRate(): int { return this.record.forestResistRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8a48; mov eax, dword ptr [rax + 0x98]; add rsp, 0x28; ret */ }
    /** @rva 0x1702B90  public int get_LightResistRate() { } */
    get_LightResistRate(): int { return this.record.lightResistRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d8b48; mov eax, dword ptr [rax + 0x9c]; add rsp, 0x28; ret */ }
    /** @rva 0x16FFA60  public int get_DarkResistRate() { } */
    get_DarkResistRate(): int { return this.record.darkResistRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5b98; mov eax, dword ptr [rax + 0xa0]; add rsp, 0x28; ret */ }
    /** @rva 0x16FFA80  public int get_NeutralResistRate() { } */
    get_NeutralResistRate(): int { return this.record.neutralResistRate; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5bb8; mov eax, dword ptr [rax + 0xa4]; add rsp, 0x28; ret */ }
    /** @rva 0x1702BD0  public DateTimeOffset get_ReleaseTime() { } */
    get_ReleaseTime(): any /* DateTimeOffset */ { return notPorted("StyleMstModel.get_ReleaseTime", 0x1702BD0); }
    /** @rva 0x17029E0  public ElementType get_Element() { } */
    get_Element(): ElementType {
        return EnumUtil.Cast<ElementType>(ElementType, this.record.element);
    }
    /** @rva 0x1702C00  public RoleType get_Role() { } */
    get_Role(): RoleType {
        return EnumUtil.Cast<RoleType>(RoleType, this.record.role);
    }
    /** @rva 0x1702860 slot 4  private AssetBundleType ReDrive.Common.IHaveThumbnailTexture.get_Type() { } */
    get_IHaveThumbnailTexture$Type(): any /* AssetBundleType */ { return notPorted("StyleMstModel.ReDrive.Common.IHaveThumbnailTexture.get_Type", 0x1702860); }
    /** @rva 0x1702840 slot 6  private AssetBundleType ReDrive.Common.IHaveOriginalTexture.get_Type() { } */
    get_IHaveOriginalTexture$Type(): any /* AssetBundleType */ { return notPorted("StyleMstModel.ReDrive.Common.IHaveOriginalTexture.get_Type", 0x1702840); }
    /** @rva 0x1702850 slot 8  private AssetBundleType ReDrive.Common.IHaveTexture.get_Type() { } */
    get_IHaveTexture$Type(): any /* AssetBundleType */ { return notPorted("StyleMstModel.ReDrive.Common.IHaveTexture.get_Type", 0x1702850); }
    /** @rva 0x16FFAA0 slot 5  private string ReDrive.Common.IHaveThumbnailTexture.get_TextureKey() { } */
    get_IHaveThumbnailTexture$TextureKey(): string { return notPorted("StyleMstModel.ReDrive.Common.IHaveThumbnailTexture.get_TextureKey", 0x16FFAA0); }
    /** @rva 0x16FFAA0 slot 7  private string ReDrive.Common.IHaveOriginalTexture.get_TextureKey() { } */
    get_IHaveOriginalTexture$TextureKey(): string { return notPorted("StyleMstModel.ReDrive.Common.IHaveOriginalTexture.get_TextureKey", 0x16FFAA0); }
    /** @rva 0x16FFAA0 slot 9  private string ReDrive.Common.IHaveTexture.get_TextureKey() { } */
    get_IHaveTexture$TextureKey(): string { return notPorted("StyleMstModel.ReDrive.Common.IHaveTexture.get_TextureKey", 0x16FFAA0); }
    /** @rva 0x16FFAA0  public string get_ResourceName() { } */
    get_ResourceName(): string { return this.record.resourceName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5bd9; mov rax, qword ptr [rax + 0xb8]; add rsp, 0x28; ret */ }
    /** @rva 0x1702AB0  public bool get_HaveAnimatedStyle() { } */
    get_HaveAnimatedStyle(): boolean {
        return 4 < this.record.rarity;
    }
    /** @rva 0x1702AF0  public bool get_IsReleased() { } */
    get_IsReleased(): boolean { return notPorted("StyleMstModel.get_IsReleased", 0x1702AF0); }
}
