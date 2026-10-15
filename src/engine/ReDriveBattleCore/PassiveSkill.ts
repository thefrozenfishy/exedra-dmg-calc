// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { EffectOriginType } from "./UnitState/EffectOriginType";
import type { INeutralState } from "./UnitState/INeutralState";
import { StateAbilityEffect } from "./AbilityEffect/StateAbilityEffect";
import { CharacterParameter } from "./CharacterParameter";
import { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import { BattleStartPassiveSkillTriggerInfo } from "./BattleStartPassiveSkillTriggerInfo";
import type { AffectedUnitNotice } from "./AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import { AbilityEffectLauncher } from "./AbilityEffectLauncher";
import { AbilityEffectInfo } from "./AbilityEffectInfo";
import { dictGet, isImpl, notPorted, orderByDescending } from "../runtime";
import type { Dictionary, List, int } from "../runtime";
import type { AbilitySourceType } from "../Network/Definition/Battle/AbilitySourceType";
import type { AbilityEffectBase } from "./AbilityEffect/AbilityEffectBase";

import type { ActiveSkillBase } from "./ActiveSkillBase";

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
    /** @rva 0x7354F0  public int get_Id() { } */
    get_Id(): int { return this._Id; /* auto-property */ }
    /** @rva 0x738D00  public void set_Id(int value) { } */
    set_Id(value: int): void { this._Id = value; /* auto-property */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x14CA760  public void .ctor(int id, List<AbilityEffectInfo> infoList) { } */
    ctor$int_ListAbilityEffectInfo(id: int, infoList: List<AbilityEffectInfo>): this {
        this._Id = id;
        this.launcher = new AbilityEffectLauncher().ctor$ListAbilityEffectInfo_bool(infoList, true);
        return this;
    }
    /** @rva 0x14CA7E0  public void .ctor(PassiveSkillMstModel passiveSkillMstModel, List<PassiveSkillDetailMstModel> passiveSkillDetailMstList, AbilitySourceType abilitySource) { } */
    ctor$PassiveSkillMstModel_ListPassiveSkillDetailMstModel_AbilitySourceType(passiveSkillMstModel: PassiveSkillMstModel, passiveSkillDetailMstList: List<PassiveSkillDetailMstModel>, abilitySource: AbilitySourceType): this {
        if (passiveSkillMstModel == null) return this;
        this._Id = passiveSkillMstModel.PassiveSkillMstId;
        this.AbilitySourceType = abilitySource;
        const infos = AbilityEffectInfo.CreateFromMst$ListPassiveSkillDetailMstModel_AbilitySourceType_string(passiveSkillDetailMstList, abilitySource, passiveSkillMstModel.SkillButtonIcon);
        this.launcher = new AbilityEffectLauncher().ctor$ListAbilityEffectInfo_bool(infos, true);
        return this;
    }
    /** @rva 0x14C93A0  public AffectedUnitNoticeBundle Triggering(ProcessTiming startTiming, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering$5(startTiming: ProcessTiming, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        if (this.launcher == null) return null!;
        return this.launcher.Triggering$9(startTiming, conditionCheckDataBundle, 2 as EffectOriginType, userUnit, targetUnitDic, gameDirector, null!, 0, 0);
    }
    /** @rva 0x7EFA70  public List<AbilityEffectBase> GetAbilityEffectList() { } */
    GetAbilityEffectList(): List<AbilityEffectBase> { return this.launcher.AbilityEffectList; }
    /** @rva 0x14C93F0  public static AffectedUnitNoticeBundle Triggering(GameDirectorBase gameDirector, ProcessTiming startTiming, BattleUnit actorUnit, BattleUnit mainTargetUnit, ActiveSkillBase actorActiveSkill, AffectedUnitNoticeBundle noticeBundle) { } */
    static Triggering$6(gameDirector: GameDirectorBase, startTiming: ProcessTiming, actorUnit: BattleUnit, mainTargetUnit: BattleUnit, actorActiveSkill: ActiveSkillBase, noticeBundle: AffectedUnitNoticeBundle): AffectedUnitNoticeBundle {
        // DisplayClass11_0 { battleUnitDic, addNoticeBundle, startTiming, gameDirector }
        if (startTiming === 1) {
            const dic = gameDirector.battleUnitBundle.dic;
            return PassiveSkill.TriggeringOnBattleStart(gameDirector, dic, dic, false);
        }
        let addNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        const battleUnitDic = gameDirector.battleUnitBundle.dic;
        const affectedUnits: List<BattleUnit> = noticeBundle == null ? null!
            : noticeBundle.GetNoticeList().map(x => dictGet(battleUnitDic, x.AffectedUnitId)); // <Triggering>b__0
        for (const unit of [...battleUnitDic.values()].filter(u => !u.IsDead)) { // <Triggering>b__11_2
            const conditionCheckDataBundle = newBundle(gameDirector, unit, actorUnit, mainTargetUnit, actorActiveSkill, noticeBundle, affectedUnits);
            for (const ps of unit.PassiveSkills) { // Array.ForEach(DisplayClass11_1.<Triggering>b__3)
                const r = ps.launcher != null ? ps.launcher.Triggering$9(startTiming, conditionCheckDataBundle, 2 as EffectOriginType, unit, battleUnitDic, gameDirector, null!, 0, 0) : null!;
                addNoticeBundle = AffectedUnitNoticeBundle.op_Addition(addNoticeBundle, r);
            }
        }
        for (const unit of [...battleUnitDic.values()].filter(u => !u.IsDead)) { // <Triggering>b__11_4
            const conditionCheckDataBundle = newBundle(gameDirector, unit, actorUnit, mainTargetUnit, actorActiveSkill, noticeBundle, affectedUnits);
            for (const ps of unit.PassiveSkills) { // Array.ForEach(DisplayClass11_2.<Triggering>b__5): always ProcessTiming.AfterProcess
                const r = ps.launcher != null ? ps.launcher.Triggering$9(9 as ProcessTiming, conditionCheckDataBundle, 2 as EffectOriginType, unit, battleUnitDic, gameDirector, null!, 0, 0) : null!;
                addNoticeBundle = AffectedUnitNoticeBundle.op_Addition(addNoticeBundle, r);
            }
        }
        // <Triggering>b__11_1: Madoka (MstId 1001, style 11370101): her own (AbilitySourceType 1) passives trigger again with the
        // recovery she just received from this pass when the original action did not already heal her. Game special case.
        for (const madoka of [...battleUnitDic.values()].filter(u => u.MstId === 1001 && u.BattleParameter instanceof CharacterParameter && u.BattleParameter.StyleMstId === 11370101)) {
            let alreadyRecovered = false;
            if (noticeBundle != null) {
                const n = noticeBundle.GetNoticeList().find(notice => notice.AffectedUnitId === madoka.Id) ?? null; // DisplayClass11_3 b__6
                if (n != null) alreadyRecovered = n.IsReceivedRecovery;
            }
            let recovered = false;
            let recoveryNotice: AffectedUnitNotice = null!;
            if (addNoticeBundle != null) {
                recoveryNotice = addNoticeBundle.GetNoticeList().find(notice => notice.AffectedUnitId === madoka.Id) ?? null!; // b__7
                if (recoveryNotice != null) recovered = recoveryNotice.IsReceivedRecovery;
            }
            if (recovered && !alreadyRecovered) {
                const recoveryBundle = new AffectedUnitNoticeBundle().ctor();
                recoveryBundle.Add(recoveryNotice);
                for (const ps of madoka.PassiveSkills.filter(p => p.AbilitySourceType === 1)) { // <Triggering>b__11_8
                    const conditionCheckDataBundle = newBundle(gameDirector, madoka, actorUnit, mainTargetUnit, actorActiveSkill, recoveryBundle, affectedUnits);
                    addNoticeBundle = AffectedUnitNoticeBundle.op_Addition(addNoticeBundle, ps.Triggering$5(startTiming, conditionCheckDataBundle, madoka, battleUnitDic, gameDirector));
                }
            }
        }
        for (const unit of gameDirector.battleUnitBundle.dic.values()) unit.Condition.ResetZoneStatePatternMstId();
        return addNoticeBundle;
    }
    /** @rva 0x14C85C0  public static AffectedUnitNoticeBundle TriggeringOnBattleStart(GameDirectorBase gameDirector, Dictionary<int, BattleUnit> triggerUnitDic, Dictionary<int, BattleUnit> receiveUnitDic, bool isStateOnly = False) { } */
    static TriggeringOnBattleStart(gameDirector: GameDirectorBase, triggerUnitDic: Dictionary<int, BattleUnit>, receiveUnitDic: Dictionary<int, BattleUnit>, isStateOnly: boolean = false): AffectedUnitNoticeBundle {
        let noticeBundle = new AffectedUnitNoticeBundle().ctor();
        let infos: BattleStartPassiveSkillTriggerInfo[] = [];
        for (const unit of [...triggerUnitDic.values()].filter(u => !u.IsDead)) { // <TriggeringOnBattleStart>b__12_1
            const bundle = new BattleConditionUtils_ConditionCheckDataBundle().ctor();
            bundle._GameDirector = gameDirector;
            bundle._SelfUnit = unit;
            const passiveSkills = unit.PassiveSkills;
            for (let i = 0; i < passiveSkills.length; i++) {
                const ps = passiveSkills[i];
                let effects = ps.launcher.AbilityEffectList;
                if (isStateOnly) effects = effects.filter(effect => effect instanceof StateAbilityEffect); // b__12_2
                for (const effect of effects) {
                    const info = new BattleStartPassiveSkillTriggerInfo();
                    info.userUnit = unit;
                    info.psMstId = ps.Id;
                    info.conditionCheckDataBundle = bundle;
                    info.abilityEffect = effect;
                    infos.push(info);
                }
            }
        }
        infos = orderByDescending(infos, info => info.TriggerPriority); // <TriggeringOnBattleStart>b__12_0 (stable)
        const list: AbilityEffectBase[] = [];
        for (const info of infos) {
            list.push(info.abilityEffect);
            noticeBundle = AffectedUnitNoticeBundle.op_Addition(noticeBundle, AbilityEffectLauncher.Triggering$10(list, 1 as ProcessTiming, info.conditionCheckDataBundle, 2 as EffectOriginType, info.userUnit, receiveUnitDic, gameDirector, null!, 0, 0));
            list.length = 0; // Clear()
        }
        for (const info of infos) {
            list.push(info.abilityEffect);
            noticeBundle = AffectedUnitNoticeBundle.op_Addition(noticeBundle, AbilityEffectLauncher.Triggering$10(list, 9 as ProcessTiming, info.conditionCheckDataBundle, 2 as EffectOriginType, info.userUnit, receiveUnitDic, gameDirector, null!, 0, 0));
            list.length = 0;
        }
        for (const unit of gameDirector.battleUnitBundle.dic.values()) unit.Condition.ResetZoneStatePatternMstId();
        return noticeBundle;
    }
    /** @rva 0x14C8190  public static void RemoveByBattleUnit(BattleUnit userUnit, Dictionary<int, BattleUnit> battleUnitDic) { } */
    static RemoveByBattleUnit(userUnit: BattleUnit, battleUnitDic: Dictionary<int, BattleUnit>): void {
        for (const unit of battleUnitDic.values()) {
            unit.Condition.RemoveUnitState$BattleUnit_EffectOriginType_BattleUnit_FuncUnitStateBasebool(unit, 2 as EffectOriginType, userUnit, PassiveSkill.$RemoveByBattleUnit$g__StateRemovingPredicate_13_0);
        }
    }
    /** @rva 0x14C8340  public static void RemoveByTeam(BattleUnit.TeamType team, Dictionary<int, BattleUnit> battleUnitDic) { } */
    static RemoveByTeam(team: BattleUnit_TeamType, battleUnitDic: Dictionary<int, BattleUnit>): void {
        for (const unit of [...battleUnitDic.values()].filter(u => u.Team === team && !u.IsDead)) // DisplayClass14_0 b__0
            PassiveSkill.RemoveByBattleUnit(unit, battleUnitDic);
    }
    /** @rva 0x14CA700  internal static bool <RemoveByBattleUnit>g__StateRemovingPredicate|13_0(UnitStateBase state) { } */
    static $RemoveByBattleUnit$g__StateRemovingPredicate_13_0(state: UnitStateBase): boolean {
        if (!isImpl(state, "INeutralState")) return true;
        return !(state as unknown as INeutralState).DontRemoveOnPassiveSkillUserLeaveBattle;
    }
}

/** new ConditionCheckDataBundle { ... } as built inline in PassiveSkill.Triggering (not a game method). */
function newBundle(gameDirector: GameDirectorBase, self: BattleUnit, actor: BattleUnit, mainTarget: BattleUnit, actorActiveSkill: ActiveSkillBase, noticeBundle: AffectedUnitNoticeBundle, affectedUnits: List<BattleUnit>): BattleConditionUtils_ConditionCheckDataBundle {
    const b = new BattleConditionUtils_ConditionCheckDataBundle().ctor();
    b._GameDirector = gameDirector;
    b._SelfUnit = self;
    b._ActorUnit = actor;
    b._MainTargetUnit = mainTarget;
    b._ActorActiveSkill = actorActiveSkill;
    b._AffectedUnitNoticeBundle = noticeBundle;
    b._AffectedUnits = affectedUnits;
    return b;
}
