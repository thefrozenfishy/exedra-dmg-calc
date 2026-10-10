// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, List, int } from "../runtime";
import type { AbilitySourceType } from "../Network/Definition/Battle/AbilitySourceType";
import type { AbilityEffectBase } from "./AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "./AbilityEffectInfo";
import type { AbilityEffectLauncher } from "./AbilityEffectLauncher";
import type { ActiveSkillBase } from "./ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import type { ProcessTiming } from "./BattleCondition/ProcessTiming";
import type { BattleUnit, BattleUnit_TeamType } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { PassiveSkillDetailMstModel } from "./Model/PassiveSkillDetailMstModel";
import type { PassiveSkillMstModel } from "./Model/PassiveSkillMstModel";
import type { UnitStateBase } from "./UnitState/UnitStateBase";

// ---- ReDriveBattleCore.PassiveSkill  (TypeDefIndex 447, public class) ----
export class PassiveSkill {
    /** 0x10 private int <Id>k__BackingField */
    _Id: int = 0;
    /** 0x14 public AbilitySourceType AbilitySourceType */
    AbilitySourceType: AbilitySourceType = 0 as AbilitySourceType;
    /** 0x18 private readonly AbilityEffectLauncher launcher */
    launcher: AbilityEffectLauncher = null!;
    get Id(): int { return this.get_Id(); }
    set Id(v: int) { this.set_Id(v); }
    /** @rva 0x7364F0  public int get_Id() { } */
    get_Id(): int { return this._Id; /* auto-property */ }
    /** @rva 0x739D00  public void set_Id(int value) { } */
    set_Id(value: int): void { this._Id = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x14A3F90  public void .ctor(int id, List<AbilityEffectInfo> infoList) { } */
    ctor$int_ListAbilityEffectInfo(id: int, infoList: List<AbilityEffectInfo>): this { return notPorted("PassiveSkill..ctor", 0x14A3F90); }
    /** @rva 0x14A4010  public void .ctor(PassiveSkillMstModel passiveSkillMstModel, List<PassiveSkillDetailMstModel> passiveSkillDetailMstList, AbilitySourceType abilitySource) { } */
    ctor$PassiveSkillMstModel_ListPassiveSkillDetailMstModel_AbilitySourceType(passiveSkillMstModel: PassiveSkillMstModel, passiveSkillDetailMstList: List<PassiveSkillDetailMstModel>, abilitySource: AbilitySourceType): this { return notPorted("PassiveSkill..ctor", 0x14A4010); }
    /** @rva 0x14A2BD0  public AffectedUnitNoticeBundle Triggering(ProcessTiming startTiming, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering$5(startTiming: ProcessTiming, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("PassiveSkill.Triggering", 0x14A2BD0); }
    /** @rva 0x7F0A70  public List<AbilityEffectBase> GetAbilityEffectList() { } */
    GetAbilityEffectList(): List<AbilityEffectBase> { return notPorted("PassiveSkill.GetAbilityEffectList", 0x7F0A70); }
    /** @rva 0x14A2C20  public static AffectedUnitNoticeBundle Triggering(GameDirectorBase gameDirector, ProcessTiming startTiming, BattleUnit actorUnit, BattleUnit mainTargetUnit, ActiveSkillBase actorActiveSkill, AffectedUnitNoticeBundle noticeBundle) { } */
    static Triggering$6(gameDirector: GameDirectorBase, startTiming: ProcessTiming, actorUnit: BattleUnit, mainTargetUnit: BattleUnit, actorActiveSkill: ActiveSkillBase, noticeBundle: AffectedUnitNoticeBundle): AffectedUnitNoticeBundle { return notPorted("PassiveSkill.Triggering", 0x14A2C20); }
    /** @rva 0x14A1DF0  public static AffectedUnitNoticeBundle TriggeringOnBattleStart(GameDirectorBase gameDirector, Dictionary<int, BattleUnit> triggerUnitDic, Dictionary<int, BattleUnit> receiveUnitDic, bool isStateOnly = False) { } */
    static TriggeringOnBattleStart(gameDirector: GameDirectorBase, triggerUnitDic: Dictionary<int, BattleUnit>, receiveUnitDic: Dictionary<int, BattleUnit>, isStateOnly?: boolean /* = False */): AffectedUnitNoticeBundle { return notPorted("PassiveSkill.TriggeringOnBattleStart", 0x14A1DF0); }
    /** @rva 0x14A19C0  public static void RemoveByBattleUnit(BattleUnit userUnit, Dictionary<int, BattleUnit> battleUnitDic) { } */
    static RemoveByBattleUnit(userUnit: BattleUnit, battleUnitDic: Dictionary<int, BattleUnit>): void { return notPorted("PassiveSkill.RemoveByBattleUnit", 0x14A19C0); }
    /** @rva 0x14A1B70  public static void RemoveByTeam(BattleUnit.TeamType team, Dictionary<int, BattleUnit> battleUnitDic) { } */
    static RemoveByTeam(team: BattleUnit_TeamType, battleUnitDic: Dictionary<int, BattleUnit>): void { return notPorted("PassiveSkill.RemoveByTeam", 0x14A1B70); }
    /** @rva 0x14A3F30  internal static bool <RemoveByBattleUnit>g__StateRemovingPredicate|13_0(UnitStateBase state) { } */
    static $RemoveByBattleUnit$g__StateRemovingPredicate_13_0(state: UnitStateBase): boolean { return notPorted("PassiveSkill.<RemoveByBattleUnit>g__StateRemovingPredicate|13_0", 0x14A3F30); }
}
