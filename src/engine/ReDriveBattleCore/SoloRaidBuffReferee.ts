// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
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
    /** @rva 0x73A4E0  public bool get_IsSeasonBuffActive() { } */
    get_IsSeasonBuffActive(): boolean { return this.isSeasonBuffActive; /* asm: movzx eax, byte ptr [rcx + 0x28]; ret */ }
    /** @rva 0x85E530  public int get_CurrentSeasonBuffPoint() { } */
    get_CurrentSeasonBuffPoint(): int { return this.currentSeasonBuffPoint; /* asm: mov eax, dword ptr [rcx + 0x2c]; ret */ }
    /** @rva 0x75ED60  public int get_MaxSeasonBuffPoint() { } */
    get_MaxSeasonBuffPoint(): int { return this.maxSeasonBuffPoint; /* asm: mov eax, dword ptr [rcx + 0x30]; ret */ }
    /** @rva 0x75ED50  public int get_ActiveMaxSeasonBuffPoint() { } */
    get_ActiveMaxSeasonBuffPoint(): int { return this.activeMaxSeasonBuffPoint; /* asm: mov eax, dword ptr [rcx + 0x34]; ret */ }
    /** @rva 0xB9C570  public float get_ActiveCurrentSeasonBuffTurnGaugeValue() { } */
    get_ActiveCurrentSeasonBuffTurnGaugeValue(): float { return this.activeCurrentSeasonBuffTurnGaugeValue; /* asm: movss xmm0, dword ptr [rcx + 0x38]; ret */ }
    /** @rva 0x8F3F40  public int get_ActiveMaxSeasonBuffTurnGaugeValue() { } */
    get_ActiveMaxSeasonBuffTurnGaugeValue(): int { return this.activeMaxSeasonBuffTurnGaugeValue; /* asm: mov eax, dword ptr [rcx + 0x3c]; ret */ }
    /** @rva 0x15C0260  public void Init(int commonBuffPointChargePassiveSkillMstId, int soloRaidSeasonBuffMstId, int soloRaidPartyBuffMstId, bool isSeasonBuffActive, int seasonBuffPoint, float seasonBuffTurnGaugeValue, List<BattleUnit> battleUnits) { } */
    Init(commonBuffPointChargePassiveSkillMstId: int, soloRaidSeasonBuffMstId: int, soloRaidPartyBuffMstId: int, isSeasonBuffActive: boolean, seasonBuffPoint: int, seasonBuffTurnGaugeValue: float, battleUnits: List<BattleUnit>): void { return notPorted("SoloRaidBuffReferee.Init", 0x15C0260); }
    /** @rva 0x15BFDB0  public void AddSoloRaidBuffToUnit(List<BattleUnit> battleUnits) { } */
    AddSoloRaidBuffToUnit(battleUnits: List<BattleUnit>): void { return notPorted("SoloRaidBuffReferee.AddSoloRaidBuffToUnit", 0x15BFDB0); }
    /** @rva 0x15BFD20  public void AddPoint(int addPoint) { } */
    AddPoint(addPoint: int): void { return notPorted("SoloRaidBuffReferee.AddPoint", 0x15BFD20); }
    /** @rva 0x15C0190  public bool CheckActive() { } */
    CheckActive(): boolean { return notPorted("SoloRaidBuffReferee.CheckActive", 0x15C0190); }
    /** @rva 0x15C01C0  public bool DecreaseSeasonBuffTurnGaugeValue(float decreaseTurnGaugeValue) { } */
    DecreaseSeasonBuffTurnGaugeValue(decreaseTurnGaugeValue: float): boolean { return notPorted("SoloRaidBuffReferee.DecreaseSeasonBuffTurnGaugeValue", 0x15C01C0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
