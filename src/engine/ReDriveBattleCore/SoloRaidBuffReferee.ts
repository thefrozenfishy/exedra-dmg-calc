// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { clamp, f32 } from "../runtime";
import { PassiveSkillInfo } from "../Network/Definition/QuestBattle/PassiveSkillInfo";
import type { SoloRaidSeasonBuffMstRecord } from "../Network/Definition/SoloRaid/SoloRaidSeasonBuffMstRecord";
import type { SoloRaidPartyBuffMstRecord } from "../Network/Definition/SoloRaid/SoloRaidPartyBuffMstRecord";
import { SoloRaidSeasonBuffMstModel } from "./Model/SoloRaidSeasonBuffMstModel";
import { SoloRaidPartyBuffMstModel } from "./Model/SoloRaidPartyBuffMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { BattleUnit as BattleUnit$ } from "./BattleUnit";
import type { List, float, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.SoloRaidBuffReferee  (TypeDefIndex 459, public class) ----
export class SoloRaidBuffReferee {
    /** 0x10 private int commonBuffPointChargePassiveSkillMstId */
    commonBuffPointChargePassiveSkillMstId: int = 0;
    /** 0x14 private int seasonBuffPassiveSkillMstId */
    seasonBuffPassiveSkillMstId: int = 0;
    /** 0x18 private int seasonBuffEnhancedPassiveSkillMstId */
    seasonBuffEnhancedPassiveSkillMstId: int = 0;
    /** 0x1C private int seasonBuffBuffPointChargePassiveSkillMstId */
    seasonBuffBuffPointChargePassiveSkillMstId: int = 0;
    /** 0x20 private int partyBuffPassiveSkillMstId */
    partyBuffPassiveSkillMstId: int = 0;
    /** 0x24 private int partyBuffBuffPointChargePassiveSkillMstId */
    partyBuffBuffPointChargePassiveSkillMstId: int = 0;
    /** 0x28 private bool isSeasonBuffActive */
    isSeasonBuffActive: boolean = false;
    /** 0x2C private int currentSeasonBuffPoint */
    currentSeasonBuffPoint: int = 0;
    /** 0x30 private int maxSeasonBuffPoint */
    maxSeasonBuffPoint: int = 0;
    /** 0x34 private int activeMaxSeasonBuffPoint */
    activeMaxSeasonBuffPoint: int = 0;
    /** 0x38 private float activeCurrentSeasonBuffTurnGaugeValue */
    activeCurrentSeasonBuffTurnGaugeValue: float = 0;
    /** 0x3C private int activeMaxSeasonBuffTurnGaugeValue */
    activeMaxSeasonBuffTurnGaugeValue: int = 0;
    get IsSeasonBuffActive(): boolean { return this.get_IsSeasonBuffActive(); }
    get CurrentSeasonBuffPoint(): int { return this.get_CurrentSeasonBuffPoint(); }
    get MaxSeasonBuffPoint(): int { return this.get_MaxSeasonBuffPoint(); }
    get ActiveMaxSeasonBuffPoint(): int { return this.get_ActiveMaxSeasonBuffPoint(); }
    get ActiveCurrentSeasonBuffTurnGaugeValue(): float { return this.get_ActiveCurrentSeasonBuffTurnGaugeValue(); }
    get ActiveMaxSeasonBuffTurnGaugeValue(): int { return this.get_ActiveMaxSeasonBuffTurnGaugeValue(); }
    /** @rva 0x7394E0  public bool get_IsSeasonBuffActive() { } */
    get_IsSeasonBuffActive(): boolean { return this.isSeasonBuffActive; /* asm: movzx eax, byte ptr [rcx + 0x28]; ret */ }
    /** @rva 0x85D530  public int get_CurrentSeasonBuffPoint() { } */
    get_CurrentSeasonBuffPoint(): int { return this.currentSeasonBuffPoint; /* asm: mov eax, dword ptr [rcx + 0x2c]; ret */ }
    /** @rva 0x75DD60  public int get_MaxSeasonBuffPoint() { } */
    get_MaxSeasonBuffPoint(): int { return this.maxSeasonBuffPoint; /* asm: mov eax, dword ptr [rcx + 0x30]; ret */ }
    /** @rva 0x75DD50  public int get_ActiveMaxSeasonBuffPoint() { } */
    get_ActiveMaxSeasonBuffPoint(): int { return this.activeMaxSeasonBuffPoint; /* asm: mov eax, dword ptr [rcx + 0x34]; ret */ }
    /** @rva 0xBB6E60  public float get_ActiveCurrentSeasonBuffTurnGaugeValue() { } */
    get_ActiveCurrentSeasonBuffTurnGaugeValue(): float { return this.activeCurrentSeasonBuffTurnGaugeValue; /* asm: movss xmm0, dword ptr [rcx + 0x38]; ret */ }
    /** @rva 0x8F2F40  public int get_ActiveMaxSeasonBuffTurnGaugeValue() { } */
    get_ActiveMaxSeasonBuffTurnGaugeValue(): int { return this.activeMaxSeasonBuffTurnGaugeValue; /* asm: mov eax, dword ptr [rcx + 0x3c]; ret */ }
    /** @rva 0x15E4420  public void Init(int commonBuffPointChargePassiveSkillMstId, int soloRaidSeasonBuffMstId, int soloRaidPartyBuffMstId, bool isSeasonBuffActive, int seasonBuffPoint, float seasonBuffTurnGaugeValue, List<BattleUnit> battleUnits) { } */
    Init(commonBuffPointChargePassiveSkillMstId: int, soloRaidSeasonBuffMstId: int, soloRaidPartyBuffMstId: int, isSeasonBuffActive: boolean, seasonBuffPoint: int, seasonBuffTurnGaugeValue: float, battleUnits: List<BattleUnit>): void {
        this.commonBuffPointChargePassiveSkillMstId = commonBuffPointChargePassiveSkillMstId;
        const season = BattleMstReaderBase.get_Instance<SoloRaidSeasonBuffMstModel, SoloRaidSeasonBuffMstRecord, int>(SoloRaidSeasonBuffMstModel).GetModelByKey(soloRaidSeasonBuffMstId);
        const party = BattleMstReaderBase.get_Instance<SoloRaidPartyBuffMstModel, SoloRaidPartyBuffMstRecord, int>(SoloRaidPartyBuffMstModel).GetModelByKey(soloRaidPartyBuffMstId);
        // no null checks in the game: a missing season or party record throws NullReferenceException
        this.seasonBuffPassiveSkillMstId = season!.PassiveSkillMstId;
        this.seasonBuffEnhancedPassiveSkillMstId = season!.EnhancedPassiveSkillMstId;
        this.seasonBuffBuffPointChargePassiveSkillMstId = season!.BuffPointChargePassiveSkillMstId;
        this.partyBuffPassiveSkillMstId = party!.PassiveSkillMstId;
        this.partyBuffBuffPointChargePassiveSkillMstId = party!.BuffPointChargePassiveSkillMstId;
        this.isSeasonBuffActive = isSeasonBuffActive;
        this.currentSeasonBuffPoint = seasonBuffPoint;
        this.maxSeasonBuffPoint = season!.MaxBuffPoint;
        this.activeMaxSeasonBuffPoint = season!.MaxBuffPointOnEnhanced;
        this.activeCurrentSeasonBuffTurnGaugeValue = seasonBuffTurnGaugeValue;
        this.activeMaxSeasonBuffTurnGaugeValue = season!.EnhancedSkillTurnGaugeValue;
        this.AddSoloRaidBuffToUnit(battleUnits); // tail call
    }
    /** @rva 0x15E3F70  public void AddSoloRaidBuffToUnit(List<BattleUnit> battleUnits) { } */
    AddSoloRaidBuffToUnit(battleUnits: List<BattleUnit>): void {
        const infos: PassiveSkillInfo[] = [];
        const add = (id: int, sourceType: int) => { const info = new PassiveSkillInfo(); info.passiveSkillMstId = id; info.abilitySourceType = sourceType; infos.push(info); };
        if (0 < this.commonBuffPointChargePassiveSkillMstId) add(this.commonBuffPointChargePassiveSkillMstId, 8);
        if (0 < this.seasonBuffPassiveSkillMstId) add(this.seasonBuffPassiveSkillMstId, 6);
        if (0 < this.seasonBuffEnhancedPassiveSkillMstId) add(this.seasonBuffEnhancedPassiveSkillMstId, 6);
        if (0 < this.seasonBuffBuffPointChargePassiveSkillMstId) add(this.seasonBuffBuffPointChargePassiveSkillMstId, 6);
        if (0 < this.partyBuffPassiveSkillMstId) add(this.partyBuffPassiveSkillMstId, 7);
        if (0 < this.partyBuffBuffPointChargePassiveSkillMstId) add(this.partyBuffBuffPointChargePassiveSkillMstId, 7);
        for (const unit of battleUnits) {
            const skills = BattleUnit$.GetPassiveSkills(unit, [...infos]);
            unit._PassiveSkills = [...unit._PassiveSkills, ...skills]; // Concat(...).ToArray()
        }
    }
    /** @rva 0x15E3EE0  public void AddPoint(int addPoint) { } */
    AddPoint(addPoint: int): void {
        this.currentSeasonBuffPoint = clamp(this.currentSeasonBuffPoint + addPoint, 0, this.isSeasonBuffActive ? this.activeMaxSeasonBuffPoint : this.maxSeasonBuffPoint);
    }
    /** @rva 0x15E4350  public bool CheckActive() { } */
    CheckActive(): boolean {
        if (this.isSeasonBuffActive) return false;
        if (this.currentSeasonBuffPoint < this.maxSeasonBuffPoint) return false;
        this.isSeasonBuffActive = true;
        this.currentSeasonBuffPoint = 0;
        this.activeCurrentSeasonBuffTurnGaugeValue = this.activeMaxSeasonBuffTurnGaugeValue;
        return true;
    }
    /** @rva 0x15E4380  public bool DecreaseSeasonBuffTurnGaugeValue(float decreaseTurnGaugeValue) { } */
    DecreaseSeasonBuffTurnGaugeValue(decreaseTurnGaugeValue: float): boolean {
        if (!this.isSeasonBuffActive) return false;
        this.activeCurrentSeasonBuffTurnGaugeValue = f32(Math.max(f32(this.activeCurrentSeasonBuffTurnGaugeValue - decreaseTurnGaugeValue), 0)); // Math.Max(float, float)
        if (this.activeCurrentSeasonBuffTurnGaugeValue <= 0) {
            this.isSeasonBuffActive = false;
            this.activeCurrentSeasonBuffTurnGaugeValue = 0;
            return true;
        }
        return false;
    }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
