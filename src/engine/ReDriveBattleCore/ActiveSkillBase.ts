// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { EffectOriginType } from "./UnitState/EffectOriginType";
import type { ProcessTiming } from "./BattleCondition/ProcessTiming";
import type { SkillMstRecord } from "../Network/Definition/Skill/SkillMstRecord";
import { SkillMstModel } from "./Model/SkillMstModel";
import { SkillDetailMstReader } from "./Reader/SkillDetailMstReader";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import { AbilityEffectLauncher } from "./AbilityEffectLauncher";
import { AbilityEffectInfo } from "./AbilityEffectInfo";
import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { AbilityEffectBase } from "./AbilityEffect/AbilityEffectBase";

import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { SkillDetailMstModel } from "./Model/SkillDetailMstModel";

// ---- ReDriveBattleCore.ActiveSkillBase  (TypeDefIndex 284, public abstract class) ----
export abstract class ActiveSkillBase {
    /** 0x10 private int <Id>k__BackingField */
    _Id: int = 0;
    /** 0x14 private int <UniqueId>k__BackingField */
    _UniqueId: int = 0;
    /** 0x18 private int <Level>k__BackingField */
    _Level: int = 0;
    /** 0x20 private string <Name>k__BackingField */
    _Name: string = null!;
    /** 0x28 private int <ConsumeSP>k__BackingField */
    _ConsumeSP: int = 0;
    /** 0x30 private AbilityEffectLauncher launcher */
    launcher: AbilityEffectLauncher = null!;
    get Id(): int { return this.get_Id(); }
    set Id(v: int) { this.set_Id(v); }
    get UniqueId(): int { return this.get_UniqueId(); }
    set UniqueId(v: int) { this.set_UniqueId(v); }
    get Level(): int { return this.get_Level(); }
    set Level(v: int) { this.set_Level(v); }
    get Name(): string { return this.get_Name(); }
    set Name(v: string) { this.set_Name(v); }
    get ConsumeSP(): int { return this.get_ConsumeSP(); }
    set ConsumeSP(v: int) { this.set_ConsumeSP(v); }
    /** @rva 0x7364F0  public int get_Id() { } */
    get_Id(): int { return this._Id; /* auto-property */ }
    /** @rva 0x739D00  public void set_Id(int value) { } */
    set_Id(value: int): void { this._Id = value; /* auto-property */ }
    /** @rva 0x803350  public int get_UniqueId() { } */
    get_UniqueId(): int { return this._UniqueId; /* auto-property */ }
    /** @rva 0x803540  public void set_UniqueId(int value) { } */
    set_UniqueId(value: int): void { this._UniqueId = value; /* auto-property */ }
    /** @rva 0x763820  public int get_Level() { } */
    get_Level(): int { return this._Level; /* auto-property */ }
    /** @rva 0x8A2240  public void set_Level(int value) { } */
    set_Level(value: int): void { this._Level = value; /* auto-property */ }
    /** @rva 0x7369E0  public string get_Name() { } */
    get_Name(): string { return this._Name; /* auto-property */ }
    /** @rva 0x736A50  public void set_Name(string value) { } */
    set_Name(value: string): void { this._Name = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_ConsumeSP() { } */
    get_ConsumeSP(): int { return this._ConsumeSP; /* auto-property */ }
    /** @rva 0x8A2250  public void set_ConsumeSP(int value) { } */
    set_ConsumeSP(value: int): void { this._ConsumeSP = value; /* auto-property */ }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x13869E0  public void .ctor(int skillMstId) { } */
    ctor$int(skillMstId: int): this {
        const skillMst = BattleMstReaderBase.get_Instance<SkillMstModel, SkillMstRecord, int>(SkillMstModel).GetModelByKey(skillMstId);
        const details = SkillDetailMstReader.GetDetailModelsByMstId(skillMstId);
        if (skillMst == null || details.length === 0) return this; // !Any()
        this._Id = skillMst.SkillMstId;
        this._UniqueId = skillMst.SkillUniqueId;
        this._Level = skillMst.Level;
        this._Name = skillMst.Name;
        this._ConsumeSP = skillMst.SP;
        const infos = AbilityEffectInfo.CreateFromMst$TEnumerable_int<List<SkillDetailMstModel>>(details, this.UniqueId);
        this.launcher = new AbilityEffectLauncher().ctor$ListAbilityEffectInfo_SkillType_int(infos, skillMst.Type, skillMst.SkillMstId);
        return this;
    }
    /** @rva 0x1386B90  public void .ctor(int id, int uniqueId, int level, string name, int consumeSp) { } */
    ctor$int_int_int_string_int(id: int, uniqueId: int, level: int, name: string, consumeSp: int): this {
        this._Name = name;
        this._Id = id;
        this._UniqueId = uniqueId;
        this._Level = level;
        this._ConsumeSP = consumeSp;
        return this;
    }
    /** @rva 0x1386BF0  public void .ctor(SkillMstModel skillMst, List<SkillDetailMstModel> skillDetailMstList) { } */
    ctor$SkillMstModel_ListSkillDetailMstModel(skillMst: SkillMstModel, skillDetailMstList: List<SkillDetailMstModel>): this {
        if (skillMst == null) return this;
        this._Id = skillMst.SkillMstId;
        this._UniqueId = skillMst.SkillUniqueId;
        this._Level = skillMst.Level;
        this._Name = skillMst.Name;
        this._ConsumeSP = skillMst.SP;
        const infos = AbilityEffectInfo.CreateFromMst$TEnumerable_int<List<SkillDetailMstModel>>(skillDetailMstList, this.UniqueId);
        this.launcher = new AbilityEffectLauncher().ctor$ListAbilityEffectInfo_SkillType_int(infos, skillMst.Type, skillMst.SkillMstId);
        return this;
    }
    /** @rva 0x1386740  protected AffectedUnitNoticeBundle Triggering(GameDirectorBase gameDirector, int attackTargetId, BattleUnit userUnit, int selectFriendUnitId) { } */
    Triggering(gameDirector: GameDirectorBase, attackTargetId: int, userUnit: BattleUnit, selectFriendUnitId: int): AffectedUnitNoticeBundle {
        const noticeBundle = new AffectedUnitNoticeBundle().ctor();
        if (gameDirector == null) return noticeBundle;
        const battleUnitDic = gameDirector.get_battleUnitDic();
        const list = this.launcher.AbilityEffectList;
        // <Triggering>b__25_0: an effect on the user's side aimed at a single/one-side unit picks the selected friend
        const targetId = list.some(eff => eff.TargetSide === 0 && (eff.EffectRange === 1 || eff.EffectRange === 2)) ? selectFriendUnitId : attackTargetId;
        const mainTarget = gameDirector.GetTargetBattleUnit(targetId);
        const bundle = new BattleConditionUtils_ConditionCheckDataBundle().ctor();
        bundle._GameDirector = gameDirector;
        bundle._SelfUnit = userUnit;
        bundle._ActorUnit = userUnit;
        bundle._MainTargetUnit = mainTarget;
        bundle._ActorActiveSkill = this;
        bundle._AffectedUnitNoticeBundle = null!;
        bundle._AffectedUnits = null!;
        return AbilityEffectLauncher.Triggering$10(this.launcher.AbilityEffectList, 0 as ProcessTiming, bundle, 1 as EffectOriginType, userUnit, battleUnitDic, gameDirector, this, attackTargetId, selectFriendUnitId);
    }
    /** @rva -1 slot 4  public abstract AffectedUnitNoticeBundle Execute(GameDirectorBase gameDirector, int attackTargetId, BattleUnit userUnit, int selectFriendUnitId, bool isForcedAct = False); */
    abstract Execute(gameDirector: GameDirectorBase, attackTargetId: int, userUnit: BattleUnit, selectFriendUnitId: int, isForcedAct?: boolean /* = False */): AffectedUnitNoticeBundle;
    /** @rva 0xD34000  public List<AbilityEffectBase> GetAbilityEffectList() { } */
    GetAbilityEffectList(): List<AbilityEffectBase> { return this.launcher.AbilityEffectList; }
    /** @rva 0x1386460  public ActiveSkillBase.TargetSideType GetSkillTargetSideType() { } */
    GetSkillTargetSideType(): ActiveSkillBase_TargetSideType {
        const list = this.launcher.AbilityEffectList;
        if (list.every(x => x.TargetSide === 1)) return 1 as ActiveSkillBase_TargetSideType;  // <GetSkillTargetSideType>b__29_0
        if (!list.every(x => x.TargetSide === 0)) return 4 as ActiveSkillBase_TargetSideType; // b__29_1
        return (list.every(x => x.EffectRange === -1) ? 3 : 2) as ActiveSkillBase_TargetSideType; // b__29_2
    }
}

// ---- ReDriveBattleCore.ActiveSkillBase.TargetSideType  (TypeDefIndex 282, public enum) ----
export const ActiveSkillBase_TargetSideType = {
    OpponentOnly: 1,
    AllyOnly: 2,
    SelfOnly: 3,
    All: 4,
} as const;
export type ActiveSkillBase_TargetSideType = (typeof ActiveSkillBase_TargetSideType)[keyof typeof ActiveSkillBase_TargetSideType];
