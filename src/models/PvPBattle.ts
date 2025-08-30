import { Edge, State, Unit } from "../types/PvPTypes";

const THRESHOLD = 1000; // action threshold for turn meter

function cloneState(s: State): State {
    return {
        step: s.step,
        units: s.units.map(u => ({ ...u })),
    };
}

function canonicalizeUnits(units: Unit[]): Unit[] {
    // Sort by team then id for deterministic hashing
    return [...units].sort((a, b) => (a.team === b.team ? a.id.localeCompare(b.id) : a.team.localeCompare(b.team)));
}

function hashState(s: State): string {
    const u = canonicalizeUnits(s.units).map(u => [u.id, u.team, Math.max(0, Math.round(u.hp)), u.alive ? 1 : 0, Math.round(u.meter)]);
    return JSON.stringify([u, s.step]);
}

function findNextActor(units: Unit[]): { actorIdx: number; dt: number } {
    // Compute the time delta needed for the next unit to reach THRESHOLD
    // dt = min over i of (THRESHOLD - meter[i]) / spd[i]
    // ignore dead units
    let bestIdx = -1;
    let bestDt = Infinity;
    for (let i = 0; i < units.length; i++) {
        const u = units[i];
        if (!u.alive || u.spd <= 0) continue;
        const dt = (THRESHOLD - u.meter) / u.spd;
        if (dt < bestDt) {
            bestDt = dt;
            bestIdx = i;
        }
    }
    return { actorIdx: bestIdx, dt: bestDt };
}

function tickMeters(units: Unit[], dt: number) {
    for (const u of units) {
        if (!u.alive) continue;
        u.meter = Math.min(THRESHOLD, u.meter + u.spd * dt);
    }
}

function resetActorMeter(u: Unit) {
    u.meter = 0; // after acting, reset
}

function aliveEnemies(units: Unit[], team: "A" | "B"): Unit[] {
    return units.filter(u => u.team !== team && u.alive);
}

function allDead(units: Unit[], team: "A" | "B"): boolean {
    return units.filter(u => u.team === team && u.alive).length === 0;
}

function terminal(s: State): boolean {
    return allDead(s.units, "A") || allDead(s.units, "B");
}

function applyAttack(s: State, attackerId: string, targetId: string): State {
    const ns = cloneState(s);
    const attacker = ns.units.find(u => u.id === attackerId)!;
    const target = ns.units.find(u => u.id === targetId)!;
    if (!attacker || !target || !attacker.alive || !target.alive) return ns;

    // simple demo damage model: damage = 200 + 0.5*spd
    const dmg = Math.round(200 + 0.5 * attacker.spd);
    target.hp = Math.max(0, target.hp - dmg);
    if (target.hp <= 0) target.alive = false;

    resetActorMeter(attacker);
    ns.step += 1;
    return ns;
}

function probabilityWeights(targets: Unit[]): number[] {
    // For now, uniform. Customize to weight taunts, lowest HP, etc.
    const n = targets.length;
    return Array(n).fill(1 / Math.max(1, n));
}

// -----------------------------
// Graph build (DAG with merging)
// -----------------------------

type BuildOptions = {
    maxDepth: number;
    maxNodes?: number;
};

type BuiltGraph = {
    nodes: Node[];
    edges: Edge[];
};

export function buildGraph(initial: State, opts: BuildOptions): BuiltGraph {
    console.log(initial, opts)
    const byHash = new Map<string, Node>();
    const edges: Edge[] = [];
    const q: Node[] = [];

    const rootHash = hashState(initial);
    const root: Node = { id: rootHash, state: initial, depth: 0 };
    byHash.set(rootHash, root);
    q.push(root);

    let totalNodes = 1;

    while (q.length) {
        const cur = q.shift()!;
        if (cur.depth >= opts.maxDepth) continue;
        if (terminal(cur.state)) continue;
        if (opts.maxNodes && totalNodes >= opts.maxNodes) break;

        // advance time to next actor deterministically
        const units = cur.state.units.map(u => ({ ...u }));
        const { actorIdx, dt } = findNextActor(units);
        if (actorIdx < 0 || !isFinite(dt) || dt < 0) continue;
        tickMeters(units, dt);
        const actor = units[actorIdx];
        if (!actor.alive) continue;

        const sWithTick: State = { step: cur.state.step, units };

        // Branch to all possible targets (alive enemies)
        const targets = aliveEnemies(units, actor.team);
        if (targets.length === 0) continue;
        const probs = probabilityWeights(targets);

        for (let i = 0; i < targets.length; i++) {
            const t = targets[i];
            const ns = applyAttack(sWithTick, actor.id, t.id);
            const h = hashState(ns);
            let child = byHash.get(h);
            if (!child) {
                child = { id: h, state: ns, depth: cur.depth + 1 };
                byHash.set(h, child);
                q.push(child);
                totalNodes++;
            }
            edges.push({ from: cur.id, to: h, label: `${actor.id} → ${t.id}`, prob: probs[i] });
        }
    }

    return { nodes: [...byHash.values()], edges };
}
