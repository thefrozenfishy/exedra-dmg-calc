// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AdditionalTurnUnitAct } from "../Act/AdditionalTurnUnitAct";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.AdditionalTurnUnitActAbilityEffect  (TypeDefIndex 1142, public class) ----
export class AdditionalTurnUnitActAbilityEffect extends AbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x18EB3B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x18EB120 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const userUnitId = userUnit._Id; // <>c__DisplayClass2_0
        const actReferee = gameDirector.turnActSystem.actReferee;
        if (actReferee.actList.some(act => act instanceof AdditionalTurnUnitAct && act.actUnitId === userUnitId)) return new AffectedUnitNoticeBundle().ctor(); // b__0
        const currentAct = gameDirector.turnActSystem.actReferee.currentAct;
        if (currentAct instanceof AdditionalTurnUnitAct && currentAct.actUnitId === userUnitId) return new AffectedUnitNoticeBundle().ctor();
        if (userUnit._Condition._CanNotUseSkill) return new AffectedUnitNoticeBundle().ctor();
        if (userUnit._BreakPoint.get_IsBreak()) return new AffectedUnitNoticeBundle().ctor();
        if (userUnit._Condition._IsAdditionalTurnCoolTime) return new AffectedUnitNoticeBundle().ctor();
        const team = dictGet(targetUnitDic, userUnitId)._Team;
        const referee = gameDirector.turnActSystem.actReferee;
        const act = new AdditionalTurnUnitAct().ctor();
        act.actUnitId = userUnitId;
        act.actUnitTeam = team;
        // ActReferee.AddAct(ActBase) inlined in the game
        act.id = ++referee.lastActId;
        referee.AddActToListAndSort(act, false);
        userUnit._Condition._IsAdditionalTurnCoolTime = true;
        return new AffectedUnitNoticeBundle().ctor();
    }
}
