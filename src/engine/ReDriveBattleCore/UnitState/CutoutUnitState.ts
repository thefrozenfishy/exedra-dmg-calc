// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float, int } from "../../runtime";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "./EffectOriginType";
import type { IBuff } from "./IBuff";
import type { ITurnEndTrigger } from "./ITurnEndTrigger";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.CutoutUnitState  (TypeDefIndex 561, public class) ----
export class CutoutUnitState extends UnitStateBase {  // implements IBuff, ITurnEndTrigger
    static readonly __interfaces: readonly string[] = ['IBuff', 'ITurnEndTrigger'];
    /** private const int DebuffRemoveNumAll */
    static readonly DebuffRemoveNumAll: int = 0;
    /** 0x88 protected int hasteRate */
    hasteRate: int = 0;
    /** 0x8C protected int debuffRemoveNum */
    debuffRemoveNum: int = 0;
    /** 0x90 private bool <IsActivated>k__BackingField */
    _IsActivated: boolean = false;
    /** 0x91 private bool <IsUserUnitLockTurnOrderUnitState>k__BackingField */
    _IsUserUnitLockTurnOrderUnitState: boolean = false;
    get HasteRatio(): float { return this.get_HasteRatio(); }
    get DebuffRemoveNum(): int { return this.get_DebuffRemoveNum(); }
    get IsActivated(): boolean { return this.get_IsActivated(); }
    set IsActivated(v: boolean) { this.set_IsActivated(v); }
    get IsUserUnitLockTurnOrderUnitState(): boolean { return this.get_IsUserUnitLockTurnOrderUnitState(); }
    set IsUserUnitLockTurnOrderUnitState(v: boolean) { this.set_IsUserUnitLockTurnOrderUnitState(v); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15B8060 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("CutoutUnitState.get_IconName", 0x15B8060); }
    /** @rva 0x15B8010 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("CutoutUnitState.get_GiveVisualEffectName", 0x15B8010); }
    /** @rva 0x15B8040  public float get_HasteRatio() { } */
    get_HasteRatio(): float { return notPorted("CutoutUnitState.get_HasteRatio", 0x15B8040); }
    /** @rva 0x9FD270  public int get_DebuffRemoveNum() { } */
    get_DebuffRemoveNum(): int { return this.debuffRemoveNum; /* asm: mov eax, dword ptr [rcx + 0x8c]; ret */ }
    /** @rva 0x9C2CF0  public bool get_IsActivated() { } */
    get_IsActivated(): boolean { return this._IsActivated; /* auto-property */ }
    /** @rva 0x9C2010  public void set_IsActivated(bool value) { } */
    set_IsActivated(value: boolean): void { this._IsActivated = value; /* auto-property */ }
    /** @rva 0xC5CF70  public bool get_IsUserUnitLockTurnOrderUnitState() { } */
    get_IsUserUnitLockTurnOrderUnitState(): boolean { return this._IsUserUnitLockTurnOrderUnitState; /* auto-property */ }
    /** @rva 0xC5D230  public void set_IsUserUnitLockTurnOrderUnitState(bool value) { } */
    set_IsUserUnitLockTurnOrderUnitState(value: boolean): void { this._IsUserUnitLockTurnOrderUnitState = value; /* auto-property */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("CutoutUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B7FD0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("CutoutUnitState..ctor", 0x15B7FD0); }
    /** @rva 0x15B7780 slot 17  public override void SetTriggeringInfo(EffectOriginType effectOrigin, BattleUnit userUnit, bool isOwnSkill = False, bool isConditionActivation = False, BattleType battleType = 1) { } */
    SetTriggeringInfo(effectOrigin: EffectOriginType, userUnit: BattleUnit, isOwnSkill?: boolean /* = False */, isConditionActivation?: boolean /* = False */, battleType?: BattleType /* = 1 */): void { return notPorted("CutoutUnitState.SetTriggeringInfo", 0x15B7780); }
    /** @rva 0x15B7520 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("CutoutUnitState.GetUnitFilterFuncOrder", 0x15B7520); }
    /** @rva 0x15B7840 slot 25  public AffectedUnitNoticeBundle TriggeringAtTurnEnd(BattleUnit userUnit, GameDirectorBase gameDirector) { } */
    TriggeringAtTurnEnd(userUnit: BattleUnit, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("CutoutUnitState.TriggeringAtTurnEnd", 0x15B7840); }
}
