// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, Nullable, int } from "../runtime";
import type { AdditionalEnemyReferee } from "./AdditionalEnemyReferee";
import type { AffectedUnitNotice } from "./AffectedUnitNotice";
import type { BattleUnit } from "./BattleUnit";
import type { BattleUnitInfo } from "./Command/BattleUnitInfo";
import type { CommandInitialize } from "./Command/CommandInitialize";
import { GameDirectorBase } from "./GameDirectorBase";
import type { GameSituationData } from "./GameSituationData";
import type { LinkHpReferee } from "./LinkHpReferee";
import type { ModeChangeReferee_ModeChangeInfo } from "./ModeChangeReferee";
import type { SpReferee } from "./SpReferee";
import type { TargetReferee } from "./TargetReferee";

// ---- ReDriveBattleCore.EnemyAppearanceGameDirectorBase  (TypeDefIndex 376, public abstract class) ----
export abstract class EnemyAppearanceGameDirectorBase extends GameDirectorBase {
    /** 0x80 protected AdditionalEnemyReferee additionalEnemyReferee */
    additionalEnemyReferee: AdditionalEnemyReferee = null!;
    /** 0x88 protected LinkHpReferee linkHpReferee */
    linkHpReferee: LinkHpReferee = null!;
    get LinkHpReferee(): LinkHpReferee { return this.get_LinkHpReferee(); }
    /** @rva 0x737D70  public LinkHpReferee get_LinkHpReferee() { } */
    get_LinkHpReferee(): LinkHpReferee { return this.linkHpReferee; /* asm: mov rax, qword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x1495ED0  public void .ctor() { } */
    ctor(): this { return notPorted("EnemyAppearanceGameDirectorBase..ctor", 0x1495ED0); }
    /** @rva 0x1495C20 slot 6  public override void OnBattleUnitDeath(int deathObjectId) { } */
    OnBattleUnitDeath(deathObjectId: int): void { return notPorted("EnemyAppearanceGameDirectorBase.OnBattleUnitDeath", 0x1495C20); }
    /** @rva 0x1495D80 slot 18  protected override void UpdateLinkHp(List<AffectedUnitNotice> noticeList, GameDirectorBase gameDirector) { } */
    UpdateLinkHp(noticeList: List<AffectedUnitNotice>, gameDirector: GameDirectorBase): void { return notPorted("EnemyAppearanceGameDirectorBase.UpdateLinkHp", 0x1495D80); }
    /** @rva 0x1495270 slot 7  protected override void CheckMainTargetEnemyDead(BattleUnit deathUnit) { } */
    CheckMainTargetEnemyDead(deathUnit: BattleUnit): void { return notPorted("EnemyAppearanceGameDirectorBase.CheckMainTargetEnemyDead", 0x1495270); }
    /** @rva 0x1495050 slot 16  protected override void CheckBattleFinishAfterAct() { } */
    CheckBattleFinishAfterAct(): void { return notPorted("EnemyAppearanceGameDirectorBase.CheckBattleFinishAfterAct", 0x1495050); }
    /** @rva 0x14952B0 slot 11  protected override CommandInitialize CreateCommandInitialize(BattleUnitInfo[] battleUnitInfoArray, TargetReferee targetReferee, SpReferee spReferee, GameSituationData gameSituationData) { } */
    CreateCommandInitialize(battleUnitInfoArray: BattleUnitInfo[], targetReferee: TargetReferee, spReferee: SpReferee, gameSituationData: GameSituationData): CommandInitialize { return notPorted("EnemyAppearanceGameDirectorBase.CreateCommandInitialize", 0x14952B0); }
    /** @rva 0x14956F0  public void ModeChangeEnemyBattleUnit(BattleUnit oldUnit, ModeChangeReferee.ModeChangeInfo modeChangeInfo) { } */
    ModeChangeEnemyBattleUnit(oldUnit: BattleUnit, modeChangeInfo: ModeChangeReferee_ModeChangeInfo): void { return notPorted("EnemyAppearanceGameDirectorBase.ModeChangeEnemyBattleUnit", 0x14956F0); }
    /** @rva 0x1494C80  protected void AddEnemyBattleUnit(BattleUnit enemyBattleUnit, bool withStoreCommand = False, bool isInitializedHpLink = False) { } */
    AddEnemyBattleUnit(enemyBattleUnit: BattleUnit, withStoreCommand?: boolean /* = False */, isInitializedHpLink?: boolean /* = False */): void { return notPorted("EnemyAppearanceGameDirectorBase.AddEnemyBattleUnit", 0x1494C80); }
    /** @rva 0x14953F0  public List<BattleUnit> GetSummonedUnitList(List<int> summonIdList) { } */
    GetSummonedUnitList(summonIdList: List<int>): List<BattleUnit> { return notPorted("EnemyAppearanceGameDirectorBase.GetSummonedUnitList", 0x14953F0); }
    /** @rva 0x14956C0  public void InitLinkHp(int questStageMstId, int currentWave, List<BattleUnit> enemyUnitList, Nullable<int> initialLinkHp) { } */
    InitLinkHp(questStageMstId: int, currentWave: int, enemyUnitList: List<BattleUnit>, initialLinkHp: Nullable<int>): void { return notPorted("EnemyAppearanceGameDirectorBase.InitLinkHp", 0x14956C0); }
    /** @rva 0x1495D60  private void <OnBattleUnitDeath>b__5_0(BattleUnit unit) { } */
    $OnBattleUnitDeath$b__5_0(unit: BattleUnit): void { return notPorted("EnemyAppearanceGameDirectorBase.<OnBattleUnitDeath>b__5_0", 0x1495D60); }
}
