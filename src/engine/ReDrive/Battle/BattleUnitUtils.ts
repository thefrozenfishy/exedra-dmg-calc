// Client code (Assembly-CSharp, outside ReDriveBattleCore): ReDrive.Battle.BattleUnitUtils, ported 1:1 from the
// machine code (the Ghidra decompile covers ReDriveBattleCore only). Turns the server's unit into a core BattleUnit.
import type { int } from "../../runtime";
import type { BattleUnit as NetworkBattleUnit } from "../../Network/Definition/QuestBattle/BattleUnit";
import { BattleUnit } from "../../ReDriveBattleCore/BattleUnit";
import type { BattleUnit_TeamType } from "../../ReDriveBattleCore/BattleUnit";
import { CharacterParameter } from "../../ReDriveBattleCore/CharacterParameter";
import { ElementDamageRate } from "../../ReDriveBattleCore/ElementDamageRate";
import { ElementResistRate } from "../../ReDriveBattleCore/ElementResistRate";
import { BattleMstReaderBase } from "../../ReDriveBattleCore/Reader/BattleMstReaderBase";
import { StyleMstModel } from "../../ReDriveBattleCore/Model/StyleMstModel";
import type { StyleMstRecord } from "../../Network/Definition/Style/StyleMstRecord";
import type { ElementType } from "../../Network/Definition/Battle/ElementType";

export class BattleUnitUtils {
    /** @rva 0xD24F30  public static BattleUnit CreateBattleCoreUnitFromNetworkUnit(BattleUnit networkUnit, BattleUnit.TeamType teamType, int positionId, bool isPvpOrGvg) */
    static CreateBattleCoreUnitFromNetworkUnit(networkUnit: NetworkBattleUnit, teamType: BattleUnit_TeamType, positionId: int, isPvpOrGvg: boolean = false): BattleUnit {
        const mstId = networkUnit.battleUnitMstId;
        const id = networkUnit.battleUnitDataId;
        const parameter = BattleUnitUtils.CreateCharParamFromNetworkUnit(networkUnit, false); // isPvpOrGvg: false is passed (asm: xor edx, edx)
        const activeSkillMstIds = networkUnit.attackInfoList.map(info => info.skillMstId); // <>c.b__1_0
        const specialAttackMstId = networkUnit.specialAttackInfo!.skillMstId;
        const normalAttackMstId = networkUnit.normalAttackInfo != null ? networkUnit.normalAttackInfo.skillMstId : 0;
        return new BattleUnit().ctor$int_int_TeamType_CharacterParameter_int_int_int_int_PassiveSkillInfo(id, mstId, teamType, parameter,
            positionId, activeSkillMstIds, specialAttackMstId, normalAttackMstId, networkUnit.passiveSkillInfoList);
    }

    /** @rva 0xD25170  private static CharacterParameter CreateCharParamFromNetworkUnit(BattleUnit networkUnit, bool isPvpOrGvg) */
    static CreateCharParamFromNetworkUnit(networkUnit: NetworkBattleUnit, isPvpOrGvg: boolean): CharacterParameter {
        // AriesSingleton<StyleMstModelRepository>.Instance.GetByKey(styleMstId): the client's style repository (same model)
        const styleMst = BattleMstReaderBase.get_Instance<StyleMstModel, StyleMstRecord, int>(StyleMstModel).GetModelByKey(networkUnit.styleMstId);
        const n = networkUnit;
        const damageRates = [
            new ElementDamageRate().ctor$ElementType_int(1 as ElementType, n.fireDamageRate),
            new ElementDamageRate().ctor$ElementType_int(2 as ElementType, n.aquaDamageRate),
            new ElementDamageRate().ctor$ElementType_int(3 as ElementType, n.forestDamageRate),
            new ElementDamageRate().ctor$ElementType_int(4 as ElementType, n.lightDamageRate),
            new ElementDamageRate().ctor$ElementType_int(5 as ElementType, n.darkDamageRate),
            new ElementDamageRate().ctor$ElementType_int(6 as ElementType, n.neutralDamageRate),
        ];
        const resistRates = [
            new ElementResistRate().ctor$ElementType_int(1 as ElementType, n.fireResistRate),
            new ElementResistRate().ctor$ElementType_int(2 as ElementType, n.aquaResistRate),
            new ElementResistRate().ctor$ElementType_int(3 as ElementType, n.forestResistRate),
            new ElementResistRate().ctor$ElementType_int(4 as ElementType, n.lightResistRate),
            new ElementResistRate().ctor$ElementType_int(5 as ElementType, n.darkResistRate),
            new ElementResistRate().ctor$ElementType_int(6 as ElementType, n.neutralResistRate),
        ];
        return new CharacterParameter().ctor$int_int_int_int_int_int_int_int_int_ElementDamageRate_ElementResistRate_int_int_int_int_StyleMstModel_bool(
            n.atk, n.def, n.criticalRate, n.criticalDamageRate, n.maxHp, n.speed, n.healRate, n.effectHitRate, n.effectParryRate,
            damageRates, resistRates, n.levelReactionBreakDamageValue, n.levelReactionSlipDamageValue, n.breakDamageRate, n.recoveryEpRate,
            styleMst, isPvpOrGvg);
    }
}
