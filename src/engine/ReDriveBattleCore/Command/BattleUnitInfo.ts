// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { PassiveSkillDetailMstRecord } from "../../Network/Definition/Skill/PassiveSkillDetailMstRecord";
import { SkillDetailMstReader } from "../Reader/SkillDetailMstReader";
import { PassiveSkillDetailMstModel } from "../Model/PassiveSkillDetailMstModel";
import { BattleMstReaderBase } from "../Reader/BattleMstReaderBase";
import { BattleUnitStructure, BattleUnitStructure_PassiveSkillInfo } from "./BattleUnitStructure";
import { QuestEnemyAppearanceParameter } from "../QuestEnemyAppearanceParameter";
import { CharacterParameter } from "../CharacterParameter";
import { indexHint, notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { BattleUnit, BattleUnit_TeamType } from "../BattleUnit";
import type { List } from "../../runtime";

// ---- ReDriveBattleCore.Command.BattleUnitInfo  (TypeDefIndex 967, public class) ----
export class BattleUnitInfo {
    /** 0x10 private int <BattleUnitId>k__BackingField */
    _BattleUnitId: int = 0;
    /** 0x14 private int <Position>k__BackingField */
    _Position: int = 0;
    /** 0x18 private BattleUnitStructure <Structure>k__BackingField */
    _Structure: BattleUnitStructure = null!;
    /** 0x20 private int <QuestEnemyAppearanceMstId>k__BackingField */
    _QuestEnemyAppearanceMstId: int = 0;
    /** 0x24 private BattleUnit.TeamType <Team>k__BackingField */
    _Team: BattleUnit_TeamType = 0 as BattleUnit_TeamType;
    /** 0x28 private int <HP>k__BackingField */
    _HP: int = 0;
    /** 0x2C private int <EP>k__BackingField */
    _EP: int = 0;
    /** 0x30 private int <BP>k__BackingField */
    _BP: int = 0;
    /** 0x34 private bool <ShowCountPointAll>k__BackingField */
    _ShowCountPointAll: boolean = false;
    /** 0x38 private int <BreakPoint>k__BackingField */
    _BreakPoint: int = 0;
    /** 0x3C private int <BreakedDamageReceiveRate>k__BackingField */
    _BreakedDamageReceiveRate: int = 0;
    get BattleUnitId(): int { return this.get_BattleUnitId(); }
    set BattleUnitId(v: int) { this.set_BattleUnitId(v); }
    get Position(): int { return this.get_Position(); }
    set Position(v: int) { this.set_Position(v); }
    get Structure(): BattleUnitStructure { return this.get_Structure(); }
    set Structure(v: BattleUnitStructure) { this.set_Structure(v); }
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    set QuestEnemyAppearanceMstId(v: int) { this.set_QuestEnemyAppearanceMstId(v); }
    get Team(): BattleUnit_TeamType { return this.get_Team(); }
    set Team(v: BattleUnit_TeamType) { this.set_Team(v); }
    get HP(): int { return this.get_HP(); }
    set HP(v: int) { this.set_HP(v); }
    get EP(): int { return this.get_EP(); }
    set EP(v: int) { this.set_EP(v); }
    get BP(): int { return this.get_BP(); }
    set BP(v: int) { this.set_BP(v); }
    get ShowCountPointAll(): boolean { return this.get_ShowCountPointAll(); }
    set ShowCountPointAll(v: boolean) { this.set_ShowCountPointAll(v); }
    get BreakPoint(): int { return this.get_BreakPoint(); }
    set BreakPoint(v: int) { this.set_BreakPoint(v); }
    get BreakedDamageReceiveRate(): int { return this.get_BreakedDamageReceiveRate(); }
    set BreakedDamageReceiveRate(v: int) { this.set_BreakedDamageReceiveRate(v); }
    get IsCharacter(): boolean { return this.get_IsCharacter(); }
    /** @rva 0x7364F0  public int get_BattleUnitId() { } */
    get_BattleUnitId(): int { return this._BattleUnitId; /* auto-property */ }
    /** @rva 0x739D00  public void set_BattleUnitId(int value) { } */
    set_BattleUnitId(value: int): void { this._BattleUnitId = value; /* auto-property */ }
    /** @rva 0x803350  public int get_Position() { } */
    get_Position(): int { return this._Position; /* auto-property */ }
    /** @rva 0x803540  public void set_Position(int value) { } */
    set_Position(value: int): void { this._Position = value; /* auto-property */ }
    /** @rva 0x733E90  public BattleUnitStructure get_Structure() { } */
    get_Structure(): BattleUnitStructure { return this._Structure; /* auto-property */ }
    /** @rva 0x736AB0  public void set_Structure(BattleUnitStructure value) { } */
    set_Structure(value: BattleUnitStructure): void { this._Structure = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this._QuestEnemyAppearanceMstId; /* auto-property */ }
    /** @rva 0x8A2230  public void set_QuestEnemyAppearanceMstId(int value) { } */
    set_QuestEnemyAppearanceMstId(value: int): void { this._QuestEnemyAppearanceMstId = value; /* auto-property */ }
    /** @rva 0x75A830  public BattleUnit.TeamType get_Team() { } */
    get_Team(): BattleUnit_TeamType { return this._Team; /* auto-property */ }
    /** @rva 0x75A840  public void set_Team(BattleUnit.TeamType value) { } */
    set_Team(value: BattleUnit_TeamType): void { this._Team = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_HP() { } */
    get_HP(): int { return this._HP; /* auto-property */ }
    /** @rva 0x8A2250  public void set_HP(int value) { } */
    set_HP(value: int): void { this._HP = value; /* auto-property */ }
    /** @rva 0x85E530  public int get_EP() { } */
    get_EP(): int { return this._EP; /* auto-property */ }
    /** @rva 0x8A2260  public void set_EP(int value) { } */
    set_EP(value: int): void { this._EP = value; /* auto-property */ }
    /** @rva 0x75ED60  public int get_BP() { } */
    get_BP(): int { return this._BP; /* auto-property */ }
    /** @rva 0x8745A0  public void set_BP(int value) { } */
    set_BP(value: int): void { this._BP = value; /* auto-property */ }
    /** @rva 0x9017B0  public bool get_ShowCountPointAll() { } */
    get_ShowCountPointAll(): boolean { return this._ShowCountPointAll; /* auto-property */ }
    /** @rva 0x9017C0  public void set_ShowCountPointAll(bool value) { } */
    set_ShowCountPointAll(value: boolean): void { this._ShowCountPointAll = value; /* auto-property */ }
    /** @rva 0x75EDA0  public int get_BreakPoint() { } */
    get_BreakPoint(): int { return this._BreakPoint; /* auto-property */ }
    /** @rva 0x8A22B0  public void set_BreakPoint(int value) { } */
    set_BreakPoint(value: int): void { this._BreakPoint = value; /* auto-property */ }
    /** @rva 0x8F3EF0  public int get_BreakedDamageReceiveRate() { } */
    get_BreakedDamageReceiveRate(): int { return this._BreakedDamageReceiveRate; /* auto-property */ }
    /** @rva 0x901820  public void set_BreakedDamageReceiveRate(int value) { } */
    set_BreakedDamageReceiveRate(value: int): void { this._BreakedDamageReceiveRate = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17F74F0  public void .ctor(BattleUnit unit) { } */
    ctor$BattleUnit(unit: BattleUnit): this {
        this._BattleUnitId = unit.Id;
        this._Position = unit.PositionId;
        this._Team = unit.Team;
        this._Position = unit.PositionId; // stored twice in the game
        this._HP = unit.HP;
        this._EP = unit.EP;
        this._BP = unit.BP;
        this._BreakPoint = unit.BreakPoint.PointValue;
        this._BreakedDamageReceiveRate = unit.BreakedDamageReceiveRate;
        const battleParameter = unit.BattleParameter;
        if (!unit.isCharacter) {
            if (!unit.IsEnemy) throw new Error(`NotImplementedException: what type of unit ${unit.Id}`);
            const param = unit.BattleParameter;
            if (!(param instanceof QuestEnemyAppearanceParameter)) throw new TypeError("InvalidCastException");
            this._QuestEnemyAppearanceMstId = param.QuestEnemyAppearanceMstId;
        } else {
            const param = unit.BattleParameter;
            const styleMstId = param instanceof CharacterParameter ? param.StyleMstId : 0;
            const mstId = unit.MstId;
            const maxHp = unit.MaxHP;
            const speed = unit.Speed;
            const special = unit.SpecialAttack;
            const specialId = special == null ? 0 : special.Id;
            const activeIds = unit.ActiveSkills.map(skill => skill.Id); // <>c.b__45_0
            const normal = unit.NormalAttack;
            const normalId = normal == null ? 0 : normal.Id;
            const passives = unit.PassiveSkills.map(ps => { // <>c.b__45_1
                const info = new BattleUnitStructure_PassiveSkillInfo().ctor();
                info._AbilitySourceType = ps.AbilitySourceType;
                info._PassiveSkillMstId = ps.Id;
                return info;
            });
            this._Structure = new BattleUnitStructure().ctor$int_int_int_int_int_int_int_PassiveSkillInfo_int_int_int_int(mstId, styleMstId, maxHp, speed,
                specialId, activeIds, normalId, passives, battleParameter.BreakPoint, battleParameter.InitialBreakedDamageReceiveRate,
                battleParameter.MaxBreakedDamageReceiveRate, unit.BattleParameter.BreakTurnGaugeSlowRatio);
        }
        this._ShowCountPointAll = this.CheckShowCountPointAll(unit);
        return this;
    }
    /** @rva 0x17F7A60  public bool get_IsCharacter() { } */
    get_IsCharacter(): boolean { return this._QuestEnemyAppearanceMstId === 0; /* asm: cmp dword ptr [rcx + 0x20], 0; sete al */ }
    /** @rva 0x17F6F00  private bool CheckShowCountPointAll(BattleUnit unit) { } */
    CheckShowCountPointAll(unit: BattleUnit): boolean {
        let result = false;
        const passiveTypes: List<string> = [];
        if (unit.PassiveSkills != null) {
            for (let i = 0; i < unit.PassiveSkills.length; i++) {
                const ps = unit.PassiveSkills[i]; // <>c__DisplayClass48_0
                const details = BattleMstReaderBase.get_Instance<PassiveSkillDetailMstModel, PassiveSkillDetailMstRecord, int>(PassiveSkillDetailMstModel)
                    .GetModelList(indexHint(detail => detail.passiveSkillMstId === ps.Id, "passiveSkillMstId", ps.Id)); // <>c__DisplayClass48_0.b__0
                if (details != null) passiveTypes.push(...[...details].map(detail => detail.record.abilityEffectType)); // <>c.b__48_1
            }
            result = passiveTypes.includes("COUNT");
        }
        if (unit.SkillSet != null) {
            const skills = unit.SkillSet.GetList();
            if (skills != null) {
                const skillTypes: List<string> = [];
                for (const skill of skills) {
                    const details = SkillDetailMstReader.GetDetailModelsByMstId(skill.Id);
                    if (details != null) skillTypes.push(...details.map(detail => detail.record.abilityEffectType)); // <>c.b__48_2
                }
                result = skillTypes.includes("COUNT") || result;
            }
        }
        return result;
    }
}
