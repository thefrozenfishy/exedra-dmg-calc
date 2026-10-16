// Client side of the master-data boundary (namespace ReDrive.Model / A2.ResourceManager, outside ReDriveBattleCore).
// Ported from the shared generic instances in the 3.19.0 client; the data source is the server master list, which
// the app has as src/assets/base_data/get<Name>MstList.json (rows in server order). Bound in src/engine/adapter/MasterData.ts.

import type { ICollection, IReadOnlyDictionary, List, int } from "../../runtime";
import type { IBattleMstReader, IMstIdDetailMstDicHolder } from "../../ReDriveBattleCore/Reader/IBattleMstReader";

// ---- ReDrive.Model.BattleMstModelRepositoryBase<TRepository, TModel, TRecord, TKey>  (TypeDefIndex 9811) ----
//      : A2.ResourceManager.ResourceMstRepository<TRepository, TModel, TRecord, TKey>, IBattleMstReader<TModel, TRecord, TKey>
export class BattleMstModelRepositoryBase<TModel, TRecord, TKey> implements IBattleMstReader<TModel, TRecord, TKey> {
    static readonly __interfaces: readonly string[] = ['IBattleMstReader'];
    /** ResourceMstRepository: the records (server order) and the record cache keyed by the unique key (field 0x10). */
    private records: readonly TRecord[];
    private readonly recordDic: Map<TKey, TRecord> = new Map();
    /** ResourceMstRepository model cache (0x20): Dictionary<TKey, TModel>, filled by UpdateCache in record order. */
    private modelCache: Map<TKey, TModel> | null = null;
    private readonly keyOf: (r: TRecord) => TKey;
    private readonly createFn: (r: TRecord) => TModel;

    constructor(records: readonly TRecord[], keyOf: (r: TRecord) => TKey, create: (r: TRecord) => TModel) {
        this.records = records;
        this.keyOf = keyOf;
        this.createFn = create;
        for (const r of records) this.recordDic.set(keyOf(r), r);
    }

    /** App side, not in the client: appends records the app makes up (the Kioku Grid bench's dummy stage, enemies
     *  and styles, battle/EngineBench.ts). A record whose key is already present replaces nothing (added keys are new). */
    AddRecords(records: readonly TRecord[]): void {
        const fresh = records.filter(r => !this.recordDic.has(this.keyOf(r)));
        if (!fresh.length) return;
        this.records = [...this.records, ...fresh];
        for (const r of fresh) this.recordDic.set(this.keyOf(r), r);
        this.modelCache = null;
        this.fieldIndex.clear();
    }

    // ---- ResourceMstRepository<TRepository, TModel, TRecord, TKey> ----
    /** slot 13: Create(record) (each repository news its model) */
    Create(record: TRecord): TModel { return this.createFn(record); }
    /** 0x34c0610 */
    GetRecords(): readonly TRecord[] { return this.records; }
    /** 0x34c0260 */
    GetRecordByKey(key: TKey): TRecord | null { return this.recordDic.get(key) ?? null; }
    /** 0x34bde60: UpdateCache(); modelCache.Values.ToList() */
    GetAll(): List<TModel> {
        if (this.modelCache == null) {
            this.modelCache = new Map();
            for (const r of this.records) this.modelCache.set(this.keyOf(r), this.Create(r));
        }
        return [...this.modelCache.values()];
    }

    // ---- BattleMstModelRepositoryBase (IBattleMstReader) ----
    /** 0x452c2e0: GetRecords().Select(Create).ToList() */
    GetModelAll(): ICollection<TModel> { return this.GetRecords().map(r => this.Create(r)); }
    /** 0x452c500: record = GetRecordByKey(key); record == null ? null : Create(record) */
    GetModelByKey(key: TKey): TModel {
        const record = this.GetRecordByKey(key);
        if (record == null) return null as TModel;
        return this.Create(record);
    }
    /** 0x452ce20: GetRecords().Where(expr).Select(Create).FirstOrDefault() */
    GetModel(expr: (r: TRecord) => boolean): TModel {
        for (const r of this.GetRecords()) if (expr(r)) return this.Create(r);
        return null as TModel;
    }
    /** 0x452c920: foreach key: list.Add(Create(GetRecordByKey(key))) (no null check) */
    GetModelListByKeys(keyList: ICollection<TKey>): ICollection<TModel> {
        const list: TModel[] = [];
        for (const key of keyList) list.push(this.Create(this.GetRecordByKey(key) as TRecord));
        return list;
    }
    /** 0x452cd20 slot 20 (virtual): GetRecords().Where(expr).Select(Create).ToList() */
    GetModelList(expr: (r: TRecord) => boolean): ICollection<TModel> {
        // App side: runtime.indexHint - scan only the records with the hinted value (same records, same order)
        const hint = (expr as any).$index as [string, unknown] | undefined;
        const source = hint ? this.recordsWith(hint[0], hint[1]) : this.GetRecords();
        return source.filter(expr).map(r => this.Create(r));
    }

    /** App side: records whose `field` is `value`, in record order (an index per field, built on first use). */
    private readonly fieldIndex = new Map<string, Map<unknown, TRecord[]>>();
    private recordsWith(field: string, value: unknown): readonly TRecord[] {
        let index = this.fieldIndex.get(field);
        if (index === undefined) {
            index = new Map();
            for (const r of this.records) {
                const v = (r as any)[field];
                const list = index.get(v);
                if (list) list.push(r);
                else index.set(v, [r]);
            }
            this.fieldIndex.set(field, index);
        }
        return index.get(value) ?? [];
    }
}

// ---- ReDrive.Model.Skill.SkillDetailMstModelRepository / ReDrive.Model.PassiveSkill.PassiveSkillDetailMstModelRepository ----
// Both also implement IMstIdDetailMstDicHolder (0x19AE830 / PassiveSkillDetail twin):
//   mstIdDetailModelsDic ??= GetAll().GroupBy(m => record 0x14).ToDictionary(g => g.Key, g => g.ToList())
export class DetailMstModelRepository<TModel extends { record: TRecord }, TRecord> extends BattleMstModelRepositoryBase<TModel, TRecord, int>
    implements IMstIdDetailMstDicHolder<TModel, TRecord> {
    static readonly __interfaces: readonly string[] = ['IMstIdDetailMstDicHolder'];
    /** 0x38 private Dictionary<int, List<TModel>> mstIdDetailModelsDic */
    private mstIdDetailModelsDic: Map<int, List<TModel>> | null = null;
    private readonly mstIdOf: (r: TRecord) => int;
    constructor(records: readonly TRecord[], keyOf: (r: TRecord) => int, create: (r: TRecord) => TModel, mstIdOf: (r: TRecord) => int) {
        super(records, keyOf, create);
        this.mstIdOf = mstIdOf;
    }
    /** App side (see BattleMstModelRepositoryBase.AddRecords): the grouping is rebuilt with the new records. */
    override AddRecords(records: readonly TRecord[]): void {
        super.AddRecords(records);
        this.mstIdDetailModelsDic = null;
    }
    GetMstIdDetailModelsDic(): IReadOnlyDictionary<int, List<TModel>> {
        if (this.mstIdDetailModelsDic == null) {
            const dic = new Map<int, List<TModel>>(); // GroupBy keeps first-occurrence order and element order
            for (const m of this.GetAll()) {
                const k = this.mstIdOf(m.record); // <GetMstIdDetailModelsDic>b__5_0 (0x934310 -> getter of record 0x14)
                let g = dic.get(k);
                if (g === undefined) dic.set(k, g = []);
                g.push(m);
            }
            this.mstIdDetailModelsDic = dic;
        }
        return this.mstIdDetailModelsDic;
    }
}
