// App side (not game code): drives a battle the way the game client does, through requests.
// The client sends a TimeForwardRequest whenever it has played the last commands; between waves it sends
// TimeForward (answered with CommandEndWave), then EndWaveRequest and BeginWaveRequest. The director's own
// RunBattleToEnd (the battle-skip path) calls Forward directly, so it never supplies endless enemies nor activates the
// Solo Raid season buff (both happen only in SoloGameDirectorBase.Request(TimeForwardRequest)): Solo Raid stages must
// be driven through this loop.
import type { GameDirectorBase } from "../ReDriveBattleCore/GameDirectorBase";
import { SoloGameDirectorBase } from "../ReDriveBattleCore/SoloGameDirectorBase";
import { TimeForwardRequest } from "../ReDriveBattleCore/Request/TimeForwardRequest";
import { EndWaveRequest } from "../ReDriveBattleCore/Request/EndWaveRequest";
import { BeginWaveRequest } from "../ReDriveBattleCore/Request/BeginWaveRequest";
import { Phase } from "../ReDriveBattleCore/Command/Phase";

/** Sends client requests until the battle reaches Phase.Finish (or maxRequests is hit). Returns the request count. */
export function runBattleLikeClient(director: GameDirectorBase, maxRequests = 100000): number {
    let n = 0;
    while (director.BattlePhase !== Phase.Finish && n < maxRequests) {
        const wave = director instanceof SoloGameDirectorBase ? director.waveReferee : null;
        if (wave != null && wave.isDuringTransition) {
            director.Request(new TimeForwardRequest().ctor(), false, null); // -> CommandEndWave
            director.Request(new EndWaveRequest().ctor(), false, null);
            director.Request(new BeginWaveRequest().ctor(), false, null);
            n += 3;
            continue;
        }
        director.Request(new TimeForwardRequest().ctor(), false, null);
        n++;
    }
    return n;
}
