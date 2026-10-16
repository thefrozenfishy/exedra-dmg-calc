// Network type (outside ReDriveBattleCore): Network.Definition.SoloRaid.BattleInfo (TypeDefIndex 2061), fields from dump.cs.
import type { int, long, double } from "../../../runtime";
import type { EnemyInfo } from "./EnemyInfo";

export class BattleInfo {
    /** 0x10 private int <wave>k__BackingField (0 = a new battle, otherwise a restart from this wave) */
    wave: int = 0;
    /** 0x18 private EnemyInfo[] <enemyInfoList>k__BackingField */
    enemyInfoList: EnemyInfo[] = null!;
    /** 0x20 private long <enemyLinkHp>k__BackingField */
    enemyLinkHp: long = 0;
    /** 0x28 private int <enemyCountDownNum>k__BackingField */
    enemyCountDownNum: int = 0;
    /** 0x2C private int <enemyCountDownDamage>k__BackingField */
    enemyCountDownDamage: int = 0;
    /** 0x30 private bool <isSeasonBuffActive>k__BackingField */
    isSeasonBuffActive: boolean = false;
    /** 0x34 private int <seasonBuffPoint>k__BackingField */
    seasonBuffPoint: int = 0;
    /** 0x38 private double <seasonBuffTurnGaugeValue>k__BackingField */
    seasonBuffTurnGaugeValue: double = 0;
    /** 0x40 private int <nextEnemyIndex>k__BackingField */
    nextEnemyIndex: int = 0;
}
