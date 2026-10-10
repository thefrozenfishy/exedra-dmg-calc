// 1:1 port of ReDriveBattleCore (game 3.19.0). Generic class (RVA -1 in the dump), ported by hand from the shared
// instance BattleMstReaderBase<object, object, int>$$get_Instance 0x452d070.

import type { Type } from "../../runtime";
import type { IBattleMstReader } from "./IBattleMstReader";
import { BattleMstReaderContainer } from "./BattleMstReaderContainer";

// ---- ReDriveBattleCore.Reader.BattleMstReaderBase<TModel, TRecord, TKey>  (TypeDefIndex 846, public abstract class) ----
// The concrete readers (SkillMstReader : BattleMstReaderBase<SkillMstModel, SkillMstRecord, int> ...) add only static
// helpers. In the game `BattleMstReaderBase<SkillMstModel, SkillMstRecord, int>.Instance` is a static of that closed
// type; here the closed type is identified by the model class: `BattleMstReaderBase.get_Instance(SkillMstModel)`.
export abstract class BattleMstReaderBase<TModel, TRecord, TKey> {
    /** 0x0 private static IBattleMstReader<TModel, TRecord, TKey> instance  (one per closed type) */
    static instance: Map<Type, IBattleMstReader<any, any, any> | null> = new Map();
    /** @rva 0x452d070 (shared <object, object, int>)  public static IBattleMstReader<TModel, TRecord, TKey> get_Instance() { } */
    static get_Instance<TModel, TRecord, TKey>(TModel$: Type): IBattleMstReader<TModel, TRecord, TKey> {
        let inst = BattleMstReaderBase.instance.get(TModel$) ?? null;
        if (inst == null) {
            inst = BattleMstReaderContainer.GetReader<TModel, TRecord, TKey>(TModel$);
            BattleMstReaderBase.instance.set(TModel$, inst);
        }
        return inst as IBattleMstReader<TModel, TRecord, TKey>;
    }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; }
    /** phantom, keeps the type parameters in the type */
    declare readonly __t?: [TModel, TRecord, TKey];
}
