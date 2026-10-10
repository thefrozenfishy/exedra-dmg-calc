// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { EnemyType } from "../../Network/Definition/QuestBattle/EnemyType";
import type { SizeType } from "../../Network/Definition/QuestBattle/SizeType";
import type { EnemyUnlockType } from "../../Network/Definition/QuestOutGame/EnemyUnlockType";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.EnemyMstModel  (TypeDefIndex 882, public class) ----
export class EnemyMstModel extends MstModelBase<any /* EnemyMstRecord */> {  // implements IHaveThumbnailTexture, IHaveOriginalTexture
    static readonly __interfaces: readonly string[] = ['IHaveThumbnailTexture', 'IHaveOriginalTexture'];
    get EnemyMstId(): int { return this.get_EnemyMstId(); }
    get EnemyUniqueId(): int { return this.get_EnemyUniqueId(); }
    get EnemyName(): string { return this.get_EnemyName(); }
    get EnemyType(): EnemyType { return this.get_EnemyType(); }
    get SizeType(): SizeType { return this.get_SizeType(); }
    get ModelPrefabName(): string { return this.get_ModelPrefabName(); }
    get IconResourceName(): string { return this.get_IconResourceName(); }
    get CanRotateModel(): boolean { return this.get_CanRotateModel(); }
    get UnlockType(): EnemyUnlockType { return this.get_UnlockType(); }
    get UnlockValue(): int { return this.get_UnlockValue(); }
    get CvCueSheetNameFormat(): string { return this.get_CvCueSheetNameFormat(); }
    get AppearEffectPrefabName(): string { return this.get_AppearEffectPrefabName(); }
    get IsNoVisualDeath(): boolean { return this.get_IsNoVisualDeath(); }
    get IHaveThumbnailTexture$Type(): any /* AssetBundleType */ { return this.get_IHaveThumbnailTexture$Type(); }
    get IHaveThumbnailTexture$TextureKey(): string { return this.get_IHaveThumbnailTexture$TextureKey(); }
    get IHaveOriginalTexture$Type(): any /* AssetBundleType */ { return this.get_IHaveOriginalTexture$Type(); }
    get IHaveOriginalTexture$TextureKey(): string { return this.get_IHaveOriginalTexture$TextureKey(); }
    /** @rva 0x16D0A90  public void .ctor(EnemyMstRecord record) { } */
    ctor$EnemyMstRecord(record: any /* EnemyMstRecord */): this { return notPorted("EnemyMstModel..ctor", 0x16D0A90); }
    /** @rva 0x901770  public int get_EnemyMstId() { } */
    get_EnemyMstId(): int { return notPorted("EnemyMstModel.get_EnemyMstId", 0x901770); }
    /** @rva 0x901790  public int get_EnemyUniqueId() { } */
    get_EnemyUniqueId(): int { return notPorted("EnemyMstModel.get_EnemyUniqueId", 0x901790); }
    /** @rva 0x85E540  public string get_EnemyName() { } */
    get_EnemyName(): string { return notPorted("EnemyMstModel.get_EnemyName", 0x85E540); }
    /** @rva 0xA0E790  public EnemyType get_EnemyType() { } */
    get_EnemyType(): EnemyType { return notPorted("EnemyMstModel.get_EnemyType", 0xA0E790); }
    /** @rva 0xA0E7B0  public SizeType get_SizeType() { } */
    get_SizeType(): SizeType { return notPorted("EnemyMstModel.get_SizeType", 0xA0E7B0); }
    /** @rva 0x7F9BC0  public string get_ModelPrefabName() { } */
    get_ModelPrefabName(): string { return notPorted("EnemyMstModel.get_ModelPrefabName", 0x7F9BC0); }
    /** @rva 0x901750  public string get_IconResourceName() { } */
    get_IconResourceName(): string { return notPorted("EnemyMstModel.get_IconResourceName", 0x901750); }
    /** @rva 0x16D0AE0  public bool get_CanRotateModel() { } */
    get_CanRotateModel(): boolean { return notPorted("EnemyMstModel.get_CanRotateModel", 0x16D0AE0); }
    /** @rva 0x16D0B00  public EnemyUnlockType get_UnlockType() { } */
    get_UnlockType(): EnemyUnlockType { return notPorted("EnemyMstModel.get_UnlockType", 0x16D0B00); }
    /** @rva 0x16D0B20  public int get_UnlockValue() { } */
    get_UnlockValue(): int { return notPorted("EnemyMstModel.get_UnlockValue", 0x16D0B20); }
    /** @rva 0x16CBEB0  public string get_CvCueSheetNameFormat() { } */
    get_CvCueSheetNameFormat(): string { return notPorted("EnemyMstModel.get_CvCueSheetNameFormat", 0x16CBEB0); }
    /** @rva 0x7F9C00  public string get_AppearEffectPrefabName() { } */
    get_AppearEffectPrefabName(): string { return notPorted("EnemyMstModel.get_AppearEffectPrefabName", 0x7F9C00); }
    /** @rva 0xAD1CB0  public bool get_IsNoVisualDeath() { } */
    get_IsNoVisualDeath(): boolean { return notPorted("EnemyMstModel.get_IsNoVisualDeath", 0xAD1CB0); }
    /** @rva 0x16CFC80 slot 4  private AssetBundleType ReDrive.Common.IHaveThumbnailTexture.get_Type() { } */
    get_IHaveThumbnailTexture$Type(): any /* AssetBundleType */ { return notPorted("EnemyMstModel.ReDrive.Common.IHaveThumbnailTexture.get_Type", 0x16CFC80); }
    /** @rva 0x901750 slot 5  private string ReDrive.Common.IHaveThumbnailTexture.get_TextureKey() { } */
    get_IHaveThumbnailTexture$TextureKey(): string { return notPorted("EnemyMstModel.ReDrive.Common.IHaveThumbnailTexture.get_TextureKey", 0x901750); }
    /** @rva 0x16CFD30 slot 6  private AssetBundleType ReDrive.Common.IHaveOriginalTexture.get_Type() { } */
    get_IHaveOriginalTexture$Type(): any /* AssetBundleType */ { return notPorted("EnemyMstModel.ReDrive.Common.IHaveOriginalTexture.get_Type", 0x16CFD30); }
    /** @rva 0x901750 slot 7  private string ReDrive.Common.IHaveOriginalTexture.get_TextureKey() { } */
    get_IHaveOriginalTexture$TextureKey(): string { return notPorted("EnemyMstModel.ReDrive.Common.IHaveOriginalTexture.get_TextureKey", 0x901750); }
}
