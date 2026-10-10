// 1:1 port of ReDriveBattleCore (game 3.19.0). Generic interfaces (no RVA; not emitted by gen_shells.py), by hand.

import type { ICollection, IReadOnlyDictionary, List, int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.IBattleMstReader<TModel, TRecord, TKey>  (TypeDefIndex 874, public interface) ----
// Implemented by the client (ReDrive.Model.BattleMstModelRepositoryBase, ported in src/engine/ReDrive/Model).
export interface IBattleMstReader<TModel, TRecord, TKey> {
    /** slot 0 */ GetModelByKey(key: TKey): TModel;
    /** slot 1 */ GetModel(expr: (r: TRecord) => boolean): TModel;
    /** slot 2 */ GetModelListByKeys(keyList: ICollection<TKey>): ICollection<TModel>;
    /** slot 3 */ GetModelList(expr: (r: TRecord) => boolean): ICollection<TModel>;
    /** slot 4 */ GetModelAll(): ICollection<TModel>;
}

// ---- ReDriveBattleCore.Reader.IMstIdDetailMstDicHolder<TModel, TRecord>  (TypeDefIndex 875, public interface) ----
export interface IMstIdDetailMstDicHolder<TModel, TRecord> {
    /** slot 0 */ GetMstIdDetailModelsDic(): IReadOnlyDictionary<int, List<TModel>>;
    /** phantom, keeps TRecord in the type */ readonly __record?: TRecord;
}
