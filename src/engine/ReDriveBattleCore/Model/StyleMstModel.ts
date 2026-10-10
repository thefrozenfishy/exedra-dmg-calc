// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { ElementType } from "../../Network/Definition/Battle/ElementType";
import type { RoleType } from "../../Network/Definition/Battle/RoleType";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.StyleMstModel  (TypeDefIndex 898, public class) ----
export class StyleMstModel extends MstModelBase<any /* StyleMstRecord */> {  // implements IHaveThumbnailTexture, IHaveOriginalTexture, IHaveTexture
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
    /** @rva 0x16D8810  public void .ctor(StyleMstRecord record) { } */
    ctor$StyleMstRecord(record: any /* StyleMstRecord */): this { return notPorted("StyleMstModel..ctor", 0x16D8810); }
    /** @rva 0x901770  public int get_StyleMstId() { } */
    get_StyleMstId(): int { return notPorted("StyleMstModel.get_StyleMstId", 0x901770); }
    /** @rva 0xA0D840  public int get_StyleFigureMstId() { } */
    get_StyleFigureMstId(): int { return notPorted("StyleMstModel.get_StyleFigureMstId", 0xA0D840); }
    /** @rva 0xA0E790  public int get_SpecialAttackMstId() { } */
    get_SpecialAttackMstId(): int { return notPorted("StyleMstModel.get_SpecialAttackMstId", 0xA0E790); }
    /** @rva 0xA0E810  public int get_PassiveSkill1() { } */
    get_PassiveSkill1(): int { return notPorted("StyleMstModel.get_PassiveSkill1", 0xA0E810); }
    /** @rva 0x16CBED0  public int get_LimitBreakPassiveSkill1() { } */
    get_LimitBreakPassiveSkill1(): int { return notPorted("StyleMstModel.get_LimitBreakPassiveSkill1", 0x16CBED0); }
    /** @rva 0x16D31F0  public int get_SubPassiveSkill() { } */
    get_SubPassiveSkill(): int { return notPorted("StyleMstModel.get_SubPassiveSkill", 0x16D31F0); }
    /** @rva 0xA0E7B0  public int get_NormalAttack() { } */
    get_NormalAttack(): int { return notPorted("StyleMstModel.get_NormalAttack", 0xA0E7B0); }
    /** @rva 0x733E90  public int[] get_SkillMstIds() { } */
    get_SkillMstIds(): int[] { return this._SkillMstIds; /* auto-property */ }
    /** @rva 0x7369E0  public int[] get_PassiveSkillMstIds() { } */
    get_PassiveSkillMstIds(): int[] { return this._PassiveSkillMstIds; /* auto-property */ }
    /** @rva 0x85E540  public string get_Name() { } */
    get_Name(): string { return notPorted("StyleMstModel.get_Name", 0x85E540); }
    /** @rva 0xA0E7D0  public int get_Rarity() { } */
    get_Rarity(): int { return notPorted("StyleMstModel.get_Rarity", 0xA0E7D0); }
    /** @rva 0x16D7FB0  public int get_Hp() { } */
    get_Hp(): int { return notPorted("StyleMstModel.get_Hp", 0x16D7FB0); }
    /** @rva 0x9019A0  public int get_Ep() { } */
    get_Ep(): int { return notPorted("StyleMstModel.get_Ep", 0x9019A0); }
    /** @rva 0x901980  public int get_Bp() { } */
    get_Bp(): int { return notPorted("StyleMstModel.get_Bp", 0x901980); }
    /** @rva 0x16D0B00  public int get_Atk() { } */
    get_Atk(): int { return notPorted("StyleMstModel.get_Atk", 0x16D0B00); }
    /** @rva 0x16D0B20  public int get_Def() { } */
    get_Def(): int { return notPorted("StyleMstModel.get_Def", 0x16D0B20); }
    /** @rva 0x16D4340  public int get_Speed() { } */
    get_Speed(): int { return notPorted("StyleMstModel.get_Speed", 0x16D4340); }
    /** @rva 0x16D4DE0  public int get_CriticalRate() { } */
    get_CriticalRate(): int { return notPorted("StyleMstModel.get_CriticalRate", 0x16D4DE0); }
    /** @rva 0x16D4360  public int get_CriticalDamageRate() { } */
    get_CriticalDamageRate(): int { return notPorted("StyleMstModel.get_CriticalDamageRate", 0x16D4360); }
    /** @rva 0x16D4380  public int get_BreakDamageRate() { } */
    get_BreakDamageRate(): int { return notPorted("StyleMstModel.get_BreakDamageRate", 0x16D4380); }
    /** @rva 0x16D8A70  public int get_HealRate() { } */
    get_HealRate(): int { return notPorted("StyleMstModel.get_HealRate", 0x16D8A70); }
    /** @rva 0x16CBE90  public int get_RecoveryEpRate() { } */
    get_RecoveryEpRate(): int { return notPorted("StyleMstModel.get_RecoveryEpRate", 0x16CBE90); }
    /** @rva 0x16D8940  public int get_EffectHitRate() { } */
    get_EffectHitRate(): int { return notPorted("StyleMstModel.get_EffectHitRate", 0x16D8940); }
    /** @rva 0x16D8960  public int get_EffectParryRate() { } */
    get_EffectParryRate(): int { return notPorted("StyleMstModel.get_EffectParryRate", 0x16D8960); }
    /** @rva 0x16D89D0  public int get_FireDamageRate() { } */
    get_FireDamageRate(): int { return notPorted("StyleMstModel.get_FireDamageRate", 0x16D89D0); }
    /** @rva 0x16D88E0  public int get_AquaDamageRate() { } */
    get_AquaDamageRate(): int { return notPorted("StyleMstModel.get_AquaDamageRate", 0x16D88E0); }
    /** @rva 0x16D8A10  public int get_ForestDamageRate() { } */
    get_ForestDamageRate(): int { return notPorted("StyleMstModel.get_ForestDamageRate", 0x16D8A10); }
    /** @rva 0x16D8B10  public int get_LightDamageRate() { } */
    get_LightDamageRate(): int { return notPorted("StyleMstModel.get_LightDamageRate", 0x16D8B10); }
    /** @rva 0x16D8920  public int get_DarkDamageRate() { } */
    get_DarkDamageRate(): int { return notPorted("StyleMstModel.get_DarkDamageRate", 0x16D8920); }
    /** @rva 0x16D8B50  public int get_NeutralDamageRate() { } */
    get_NeutralDamageRate(): int { return notPorted("StyleMstModel.get_NeutralDamageRate", 0x16D8B50); }
    /** @rva 0x16D89F0  public int get_FireResistRate() { } */
    get_FireResistRate(): int { return notPorted("StyleMstModel.get_FireResistRate", 0x16D89F0); }
    /** @rva 0x16D8900  public int get_AquaResistRate() { } */
    get_AquaResistRate(): int { return notPorted("StyleMstModel.get_AquaResistRate", 0x16D8900); }
    /** @rva 0x16D8A30  public int get_ForestResistRate() { } */
    get_ForestResistRate(): int { return notPorted("StyleMstModel.get_ForestResistRate", 0x16D8A30); }
    /** @rva 0x16D8B30  public int get_LightResistRate() { } */
    get_LightResistRate(): int { return notPorted("StyleMstModel.get_LightResistRate", 0x16D8B30); }
    /** @rva 0x16D5B80  public int get_DarkResistRate() { } */
    get_DarkResistRate(): int { return notPorted("StyleMstModel.get_DarkResistRate", 0x16D5B80); }
    /** @rva 0x16D5BA0  public int get_NeutralResistRate() { } */
    get_NeutralResistRate(): int { return notPorted("StyleMstModel.get_NeutralResistRate", 0x16D5BA0); }
    /** @rva 0x16D8B70  public DateTimeOffset get_ReleaseTime() { } */
    get_ReleaseTime(): any /* DateTimeOffset */ { return notPorted("StyleMstModel.get_ReleaseTime", 0x16D8B70); }
    /** @rva 0x16D8980  public ElementType get_Element() { } */
    get_Element(): ElementType { return notPorted("StyleMstModel.get_Element", 0x16D8980); }
    /** @rva 0x16D8BA0  public RoleType get_Role() { } */
    get_Role(): RoleType { return notPorted("StyleMstModel.get_Role", 0x16D8BA0); }
    /** @rva 0x16D8800 slot 4  private AssetBundleType ReDrive.Common.IHaveThumbnailTexture.get_Type() { } */
    get_IHaveThumbnailTexture$Type(): any /* AssetBundleType */ { return notPorted("StyleMstModel.ReDrive.Common.IHaveThumbnailTexture.get_Type", 0x16D8800); }
    /** @rva 0x16D87E0 slot 6  private AssetBundleType ReDrive.Common.IHaveOriginalTexture.get_Type() { } */
    get_IHaveOriginalTexture$Type(): any /* AssetBundleType */ { return notPorted("StyleMstModel.ReDrive.Common.IHaveOriginalTexture.get_Type", 0x16D87E0); }
    /** @rva 0x16D87F0 slot 8  private AssetBundleType ReDrive.Common.IHaveTexture.get_Type() { } */
    get_IHaveTexture$Type(): any /* AssetBundleType */ { return notPorted("StyleMstModel.ReDrive.Common.IHaveTexture.get_Type", 0x16D87F0); }
    /** @rva 0x16D5BC0 slot 5  private string ReDrive.Common.IHaveThumbnailTexture.get_TextureKey() { } */
    get_IHaveThumbnailTexture$TextureKey(): string { return notPorted("StyleMstModel.ReDrive.Common.IHaveThumbnailTexture.get_TextureKey", 0x16D5BC0); }
    /** @rva 0x16D5BC0 slot 7  private string ReDrive.Common.IHaveOriginalTexture.get_TextureKey() { } */
    get_IHaveOriginalTexture$TextureKey(): string { return notPorted("StyleMstModel.ReDrive.Common.IHaveOriginalTexture.get_TextureKey", 0x16D5BC0); }
    /** @rva 0x16D5BC0 slot 9  private string ReDrive.Common.IHaveTexture.get_TextureKey() { } */
    get_IHaveTexture$TextureKey(): string { return notPorted("StyleMstModel.ReDrive.Common.IHaveTexture.get_TextureKey", 0x16D5BC0); }
    /** @rva 0x16D5BC0  public string get_ResourceName() { } */
    get_ResourceName(): string { return notPorted("StyleMstModel.get_ResourceName", 0x16D5BC0); }
    /** @rva 0x16D8A50  public bool get_HaveAnimatedStyle() { } */
    get_HaveAnimatedStyle(): boolean { return notPorted("StyleMstModel.get_HaveAnimatedStyle", 0x16D8A50); }
    /** @rva 0x16D8A90  public bool get_IsReleased() { } */
    get_IsReleased(): boolean { return notPorted("StyleMstModel.get_IsReleased", 0x16D8A90); }
}
