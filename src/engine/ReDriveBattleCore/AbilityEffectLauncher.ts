// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, List, int } from "../runtime";
import type { SkillType } from "../Network/Definition/Battle/SkillType";
import type { AbilityEffectBase } from "./AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "./AbilityEffectInfo";
import type { ActiveSkillBase } from "./ActiveSkillBase";
import type { AffectedUnitNotice } from "./AffectedUnitNotice";
import type { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import type { ProcessTiming } from "./BattleCondition/ProcessTiming";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { EffectOriginType } from "./UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffectLauncher  (TypeDefIndex 280, public class) ----
export class AbilityEffectLauncher {
    /** 0x10 private List<AbilityEffectBase> <AbilityEffectList>k__BackingField */
    _AbilityEffectList: List<AbilityEffectBase> = null!;
    get AbilityEffectList(): List<AbilityEffectBase> { return this.get_AbilityEffectList(); }
    set AbilityEffectList(v: List<AbilityEffectBase>) { this.set_AbilityEffectList(v); }
    /** @rva 0x730C50  public List<AbilityEffectBase> get_AbilityEffectList() { } */
    get_AbilityEffectList(): List<AbilityEffectBase> { return this._AbilityEffectList; /* auto-property */ }
    /** @rva 0x730C60  public void set_AbilityEffectList(List<AbilityEffectBase> value) { } */
    set_AbilityEffectList(value: List<AbilityEffectBase>): void { this._AbilityEffectList = value; /* auto-property */ }
    /** @rva 0x1374620  protected void .ctor() { } */
    ctor(): this { return notPorted("AbilityEffectLauncher..ctor", 0x1374620); }
    /** @rva 0x1374570  public void .ctor(List<AbilityEffectInfo> infoList, bool isIncludeDeadUnitInTarget = False) { } */
    ctor$ListAbilityEffectInfo_bool(infoList: List<AbilityEffectInfo>, isIncludeDeadUnitInTarget?: boolean /* = False */): this { return notPorted("AbilityEffectLauncher..ctor", 0x1374570); }
    /** @rva 0x13743B0  public void .ctor(List<AbilityEffectInfo> infoList, SkillType skillType, int skillMstId) { } */
    ctor$ListAbilityEffectInfo_SkillType_int(infoList: List<AbilityEffectInfo>, skillType: SkillType, skillMstId: int): this { return notPorted("AbilityEffectLauncher..ctor", 0x13743B0); }
    /** @rva 0x13733B0  private void SetAbilityEffectList(List<AbilityEffectInfo> infoList, bool isIncludeDeadUnitInTarget = False) { } */
    SetAbilityEffectList(infoList: List<AbilityEffectInfo>, isIncludeDeadUnitInTarget?: boolean /* = False */): void { return notPorted("AbilityEffectLauncher.SetAbilityEffectList", 0x13733B0); }
    /** @rva 0x1373530  public AffectedUnitNoticeBundle Triggering(ProcessTiming startTiming, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector, ActiveSkillBase triggeringSkill, int attackTargetId = 0, int selectFriendUnitId = 0) { } */
    Triggering$9(startTiming: ProcessTiming, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase, triggeringSkill: ActiveSkillBase, attackTargetId?: int /* = 0 */, selectFriendUnitId?: int /* = 0 */): AffectedUnitNoticeBundle { return notPorted("AbilityEffectLauncher.Triggering", 0x1373530); }
    /** @rva 0x1373550  public static AffectedUnitNoticeBundle Triggering(List<AbilityEffectBase> abilityEffectList, ProcessTiming startTiming, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector, ActiveSkillBase triggeringSkill, int attackTargetId = 0, int selectFriendUnitId = 0) { } */
    static Triggering$10(abilityEffectList: List<AbilityEffectBase>, startTiming: ProcessTiming, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase, triggeringSkill: ActiveSkillBase, attackTargetId?: int /* = 0 */, selectFriendUnitId?: int /* = 0 */): AffectedUnitNoticeBundle { return notPorted("AbilityEffectLauncher.Triggering", 0x1373550); }
    /** @rva 0x1372F70  private static AffectedUnitNotice GetAdditionalRecoveryResult(BattleUnit userUnit, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector) { } */
    static GetAdditionalRecoveryResult(userUnit: BattleUnit, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): AffectedUnitNotice { return notPorted("AbilityEffectLauncher.GetAdditionalRecoveryResult", 0x1372F70); }
}
