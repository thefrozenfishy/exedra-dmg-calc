// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { QuestEnemyAppearanceMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyAppearanceMstRecord";
import type { QuestEnemyWaveMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyWaveMstRecord";
import { AffectedUnitNotice } from "./AffectedUnitNotice";
import { SoloGameDirectorBase } from "./SoloGameDirectorBase";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import { QuestEnemyAppearanceMstModel } from "./Model/QuestEnemyAppearanceMstModel";
import { QuestEnemyWaveMstModel } from "./Model/QuestEnemyWaveMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { clamp, notPorted } from "../runtime";
import type { Dictionary, List, Nullable, int } from "../runtime";
import type { LinkHpType } from "../Network/Definition/QuestOutGame/LinkHpType";

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
    Init(questStageMstId: int, currentWave: int, enemyUnitList: List<BattleUnit>, initialLinkHp: Nullable<int>): void {
        const wave = BattleMstReaderBase.get_Instance<QuestEnemyWaveMstModel, QuestEnemyWaveMstRecord, int>(QuestEnemyWaveMstModel)
            .GetModel(r => r.questStageMstId === questStageMstId && r.wave === currentWave); // <>c__DisplayClass13_0.b__0
        if (wave == null || wave.LinkHpType === 0) {
            this.linkHpType = 0 as LinkHpType;
            this.linkHpName = "";
            this.currentLinkHp = 0;
            return;
        }
        this.linkHpType = wave.LinkHpType;
        this.linkHpName = wave.LinkHpName;
        const type = wave.LinkHpType;
        if (type === 1) {
            this.currentLinkHp = initialLinkHp != null ? initialLinkHp : LinkHpReferee.MaxNormalLinkHp;
            this.maxLinkHp = LinkHpReferee.MaxNormalLinkHp;
        } else if (type === 2) {
            const main = BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel)
                .GetModel(m => m.questStageMstId === questStageMstId && m.wave === currentWave && m.isMainTargetEnemy); // <>c__DisplayClass13_0.b__1
            this.currentLinkHp = initialLinkHp != null ? initialLinkHp : main.HP;
            this.maxLinkHp = main.HP;
            this.SyncEnemyHp$ListBattleUnit(enemyUnitList);
        }
    }
    /** @rva 0x149F750  public void UpdateLinkHp(List<AffectedUnitNotice> noticeList, Dictionary<int, BattleUnit> battleUnitDic, List<BattleUnit> enemyUnitList, GameDirectorBase gameDirector) { } */
    UpdateLinkHp(noticeList: List<AffectedUnitNotice>, battleUnitDic: Dictionary<int, BattleUnit>, enemyUnitList: List<BattleUnit>, gameDirector: GameDirectorBase): void {
        const type = this.linkHpType;
        if (type === 0) return;
        if (type === 1) {
            this.AddLinkHpDelta(this.CalculateNormalLinkHpDelta(noticeList, battleUnitDic));
        } else if (type === 2) {
            this.AddLinkHpDelta(this.CalculateBossLinkHpDelta(noticeList, battleUnitDic, gameDirector));
            this.SyncEnemyHp$ListBattleUnit(enemyUnitList);
            this.UpdateAffectedUnitListIsDeadFlag(enemyUnitList, noticeList); // inlined in the game
        }
    }
    /** @rva 0x149EE40  private int CalculateNormalLinkHpDelta(List<AffectedUnitNotice> noticeList, Dictionary<int, BattleUnit> battleUnitDic) { } */
    CalculateNormalLinkHpDelta(noticeList: List<AffectedUnitNotice>, battleUnitDic: Dictionary<int, BattleUnit>): int {
        let delta = 0;
        if (noticeList == null) return delta;
        for (const notice of noticeList) {
            if (!notice.IsDead) continue;
            const unit = battleUnitDic.get(notice.AffectedUnitId);
            if (unit === undefined) continue;
            if (unit.isCharacter) continue;
            const param = unit.BattleParameter;
            if (param instanceof QuestEnemyAppearanceParameter) delta = delta - param.LinkHpWeight;
        }
        return delta;
    }
    /** @rva 0x149EA80  private int CalculateBossLinkHpDelta(List<AffectedUnitNotice> noticeList, Dictionary<int, BattleUnit> battleUnitDic, GameDirectorBase gameDirector) { } */
    CalculateBossLinkHpDelta(noticeList: List<AffectedUnitNotice>, battleUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): int {
        let delta = 0;
        if (noticeList == null) return delta;
        for (const notice of noticeList) {
            const unit = battleUnitDic.get(notice.AffectedUnitId);
            if (unit === undefined) continue;
            if (unit.isCharacter) continue;
            if (notice.IsReceivedDamage) delta = delta - notice.GetTotalDamageValue(true);
            if (notice.IsReceivedRecovery) delta = delta + notice.RecoveryValue;
        }
        if (!(gameDirector instanceof SoloGameDirectorBase)) return delta;
        for (const unit of battleUnitDic.values()) {
            if (unit.isCharacter) continue;
            const cut = gameDirector.modeChangeReferee.GetNextModeChangeDamageCutDamage(unit, -delta);
            if (-cut !== delta) return -cut;
        }
        return delta;
    }
    /** @rva 0x149EA00  private void AddLinkHpDelta(int hpDelta) { } */
    AddLinkHpDelta(hpDelta: int): void {
        this.currentLinkHp = clamp(this.currentLinkHp + hpDelta, 0, this.maxLinkHp);
    }
    /** @rva 0x149F3A0  private void SyncEnemyHp(List<BattleUnit> enemyUnitList) { } */
    SyncEnemyHp$ListBattleUnit(enemyUnitList: List<BattleUnit>): void {
        if (enemyUnitList == null) return;
        for (const unit of enemyUnitList) {
            if (this.linkHpType !== 2) continue;
            unit.SetHP(this.currentLinkHp);
        }
    }
    /** @rva 0x149F4C0  public void SyncEnemyHp(BattleUnit enemyUnit) { } */
    SyncEnemyHp$BattleUnit(enemyUnit: BattleUnit): void {
        if (this.linkHpType !== 2) return;
        enemyUnit.SetHP(this.currentLinkHp); // inlined in the game
    }
    /** @rva 0x149F4F0  private void UpdateAffectedUnitListIsDeadFlag(List<BattleUnit> enemyUnitList, List<AffectedUnitNotice> affectedUnitNoticeList) { } */
    UpdateAffectedUnitListIsDeadFlag(enemyUnitList: List<BattleUnit>, affectedUnitNoticeList: List<AffectedUnitNotice>): void {
        if (enemyUnitList == null) return;
        for (const unit of enemyUnitList) { // <>c__DisplayClass20_0
            if (!unit.IsDead) continue;
            const notice = affectedUnitNoticeList.find(x => x.AffectedUnitId === unit.Id) ?? null; // b__0
            if (notice != null) {
                if (!notice.IsDead) notice._IsDead = true;
                continue;
            }
            const added = new AffectedUnitNotice().ctor$int(unit.Id);
            added._IsDead = true;
            affectedUnitNoticeList.push(added);
        }
    }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x149F7F0  private static void .cctor() { } */
    static cctor(): void {
        LinkHpReferee.MaxNormalLinkHp = 100;
    }
}

LinkHpReferee.cctor(); // C# static constructor