// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, List, Nullable, int } from "../runtime";
import type { LinkHpType } from "../Network/Definition/QuestOutGame/LinkHpType";
import type { AffectedUnitNotice } from "./AffectedUnitNotice";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";

// ---- ReDriveBattleCore.LinkHpReferee  (TypeDefIndex 431, public class) ----
export class LinkHpReferee {
    /** 0x0 private static readonly int MaxNormalLinkHp */
    static MaxNormalLinkHp: int = 0;
    /** 0x10 private LinkHpType linkHpType */
    linkHpType: LinkHpType = 0 as LinkHpType;
    /** 0x18 private string linkHpName */
    linkHpName: string = null!;
    /** 0x20 private int currentLinkHp */
    currentLinkHp: int = 0;
    /** 0x24 private int maxLinkHp */
    maxLinkHp: int = 0;
    get LinkHpType(): LinkHpType { return this.get_LinkHpType(); }
    get LinkHpName(): string { return this.get_LinkHpName(); }
    get CurrentLinkHp(): int { return this.get_CurrentLinkHp(); }
    get MaxLinkHp(): int { return this.get_MaxLinkHp(); }
    /** @rva 0x7364F0  public LinkHpType get_LinkHpType() { } */
    get_LinkHpType(): LinkHpType { return this.linkHpType; /* asm: mov eax, dword ptr [rcx + 0x10]; ret */ }
    /** @rva 0x733E90  public string get_LinkHpName() { } */
    get_LinkHpName(): string { return this.linkHpName; /* asm: mov rax, qword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x75ED70  public int get_CurrentLinkHp() { } */
    get_CurrentLinkHp(): int { return this.currentLinkHp; /* asm: mov eax, dword ptr [rcx + 0x20]; ret */ }
    /** @rva 0x75A830  public int get_MaxLinkHp() { } */
    get_MaxLinkHp(): int { return this.maxLinkHp; /* asm: mov eax, dword ptr [rcx + 0x24]; ret */ }
    /** @rva 0x149F030  public void Init(int questStageMstId, int currentWave, List<BattleUnit> enemyUnitList, Nullable<int> initialLinkHp) { } */
    Init(questStageMstId: int, currentWave: int, enemyUnitList: List<BattleUnit>, initialLinkHp: Nullable<int>): void { return notPorted("LinkHpReferee.Init", 0x149F030); }
    /** @rva 0x149F750  public void UpdateLinkHp(List<AffectedUnitNotice> noticeList, Dictionary<int, BattleUnit> battleUnitDic, List<BattleUnit> enemyUnitList, GameDirectorBase gameDirector) { } */
    UpdateLinkHp(noticeList: List<AffectedUnitNotice>, battleUnitDic: Dictionary<int, BattleUnit>, enemyUnitList: List<BattleUnit>, gameDirector: GameDirectorBase): void { return notPorted("LinkHpReferee.UpdateLinkHp", 0x149F750); }
    /** @rva 0x149EE40  private int CalculateNormalLinkHpDelta(List<AffectedUnitNotice> noticeList, Dictionary<int, BattleUnit> battleUnitDic) { } */
    CalculateNormalLinkHpDelta(noticeList: List<AffectedUnitNotice>, battleUnitDic: Dictionary<int, BattleUnit>): int { return notPorted("LinkHpReferee.CalculateNormalLinkHpDelta", 0x149EE40); }
    /** @rva 0x149EA80  private int CalculateBossLinkHpDelta(List<AffectedUnitNotice> noticeList, Dictionary<int, BattleUnit> battleUnitDic, GameDirectorBase gameDirector) { } */
    CalculateBossLinkHpDelta(noticeList: List<AffectedUnitNotice>, battleUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): int { return notPorted("LinkHpReferee.CalculateBossLinkHpDelta", 0x149EA80); }
    /** @rva 0x149EA00  private void AddLinkHpDelta(int hpDelta) { } */
    AddLinkHpDelta(hpDelta: int): void { return notPorted("LinkHpReferee.AddLinkHpDelta", 0x149EA00); }
    /** @rva 0x149F3A0  private void SyncEnemyHp(List<BattleUnit> enemyUnitList) { } */
    SyncEnemyHp$ListBattleUnit(enemyUnitList: List<BattleUnit>): void { return notPorted("LinkHpReferee.SyncEnemyHp", 0x149F3A0); }
    /** @rva 0x149F4C0  public void SyncEnemyHp(BattleUnit enemyUnit) { } */
    SyncEnemyHp$BattleUnit(enemyUnit: BattleUnit): void { return notPorted("LinkHpReferee.SyncEnemyHp", 0x149F4C0); }
    /** @rva 0x149F4F0  private void UpdateAffectedUnitListIsDeadFlag(List<BattleUnit> enemyUnitList, List<AffectedUnitNotice> affectedUnitNoticeList) { } */
    UpdateAffectedUnitListIsDeadFlag(enemyUnitList: List<BattleUnit>, affectedUnitNoticeList: List<AffectedUnitNotice>): void { return notPorted("LinkHpReferee.UpdateAffectedUnitListIsDeadFlag", 0x149F4F0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x149F7F0  private static void .cctor() { } */
    static cctor(): void { return notPorted("LinkHpReferee..cctor", 0x149F7F0); }
}
