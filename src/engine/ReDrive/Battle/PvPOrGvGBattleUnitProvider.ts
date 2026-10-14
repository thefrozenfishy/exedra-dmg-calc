// Client code (Assembly-CSharp, outside ReDriveBattleCore): ReDrive.Battle.PvPOrGvGBattleUnitProvider, ported 1:1 from
// the machine code. Ally ids are 1..n, enemy ids are -1..-n; the position is the index + 1.
import type { int } from "../../runtime";
import type { BattleUnit as NetworkBattleUnit } from "../../Network/Definition/QuestBattle/BattleUnit";
import type { BattleUnit, BattleUnit_TeamType } from "../../ReDriveBattleCore/BattleUnit";
import type { IBattleUnitProvider } from "../../ReDriveBattleCore/IBattleUnitProvider";
import { BattleUnitUtils } from "./BattleUnitUtils";

export class PvPOrGvGBattleUnitProvider implements IBattleUnitProvider {
    /** 0x10 */ enemyBattleUnitArray: NetworkBattleUnit[] = [];
    /** 0x18 */ allyBattleUnitArray: NetworkBattleUnit[] = [];

    /** @rva 0xCF4790  public void .ctor(BattleUnit[] allyBattleUnitArray, BattleUnit[] enemyBattleUnitArray) */
    ctor(allyBattleUnitArray: NetworkBattleUnit[], enemyBattleUnitArray: NetworkBattleUnit[]): this {
        this.allyBattleUnitArray = allyBattleUnitArray;
        this.enemyBattleUnitArray = enemyBattleUnitArray;
        return this;
    }
    /** @rva 0xCFA330  public BattleUnit[] CreateAllyBattleUnits() */
    CreateAllyBattleUnits(): BattleUnit[] {
        return PvPOrGvGBattleUnitProvider.CreateBattleUnits(this.allyBattleUnitArray, 0 as BattleUnit_TeamType);
    }
    /** @rva 0xCFA460  public BattleUnit[] CreateInitialEnemyBattleUnits() */
    CreateInitialEnemyBattleUnits(): BattleUnit[] {
        return PvPOrGvGBattleUnitProvider.CreateBattleUnits(this.enemyBattleUnitArray, 1 as BattleUnit_TeamType);
    }
    /** @rva 0xCFA340  private static BattleUnit[] CreateBattleUnits(BattleUnit[] source, BattleUnit.TeamType teamType) */
    static CreateBattleUnits(source: NetworkBattleUnit[], teamType: BattleUnit_TeamType): BattleUnit[] {
        const array: BattleUnit[] = new Array(source.length);
        for (let i = 0; i < source.length; i++) {
            const id: int = teamType !== 0 ? -(i + 1) : i + 1;
            array[i] = BattleUnitUtils.CreateBattleCoreUnitFromNetworkUnitIdOverride(source[i], id, teamType, i + 1, true);
        }
        return array;
    }
}
