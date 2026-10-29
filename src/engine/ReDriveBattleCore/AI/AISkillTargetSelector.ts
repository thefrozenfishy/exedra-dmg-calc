// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";
import type { IHateVariation } from "../UnitState/IHateVariation";
import { QuestEnemyAppearanceParameter } from "../QuestEnemyAppearanceParameter";
import { CharacterParameter } from "../CharacterParameter";
import { dictGet, f32, isImpl, notPorted, randomNext, randomNextIndex, randomNextWeighted } from "../../runtime";
import type { Dictionary, IEnumerable, List, int } from "../../runtime";
import type { RoleType } from "../../Network/Definition/Battle/RoleType";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.AI.AISkillTargetSelector  (TypeDefIndex 1089, public class) ----
export class AISkillTargetSelector {
    /** 0x0 private static readonly Dictionary<RoleType, int> roleWeightDic */
    static roleWeightDic: Dictionary<RoleType, int> = null!;
    /** @rva 0x17F1A50  public static BattleUnit SelectTargetUnitInOrder(IEnumerable<BattleUnit> candidateUnits, AISkillTargetSelector.UnitFilterFuncOrder unitFilterFuncOrder) { } */
    static SelectTargetUnitInOrder(candidateUnits: IEnumerable<BattleUnit>, unitFilterFuncOrder: AISkillTargetSelector_UnitFilterFuncOrder): BattleUnit {
        let list: List<BattleUnit> = [...candidateUnits];
        let list2: List<BattleUnit> = [];
        for (const func of unitFilterFuncOrder.GetEnumerator()) {
            list2.length = 0; // Clear
            list2.push(...func(list)); // AddRange
            if (list2.length > 0) {
                const tmp = list; list = list2; list2 = tmp;
                if (list.length === 1) return list[0];
            }
        }
        const index = randomNextIndex(list.length, "target", [], list); // new System.Random().Next(list.Count)
        return list[index] ?? null!; // ElementAtOrDefault
    }
    /** @rva 0x17F1FC0  public static IEnumerable<BattleUnit> UnitFilterByBreak(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByBreak(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => unit._BreakPoint.get_IsBreak()); // <>c.b__2_0 (BreakPoint.get_IsBreak inlined)
    }
    /** @rva 0x17F20D0  public static IEnumerable<BattleUnit> UnitFilterByMainTarget(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByMainTarget(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => { // <>c.b__3_0
            const p = unit._BattleParameter;
            return p instanceof QuestEnemyAppearanceParameter ? p._IsMainTargetEnemy : false;
        });
    }
    /** @rva 0x17F22F0  public static IEnumerable<BattleUnit> UnitFilterByRoleAttacker(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleAttacker(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(1 as TargetRoleType)); // <>c.b__4_0
    }
    /** @rva 0x17F2400  public static IEnumerable<BattleUnit> UnitFilterByRoleBreaker(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleBreaker(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(2 as TargetRoleType)); // <>c.b__5_0
    }
    /** @rva 0x17F2950  public static IEnumerable<BattleUnit> UnitFilterByRoleHealer(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleHealer(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(3 as TargetRoleType)); // <>c.b__6_0
    }
    /** @rva 0x17F2510  public static IEnumerable<BattleUnit> UnitFilterByRoleBuffer(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleBuffer(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(4 as TargetRoleType)); // <>c.b__7_0
    }
    /** @rva 0x17F2620  public static IEnumerable<BattleUnit> UnitFilterByRoleDebuffer(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleDebuffer(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(5 as TargetRoleType)); // <>c.b__8_0
    }
    /** @rva 0x17F2730  public static IEnumerable<BattleUnit> UnitFilterByRoleDefender(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleDefender(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(6 as TargetRoleType)); // <>c.b__9_0
    }
    /** @rva 0x17F21E0  public static IEnumerable<BattleUnit> UnitFilterByRoleAttackerOrBreaker(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleAttackerOrBreaker(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(1 as TargetRoleType) || unit.IsMatch$TargetRoleType(2 as TargetRoleType)); // <>c.b__10_0 (second IsMatch inlined)
    }
    /** @rva 0x17F2840  public static IEnumerable<BattleUnit> UnitFilterByRoleHealerOrBufferOrDebuffer(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleHealerOrBufferOrDebuffer(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(3 as TargetRoleType) || unit.IsMatch$TargetRoleType(4 as TargetRoleType) || unit.IsMatch$TargetRoleType(5 as TargetRoleType)); // <>c.b__11_0 (last IsMatch inlined)
    }
    /** @rva 0x17F3780  public static IEnumerable<BattleUnit> UnitFilterWithMinHpRate(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMinHpRate(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        if (candidateUnits.length === 0) return candidateUnits; // !Any()
        // Enumerable.Min<BattleUnit>(Func<BattleUnit, float>): NaN wins as soon as it is seen
        let minHpRate = NaN;
        let first = true;
        for (const unit of candidateUnits) {
            const v = unit.CalculationHpRate(); // <>c.b__12_0
            if (first) { minHpRate = v; first = false; if (Number.isNaN(v)) break; continue; }
            if (Number.isNaN(v)) { minHpRate = v; break; }
            if (v < minHpRate) minHpRate = v;
        }
        return candidateUnits.filter(unit => unit.CalculationHpRate() === minHpRate); // <>c__DisplayClass12_0.b__1
    }
    /** @rva 0x17F35A0  public static IEnumerable<BattleUnit> UnitFilterWithMinEp(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMinEp(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        if (candidateUnits.length === 0) return candidateUnits; // !Any()
        const minEp = Math.min(...candidateUnits.map(unit => unit._EP)); // <>c.b__13_0
        return candidateUnits.filter(unit => unit._EP === minEp); // <>c__DisplayClass13_0.b__1
    }
    /** @rva 0x17F31E0  public static IEnumerable<BattleUnit> UnitFilterWithMinBp(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMinBp(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        if (candidateUnits.length === 0) return candidateUnits; // !Any()
        const minBp = Math.min(...candidateUnits.map(unit => unit._BP)); // <>c.b__14_0
        return candidateUnits.filter(unit => unit._BP === minBp); // <>c__DisplayClass14_0.b__1
    }
    /** @rva 0x17F2A60  public static IEnumerable<BattleUnit> UnitFilterWithMaxAtk(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMaxAtk(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        if (candidateUnits.length === 0) return candidateUnits; // !Any()
        const maxAtk = Math.max(...candidateUnits.map(unit => unit.get_ATK())); // <>c.b__15_0
        return candidateUnits.filter(unit => unit.get_ATK() === maxAtk); // <>c__DisplayClass15_0.b__1
    }
    /** @rva 0x17F2C40  public static IEnumerable<BattleUnit> UnitFilterWithMaxDef(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMaxDef(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        if (candidateUnits.length === 0) return candidateUnits; // !Any()
        const maxDef = Math.max(...candidateUnits.map(unit => unit.get_DEF())); // <>c.b__16_0
        return candidateUnits.filter(unit => unit.get_DEF() === maxDef); // <>c__DisplayClass16_0.b__1
    }
    /** @rva 0x17F33C0  public static IEnumerable<BattleUnit> UnitFilterWithMinDef(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMinDef(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        if (candidateUnits.length === 0) return candidateUnits; // !Any()
        const minDef = Math.min(...candidateUnits.map(unit => unit.get_DEF())); // <>c.b__17_0
        return candidateUnits.filter(unit => unit.get_DEF() === minDef); // <>c__DisplayClass17_0.b__1
    }
    /** @rva 0x17F3000  public static IEnumerable<BattleUnit> UnitFilterWithMaxSpeed(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMaxSpeed(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        if (candidateUnits.length === 0) return candidateUnits; // !Any()
        const maxSpeed = Math.max(...candidateUnits.map(unit => unit.get_Speed())); // <>c.b__18_0
        return candidateUnits.filter(unit => unit.get_Speed() === maxSpeed); // <>c__DisplayClass18_0.b__1
    }
    /** @rva 0x17F2E20  public static IEnumerable<BattleUnit> UnitFilterWithMaxHP(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMaxHP(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        if (candidateUnits.length === 0) return candidateUnits; // !Any()
        // game quirk: "MaxHP" filters by the current HP
        const maxHp = Math.max(...candidateUnits.map(unit => unit._HP)); // <>c.b__19_0
        return candidateUnits.filter(unit => unit._HP === maxHp); // <>c__DisplayClass19_0.b__1
    }
    /** @rva 0x17F1610  public static Dictionary<BattleUnit, int> GetUnitWeightDic(IEnumerable<BattleUnit> candidateUnits, bool withHate = False) { } */
    static GetUnitWeightDic(candidateUnits: IEnumerable<BattleUnit>, withHate: boolean = false): Dictionary<BattleUnit, int> {
        const dictionary: Dictionary<BattleUnit, int> = new Map();
        for (const unit of candidateUnits) {
            const p = unit._BattleParameter;
            if (!(p instanceof CharacterParameter)) continue;
            let num = dictGet(AISkillTargetSelector.roleWeightDic, p._Role);
            if (withHate) {
                for (const state of unit._Condition._StateList) {
                    if (!isImpl(state, "IHateVariation")) continue;
                    if (state.IsActive$BattleUnit(unit)) {
                        num += (state as unknown as IHateVariation).GetHateVariationWeight();
                    }
                }
            }
            dictionary.set(unit, num < 0 ? 0 : num); // Math.Max(0, num) inlined; indexer set
        }
        return dictionary;
    }
    /** @rva 0x17F1DC0  public static BattleUnit SelectUnitAtWeightedRandom(Dictionary<BattleUnit, int> unitWeightDic) { } */
    static SelectUnitAtWeightedRandom(unitWeightDic: Dictionary<BattleUnit, int>): BattleUnit {
        // new System.Random(); Sum(Values) (checked; throws OverflowException in .NET on overflow)
        let sum = 0;
        for (const v of unitWeightDic.values()) sum += v;
        const num = randomNextWeighted(sum, [...unitWeightDic.values()], "target", [], [...unitWeightDic.keys()]); // random.Next(sum)
        let num2 = 0;
        for (const key of unitWeightDic.keys()) {
            num2 += dictGet(unitWeightDic, key);
            if (num < num2) return key;
        }
        return null!;
    }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17F3960  private static void .cctor() { } */
    static cctor(): void {
        const dic: Dictionary<RoleType, int> = new Map();
        dic.set(6 as RoleType, 15);
        dic.set(3 as RoleType, 10);
        dic.set(4 as RoleType, 10);
        dic.set(5 as RoleType, 10);
        dic.set(1 as RoleType, 5);
        dic.set(2 as RoleType, 5);
        AISkillTargetSelector.roleWeightDic = dic;
    }
}

// ---- ReDriveBattleCore.AI.AISkillTargetSelector.UnitFilterFuncOrder  (TypeDefIndex 1079, public class) ----
export class AISkillTargetSelector_UnitFilterFuncOrder {  // implements IEnumerable<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>>, IEnumerable
    static readonly __interfaces: readonly string[] = ['IEnumerable', 'IEnumerable', 'IEnumerable'];
    /** 0x10 private LinkedList<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>> funcList */
    funcList: ((a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>)[] /* LinkedList<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>> */ = null!;
    /** @rva 0x18067A0  public void .ctor() { } */
    ctor(): this {
        this.funcList = []; // new LinkedList<...>()
        return this;
    }
    /** @rva 0x18066D0  public void .ctor(List<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>> funcList) { } */
    ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList: List<((a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>)>): this {
        this.funcList = []; // field initializer: new LinkedList<...>()
        this.funcList = [...funcList]; // new LinkedList<...>(funcList)
        return this;
    }
    /** @rva 0x1806570  public void AddFirst(Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>> func) { } */
    AddFirst(func: ((a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>)): void {
        this.funcList.unshift(func);
    }
    /** @rva 0x18065D0  public void AddLast(Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>> func) { } */
    AddLast(func: ((a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>)): void {
        this.funcList.push(func);
    }
    /** @rva 0x1806630 slot 4  public IEnumerator<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>> GetEnumerator() { } */
    GetEnumerator(): IterableIterator<((a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>)> {
        return this.funcList[Symbol.iterator]();
    }
    /** @rva 0x18066C0 slot 5  private IEnumerator System.Collections.IEnumerable.GetEnumerator() { } */
    IEnumerable$GetEnumerator(): IterableIterator<((a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>)> {
        return this.funcList[Symbol.iterator]();
    }
}

AISkillTargetSelector.cctor(); // C# static constructor