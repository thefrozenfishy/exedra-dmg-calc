// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { ElementType } from "../Network/Definition/Battle/ElementType";
import type { AbnormalEffectParryRate } from "./AbnormalEffectParryRate";
import { BattleParameter } from "./BattleParameter";
import type { ElementAimDamageRate } from "./ElementAimDamageRate";
import type { BreakMstModel } from "./Model/BreakMstModel";
import type { QuestEnemyAppearanceMstModel } from "./Model/QuestEnemyAppearanceMstModel";

// ---- ReDriveBattleCore.QuestEnemyAppearanceParameter  (TypeDefIndex 342, public class) ----
export class QuestEnemyAppearanceParameter extends BattleParameter {
    /** 0x60 private int <QuestEnemyAppearanceMstId>k__BackingField */
    _QuestEnemyAppearanceMstId: int = 0;
    /** 0x64 private bool <IsMainTargetEnemy>k__BackingField */
    _IsMainTargetEnemy: boolean = false;
    /** 0x68 private ElementType[] <WeakElements>k__BackingField */
    _WeakElements: ElementType[] = null!;
    /** 0x70 private AbnormalEffectParryRate[] <AbnormalEffectParryRates>k__BackingField */
    _AbnormalEffectParryRates: AbnormalEffectParryRate[] = null!;
    /** 0x78 private ElementAimDamageRate[] <ElementAimDamageRates>k__BackingField */
    _ElementAimDamageRates: ElementAimDamageRate[] = null!;
    /** 0x80 private int <HPGaugeCount>k__BackingField */
    _HPGaugeCount: int = 0;
    /** 0x84 private int <StartHPGaugeCount>k__BackingField */
    _StartHPGaugeCount: int = 0;
    /** 0x88 private int <LinkHpWeight>k__BackingField */
    _LinkHpWeight: int = 0;
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    set QuestEnemyAppearanceMstId(v: int) { this.set_QuestEnemyAppearanceMstId(v); }
    get IsMainTargetEnemy(): boolean { return this.get_IsMainTargetEnemy(); }
    set IsMainTargetEnemy(v: boolean) { this.set_IsMainTargetEnemy(v); }
    get WeakElements(): ElementType[] { return this.get_WeakElements(); }
    set WeakElements(v: ElementType[]) { this.set_WeakElements(v); }
    get AbnormalEffectParryRates(): AbnormalEffectParryRate[] { return this.get_AbnormalEffectParryRates(); }
    set AbnormalEffectParryRates(v: AbnormalEffectParryRate[]) { this.set_AbnormalEffectParryRates(v); }
    get ElementAimDamageRates(): ElementAimDamageRate[] { return this.get_ElementAimDamageRates(); }
    set ElementAimDamageRates(v: ElementAimDamageRate[]) { this.set_ElementAimDamageRates(v); }
    get HPGaugeCount(): int { return this.get_HPGaugeCount(); }
    set HPGaugeCount(v: int) { this.set_HPGaugeCount(v); }
    get StartHPGaugeCount(): int { return this.get_StartHPGaugeCount(); }
    set StartHPGaugeCount(v: int) { this.set_StartHPGaugeCount(v); }
    get LinkHpWeight(): int { return this.get_LinkHpWeight(); }
    set LinkHpWeight(v: int) { this.set_LinkHpWeight(v); }
    /** @rva 0x8A1200  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this._QuestEnemyAppearanceMstId; /* auto-property */ }
    /** @rva 0x8A12D0  public void set_QuestEnemyAppearanceMstId(int value) { } */
    set_QuestEnemyAppearanceMstId(value: int): void { this._QuestEnemyAppearanceMstId = value; /* auto-property */ }
    /** @rva 0xC03280  public bool get_IsMainTargetEnemy() { } */
    get_IsMainTargetEnemy(): boolean { return this._IsMainTargetEnemy; /* auto-property */ }
    /** @rva 0xC032D0  public void set_IsMainTargetEnemy(bool value) { } */
    set_IsMainTargetEnemy(value: boolean): void { this._IsMainTargetEnemy = value; /* auto-property */ }
    /** @rva 0x736A30  public ElementType[] get_WeakElements() { } */
    get_WeakElements(): ElementType[] { return this._WeakElements; /* auto-property */ }
    /** @rva 0x736A70  public void set_WeakElements(ElementType[] value) { } */
    set_WeakElements(value: ElementType[]): void { this._WeakElements = value; /* auto-property */ }
    /** @rva 0x736A20  public AbnormalEffectParryRate[] get_AbnormalEffectParryRates() { } */
    get_AbnormalEffectParryRates(): AbnormalEffectParryRate[] { return this._AbnormalEffectParryRates; /* auto-property */ }
    /** @rva 0x736A60  public void set_AbnormalEffectParryRates(AbnormalEffectParryRate[] value) { } */
    set_AbnormalEffectParryRates(value: AbnormalEffectParryRate[]): void { this._AbnormalEffectParryRates = value; /* auto-property */ }
    /** @rva 0x736C60  public ElementAimDamageRate[] get_ElementAimDamageRates() { } */
    get_ElementAimDamageRates(): ElementAimDamageRate[] { return this._ElementAimDamageRates; /* auto-property */ }
    /** @rva 0x736E10  public void set_ElementAimDamageRates(ElementAimDamageRate[] value) { } */
    set_ElementAimDamageRates(value: ElementAimDamageRate[]): void { this._ElementAimDamageRates = value; /* auto-property */ }
    /** @rva 0x900E80  public int get_HPGaugeCount() { } */
    get_HPGaugeCount(): int { return this._HPGaugeCount; /* auto-property */ }
    /** @rva 0x900E90  public void set_HPGaugeCount(int value) { } */
    set_HPGaugeCount(value: int): void { this._HPGaugeCount = value; /* auto-property */ }
    /** @rva 0x901470  public int get_StartHPGaugeCount() { } */
    get_StartHPGaugeCount(): int { return this._StartHPGaugeCount; /* auto-property */ }
    /** @rva 0x901490  public void set_StartHPGaugeCount(int value) { } */
    set_StartHPGaugeCount(value: int): void { this._StartHPGaugeCount = value; /* auto-property */ }
    /** @rva 0x9009C0  public int get_LinkHpWeight() { } */
    get_LinkHpWeight(): int { return this._LinkHpWeight; /* auto-property */ }
    /** @rva 0x900A30  public void set_LinkHpWeight(int value) { } */
    set_LinkHpWeight(value: int): void { this._LinkHpWeight = value; /* auto-property */ }
    /** @rva 0x72F5E0  private void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x13B2D00  public void .ctor(in QuestEnemyAppearanceMstModel mst, BreakMstModel breakMstModel) { } */
    ctor$QuestEnemyAppearanceMstModel_BreakMstModel(mst: QuestEnemyAppearanceMstModel, breakMstModel: BreakMstModel): this {
        // base .ctor(atk, def, ctr, ctd, hp, speed, healRate, effectHitRate, effectParryRate, damageRates, resistRates) inlined
        const hp = mst.HP, atk = mst.ATK, def = mst.DEF, ctr = mst.CriticalRate, ctd = mst.CriticalDamageRate, speed = mst.Speed;
        const healRate = mst.HealRate, effectHitRate = mst.EffectHitRate, effectParryRate = mst.EffectParryRate;
        const damageRates = mst.ElementDamageRates, resistRates = mst.ElementResistRates;
        super.ctor$int_int_int_int_int_int_int_int_int_ElementDamageRate_ElementResistRate(atk, def, ctr, ctd, hp, speed, healRate, effectHitRate, effectParryRate, damageRates, resistRates);
        this._QuestEnemyAppearanceMstId = mst.QuestEnemyAppearanceMstId;
        this._IsMainTargetEnemy = mst.IsMainTargetEnemy;
        this._WeakElements = mst.WeakElements;
        this._AbnormalEffectParryRates = mst.AbnormalEffectParryRates;
        this._HPGaugeCount = mst.HPGaugeCount;
        this._StartHPGaugeCount = mst.StartHPGaugeCount;
        this._ElementAimDamageRates = mst.ElementAimDamageRates;
        this._LinkHpWeight = mst.LinkHpWeight;
        if (breakMstModel == null)
            throw new Error(`QuestEnemyAppearanceMstModel(id:${this.QuestEnemyAppearanceMstId})のBreakMstId(${mst.BreakMstId})が存在しません！`);
        this._BreakPoint = breakMstModel.BreakPoint;
        this._BreakPointRecoveryPerTurn = breakMstModel.BreakPointRecoveryPerTurn;
        this._BreakTurnGaugeSlowRatio = breakMstModel.BreakTurnGaugeSlowRatio;
        this._InitialBreakedDamageReceiveRate = breakMstModel.InitialBreakedDamageReceiveRate;
        this._MaxBreakedDamageReceiveRate = breakMstModel.MaxBreakedDamageReceiveRate;
        this._BreakedDamageReceiveRateIncreaseRate = breakMstModel.BreakedDamageReceiveRateIncreaseRate;
        return this;
    }
}
