// Client code (Assembly-CSharp): ReDrive.Battle.QuestBattleUnitProvider, ported 1:1 from the machine code.
import type { int } from "../../runtime";
import type { BattleUnit as NetworkBattleUnit } from "../../Network/Definition/QuestBattle/BattleUnit";
import type { BattleUnit } from "../../ReDriveBattleCore/BattleUnit";
import type { IBattleUnitProvider } from "../../ReDriveBattleCore/IBattleUnitProvider";
import { BattleUnitUtils } from "./BattleUnitUtils";

export class QuestBattleUnitProvider implements IBattleUnitProvider {
    /** 0x10 */ questStageMstId: int = 0;
    /** 0x18 */ allyUnits: NetworkBattleUnit[] = [];

    /** @rva 0xCFA660  public void .ctor(in int questStageMstId, in List<BattleUnit> allyUnits) */
    ctor(questStageMstId: int, allyUnits: NetworkBattleUnit[]): this {
        this.questStageMstId = questStageMstId;
        this.allyUnits = allyUnits;
        return this;
    }
    /** @rva 0xCFA470  public BattleUnit[] CreateAllyBattleUnits() — the position is the unit's battleUnitDataId */
    CreateAllyBattleUnits(): BattleUnit[] {
        const list: BattleUnit[] = []; // CollectionPool<List<BattleUnit>>.Get()
        for (let i = 0; i < this.allyUnits.length; i++) {
            const unit = this.allyUnits[i];
            list.push(BattleUnitUtils.CreateBattleCoreUnitFromNetworkUnit(unit, 0 as BattleUnit["Team"], unit.battleUnitDataId, false));
        }
        return [...list];
    }
    /** @rva 0xCFA620  public BattleUnit[] CreateInitialEnemyBattleUnits() => new BattleUnit[0] */
    CreateInitialEnemyBattleUnits(): BattleUnit[] { return []; }
}
