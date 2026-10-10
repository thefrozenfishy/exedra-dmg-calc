// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { EnemyType } from "../../Network/Definition/QuestBattle/EnemyType";
import type { SizeType } from "../../Network/Definition/QuestBattle/SizeType";
import type { EnemyUnlockType } from "../../Network/Definition/QuestOutGame/EnemyUnlockType";
import { MstModelBase } from "./MstModelBase";
import type { EnemyMstRecord } from "../../Network/Definition/QuestOutGame/EnemyMstRecord";

// ---- ReDriveBattleCore.Model.EnemyMstModel  (TypeDefIndex 882, public class) ----
export class EnemyMstModel extends MstModelBase<EnemyMstRecord> {  // implements IHaveThumbnailTexture, IHaveOriginalTexture
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
    ctor$EnemyMstRecord(record: EnemyMstRecord): this { return notPorted("EnemyMstModel..ctor", 0x16D0A90); }
    /** @rva 0x901770  public int get_EnemyMstId() { } */
    get_EnemyMstId(): int { return this.record.enemyMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x901790  public int get_EnemyUniqueId() { } */
    get_EnemyUniqueId(): int { return this.record.enemyUniqueId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x85E540  public string get_EnemyName() { } */
    get_EnemyName(): string { return this.record.name; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x85e556; mov rax, qword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E790  public EnemyType get_EnemyType() { } */
    get_EnemyType(): EnemyType { return this.record.enemyType as EnemyType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7a5; mov eax, dword ptr [rax + 0x28]; add rsp, 0x28; ret */ }
    /** @rva 0xA0E7B0  public SizeType get_SizeType() { } */
    get_SizeType(): SizeType { return this.record.size as SizeType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e7c5; mov eax, dword ptr [rax + 0x2c]; add rsp, 0x28; ret */ }
    /** @rva 0x7F9BC0  public string get_ModelPrefabName() { } */
    get_ModelPrefabName(): string { return this.record.modelPrefabName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x7f9bd6; mov rax, qword ptr [rax + 0x30]; add rsp, 0x28; ret */ }
    /** @rva 0x901750  public string get_IconResourceName() { } */
    get_IconResourceName(): string { return this.record.iconResourceName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901766; mov rax, qword ptr [rax + 0x38]; add rsp, 0x28; ret */ }
    /** @rva 0x16D0AE0  public bool get_CanRotateModel() { } */
    get_CanRotateModel(): boolean { return this.record.canRotateModel; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0af6; movzx eax, byte ptr [rax + 0x51]; add rsp, 0x28; ret */ }
    /** @rva 0x16D0B00  public EnemyUnlockType get_UnlockType() { } */
    get_UnlockType(): EnemyUnlockType { return this.record.unlockType as EnemyUnlockType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b15; mov eax, dword ptr [rax + 0x54]; add rsp, 0x28; ret */ }
    /** @rva 0x16D0B20  public int get_UnlockValue() { } */
    get_UnlockValue(): int { return this.record.unlockValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b35; mov eax, dword ptr [rax + 0x58]; add rsp, 0x28; ret */ }
    /** @rva 0x16CBEB0  public string get_CvCueSheetNameFormat() { } */
    get_CvCueSheetNameFormat(): string { return this.record.cueSheetName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbec6; mov rax, qword ptr [rax + 0x40]; add rsp, 0x28; ret */ }
    /** @rva 0x7F9C00  public string get_AppearEffectPrefabName() { } */
    get_AppearEffectPrefabName(): string { return this.record.appearEffectPrefabName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x7f9c16; mov rax, qword ptr [rax + 0x48]; add rsp, 0x28; ret */ }
    /** @rva 0xAD1CB0  public bool get_IsNoVisualDeath() { } */
    get_IsNoVisualDeath(): boolean { return this.record.isNoVisualDeath; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xad1cc6; movzx eax, byte ptr [rax + 0x70]; add rsp, 0x28; ret */ }
    /** @rva 0x16CFC80 slot 4  private AssetBundleType ReDrive.Common.IHaveThumbnailTexture.get_Type() { } */
    get_IHaveThumbnailTexture$Type(): any /* AssetBundleType */ { return notPorted("EnemyMstModel.ReDrive.Common.IHaveThumbnailTexture.get_Type", 0x16CFC80); }
    /** @rva 0x901750 slot 5  private string ReDrive.Common.IHaveThumbnailTexture.get_TextureKey() { } */
    get_IHaveThumbnailTexture$TextureKey(): string { return notPorted("EnemyMstModel.ReDrive.Common.IHaveThumbnailTexture.get_TextureKey", 0x901750); }
    /** @rva 0x16CFD30 slot 6  private AssetBundleType ReDrive.Common.IHaveOriginalTexture.get_Type() { } */
    get_IHaveOriginalTexture$Type(): any /* AssetBundleType */ { return notPorted("EnemyMstModel.ReDrive.Common.IHaveOriginalTexture.get_Type", 0x16CFD30); }
    /** @rva 0x901750 slot 7  private string ReDrive.Common.IHaveOriginalTexture.get_TextureKey() { } */
    get_IHaveOriginalTexture$TextureKey(): string { return notPorted("EnemyMstModel.ReDrive.Common.IHaveOriginalTexture.get_TextureKey", 0x901750); }
}
