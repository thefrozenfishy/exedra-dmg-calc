// Server data class (outside ReDriveBattleCore): Network.Definition.QuestBattle.BattleUnit (TypeDefIndex 3227), the
// unit the server sends for a battle (stats already computed server-side). The app builds it from its own stat
// calculation (src/engine/adapter); ReDrive.Battle.BattleUnitUtils turns it into a ReDriveBattleCore.BattleUnit.
import type { int } from "../../../runtime";
import type { AttackInfo } from "./AttackInfo";
import type { PassiveSkillInfo } from "./PassiveSkillInfo";

export class LeaderSkillInfo { /** 0x10 */ leaderSkillMstId: int = 0; /** 0x14 */ level: int = 0; }
export class TalismanParamInfo { /** 0x10 */ talismanParamMstId: int = 0; }

export class BattleUnit {
    /** 0x10 */ battleUnitDataId: int = 0;
    /** 0x14 */ battleUnitType: int = 0;
    /** 0x18 */ battleUnitMstId: int = 0;
    /** 0x1C */ styleMstId: int = 0;
    /** 0x20 */ levelReactionValue: int = 0;
    /** 0x24 */ levelReactionBreakDamageValue: int = 0;
    /** 0x28 */ levelReactionSlipDamageValue: int = 0;
    /** 0x2C */ maxHp: int = 0;
    /** 0x30 */ atk: int = 0;
    /** 0x34 */ def: int = 0;
    /** 0x38 */ speed: int = 0;
    /** 0x3C */ criticalRate: int = 0;
    /** 0x40 */ criticalDamageRate: int = 0;
    /** 0x44 */ breakDamageRate: int = 0;
    /** 0x48 */ healRate: int = 0;
    /** 0x4C */ recoveryEpRate: int = 0;
    /** 0x50 */ effectHitRate: int = 0;
    /** 0x54 */ effectParryRate: int = 0;
    /** 0x58 */ fireDamageRate: int = 0;
    /** 0x5C */ aquaDamageRate: int = 0;
    /** 0x60 */ forestDamageRate: int = 0;
    /** 0x64 */ lightDamageRate: int = 0;
    /** 0x68 */ darkDamageRate: int = 0;
    /** 0x6C */ neutralDamageRate: int = 0;
    /** 0x70 */ fireResistRate: int = 0;
    /** 0x74 */ aquaResistRate: int = 0;
    /** 0x78 */ forestResistRate: int = 0;
    /** 0x7C */ lightResistRate: int = 0;
    /** 0x80 */ darkResistRate: int = 0;
    /** 0x84 */ neutralResistRate: int = 0;
    /** 0x88 */ normalAttackInfo: AttackInfo | null = null;
    /** 0x90 */ attackInfoList: AttackInfo[] = [];
    /** 0x98 */ specialAttackInfo: AttackInfo | null = null;
    /** 0xA0 */ passiveSkillInfoList: PassiveSkillInfo[] = [];
    /** 0xA8 */ leaderSkillInfo: LeaderSkillInfo | null = null;
    /** 0xB0 */ talismanParamInfoList: TalismanParamInfo[] = [];
}
