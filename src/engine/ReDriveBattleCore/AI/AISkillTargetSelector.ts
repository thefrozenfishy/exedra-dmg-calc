// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, IEnumerable, List, int } from "../../runtime";
import type { RoleType } from "../../Network/Definition/Battle/RoleType";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.AI.AISkillTargetSelector  (TypeDefIndex 1089, public class) ----
export class AISkillTargetSelector {
    /** 0x0 private static readonly Dictionary<RoleType, int> roleWeightDic */
    static roleWeightDic: Dictionary<RoleType, int> = null!;
    /** @rva 0x17DD3C0  public static BattleUnit SelectTargetUnitInOrder(IEnumerable<BattleUnit> candidateUnits, AISkillTargetSelector.UnitFilterFuncOrder unitFilterFuncOrder) { } */
    static SelectTargetUnitInOrder(candidateUnits: IEnumerable<BattleUnit>, unitFilterFuncOrder: AISkillTargetSelector_UnitFilterFuncOrder): BattleUnit { return notPorted("AISkillTargetSelector.SelectTargetUnitInOrder", 0x17DD3C0); }
    /** @rva 0x17DD930  public static IEnumerable<BattleUnit> UnitFilterByBreak(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByBreak(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByBreak", 0x17DD930); }
    /** @rva 0x17DDA40  public static IEnumerable<BattleUnit> UnitFilterByMainTarget(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByMainTarget(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByMainTarget", 0x17DDA40); }
    /** @rva 0x17DDC60  public static IEnumerable<BattleUnit> UnitFilterByRoleAttacker(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleAttacker(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByRoleAttacker", 0x17DDC60); }
    /** @rva 0x17DDD70  public static IEnumerable<BattleUnit> UnitFilterByRoleBreaker(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleBreaker(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByRoleBreaker", 0x17DDD70); }
    /** @rva 0x17DE2C0  public static IEnumerable<BattleUnit> UnitFilterByRoleHealer(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleHealer(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByRoleHealer", 0x17DE2C0); }
    /** @rva 0x17DDE80  public static IEnumerable<BattleUnit> UnitFilterByRoleBuffer(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleBuffer(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByRoleBuffer", 0x17DDE80); }
    /** @rva 0x17DDF90  public static IEnumerable<BattleUnit> UnitFilterByRoleDebuffer(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleDebuffer(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByRoleDebuffer", 0x17DDF90); }
    /** @rva 0x17DE0A0  public static IEnumerable<BattleUnit> UnitFilterByRoleDefender(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleDefender(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByRoleDefender", 0x17DE0A0); }
    /** @rva 0x17DDB50  public static IEnumerable<BattleUnit> UnitFilterByRoleAttackerOrBreaker(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleAttackerOrBreaker(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker", 0x17DDB50); }
    /** @rva 0x17DE1B0  public static IEnumerable<BattleUnit> UnitFilterByRoleHealerOrBufferOrDebuffer(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterByRoleHealerOrBufferOrDebuffer(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterByRoleHealerOrBufferOrDebuffer", 0x17DE1B0); }
    /** @rva 0x17DF0F0  public static IEnumerable<BattleUnit> UnitFilterWithMinHpRate(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMinHpRate(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterWithMinHpRate", 0x17DF0F0); }
    /** @rva 0x17DEF10  public static IEnumerable<BattleUnit> UnitFilterWithMinEp(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMinEp(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterWithMinEp", 0x17DEF10); }
    /** @rva 0x17DEB50  public static IEnumerable<BattleUnit> UnitFilterWithMinBp(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMinBp(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterWithMinBp", 0x17DEB50); }
    /** @rva 0x17DE3D0  public static IEnumerable<BattleUnit> UnitFilterWithMaxAtk(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMaxAtk(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterWithMaxAtk", 0x17DE3D0); }
    /** @rva 0x17DE5B0  public static IEnumerable<BattleUnit> UnitFilterWithMaxDef(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMaxDef(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterWithMaxDef", 0x17DE5B0); }
    /** @rva 0x17DED30  public static IEnumerable<BattleUnit> UnitFilterWithMinDef(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMinDef(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterWithMinDef", 0x17DED30); }
    /** @rva 0x17DE970  public static IEnumerable<BattleUnit> UnitFilterWithMaxSpeed(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMaxSpeed(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterWithMaxSpeed", 0x17DE970); }
    /** @rva 0x17DE790  public static IEnumerable<BattleUnit> UnitFilterWithMaxHP(IEnumerable<BattleUnit> candidateUnits) { } */
    static UnitFilterWithMaxHP(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("AISkillTargetSelector.UnitFilterWithMaxHP", 0x17DE790); }
    /** @rva 0x17DCF80  public static Dictionary<BattleUnit, int> GetUnitWeightDic(IEnumerable<BattleUnit> candidateUnits, bool withHate = False) { } */
    static GetUnitWeightDic(candidateUnits: IEnumerable<BattleUnit>, withHate?: boolean /* = False */): Dictionary<BattleUnit, int> { return notPorted("AISkillTargetSelector.GetUnitWeightDic", 0x17DCF80); }
    /** @rva 0x17DD730  public static BattleUnit SelectUnitAtWeightedRandom(Dictionary<BattleUnit, int> unitWeightDic) { } */
    static SelectUnitAtWeightedRandom(unitWeightDic: Dictionary<BattleUnit, int>): BattleUnit { return notPorted("AISkillTargetSelector.SelectUnitAtWeightedRandom", 0x17DD730); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17DF2D0  private static void .cctor() { } */
    static cctor(): void { return notPorted("AISkillTargetSelector..cctor", 0x17DF2D0); }
}

// ---- ReDriveBattleCore.AI.AISkillTargetSelector.UnitFilterFuncOrder  (TypeDefIndex 1079, public class) ----
export class AISkillTargetSelector_UnitFilterFuncOrder {  // implements IEnumerable<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>>, IEnumerable
    static readonly __interfaces: readonly string[] = ['IEnumerable', 'IEnumerable', 'IEnumerable'];
    /** 0x10 private LinkedList<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>> funcList */
    funcList: any /* LinkedList<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>> */ = null!;
    /** @rva 0x17F3AD0  public void .ctor() { } */
    ctor(): this { return notPorted("AISkillTargetSelector_UnitFilterFuncOrder..ctor", 0x17F3AD0); }
    /** @rva 0x17F3A00  public void .ctor(List<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>> funcList) { } */
    ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList: List<((a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>)>): this { return notPorted("AISkillTargetSelector_UnitFilterFuncOrder..ctor", 0x17F3A00); }
    /** @rva 0x17F38A0  public void AddFirst(Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>> func) { } */
    AddFirst(func: ((a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>)): void { return notPorted("AISkillTargetSelector_UnitFilterFuncOrder.AddFirst", 0x17F38A0); }
    /** @rva 0x17F3900  public void AddLast(Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>> func) { } */
    AddLast(func: ((a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>)): void { return notPorted("AISkillTargetSelector_UnitFilterFuncOrder.AddLast", 0x17F3900); }
    /** @rva 0x17F3960 slot 4  public IEnumerator<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>> GetEnumerator() { } */
    GetEnumerator(): any /* IEnumerator<Func<IEnumerable<BattleUnit>, IEnumerable<BattleUnit>>> */ { return notPorted("AISkillTargetSelector_UnitFilterFuncOrder.GetEnumerator", 0x17F3960); }
    /** @rva 0x17F39F0 slot 5  private IEnumerator System.Collections.IEnumerable.GetEnumerator() { } */
    IEnumerable$GetEnumerator(): any /* IEnumerator */ { return notPorted("AISkillTargetSelector_UnitFilterFuncOrder.System.Collections.IEnumerable.GetEnumerator", 0x17F39F0); }
}
