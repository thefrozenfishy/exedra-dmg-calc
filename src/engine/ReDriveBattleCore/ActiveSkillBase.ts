// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { AbilityEffectBase } from "./AbilityEffect/AbilityEffectBase";
import type { AbilityEffectLauncher } from "./AbilityEffectLauncher";
import type { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { SkillDetailMstModel } from "./Model/SkillDetailMstModel";
import type { SkillMstModel } from "./Model/SkillMstModel";

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
    /** @rva 0x13756D0  public void .ctor(int skillMstId) { } */
    ctor$int(skillMstId: int): this { return notPorted("ActiveSkillBase..ctor", 0x13756D0); }
    /** @rva 0x1375880  public void .ctor(int id, int uniqueId, int level, string name, int consumeSp) { } */
    ctor$int_int_int_string_int(id: int, uniqueId: int, level: int, name: string, consumeSp: int): this { return notPorted("ActiveSkillBase..ctor", 0x1375880); }
    /** @rva 0x13758E0  public void .ctor(SkillMstModel skillMst, List<SkillDetailMstModel> skillDetailMstList) { } */
    ctor$SkillMstModel_ListSkillDetailMstModel(skillMst: SkillMstModel, skillDetailMstList: List<SkillDetailMstModel>): this { return notPorted("ActiveSkillBase..ctor", 0x13758E0); }
    /** @rva 0x1375430  protected AffectedUnitNoticeBundle Triggering(GameDirectorBase gameDirector, int attackTargetId, BattleUnit userUnit, int selectFriendUnitId) { } */
    Triggering(gameDirector: GameDirectorBase, attackTargetId: int, userUnit: BattleUnit, selectFriendUnitId: int): AffectedUnitNoticeBundle { return notPorted("ActiveSkillBase.Triggering", 0x1375430); }
    /** @rva -1 slot 4  public abstract AffectedUnitNoticeBundle Execute(GameDirectorBase gameDirector, int attackTargetId, BattleUnit userUnit, int selectFriendUnitId, bool isForcedAct = False); */
    abstract Execute(gameDirector: GameDirectorBase, attackTargetId: int, userUnit: BattleUnit, selectFriendUnitId: int, isForcedAct?: boolean /* = False */): AffectedUnitNoticeBundle;
    /** @rva 0xD2C4A0  public List<AbilityEffectBase> GetAbilityEffectList() { } */
    GetAbilityEffectList(): List<AbilityEffectBase> { return notPorted("ActiveSkillBase.GetAbilityEffectList", 0xD2C4A0); }
    /** @rva 0x1375150  public ActiveSkillBase.TargetSideType GetSkillTargetSideType() { } */
    GetSkillTargetSideType(): ActiveSkillBase_TargetSideType { return notPorted("ActiveSkillBase.GetSkillTargetSideType", 0x1375150); }
}

// ---- ReDriveBattleCore.ActiveSkillBase.TargetSideType  (TypeDefIndex 282, public enum) ----
export const ActiveSkillBase_TargetSideType = {
    OpponentOnly: 1,
    AllyOnly: 2,
    SelfOnly: 3,
    All: 4,
} as const;
export type ActiveSkillBase_TargetSideType = (typeof ActiveSkillBase_TargetSideType)[keyof typeof ActiveSkillBase_TargetSideType];
