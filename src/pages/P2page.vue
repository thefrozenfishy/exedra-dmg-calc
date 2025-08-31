<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as d3 from "d3";
import { getKioku, Kioku } from "../models/Kioku";

export interface Unit {
    kioku: Kioku;
    breakGauge: number
    actionValue: number
    mp: number
};

export interface Node extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    state: State;
    children?: Node[]
}

export interface Edge extends d3.SimulationLinkDatum<Node> {
    source: Node;
    target: Node;
}

const selectedState = ref<State>();

function hashState(state: State) {
    return JSON.stringify([
        ...state.allies.map(u => [u.name, u.breakGauge, u.actionValue]),
        ...state.enemies.map(u => [u.name, u.breakGauge, u.actionValue]),
    ]);
}

class State {
    private allies: Unit[]
    private enemies: Unit[]

    constructor(allies: Kioku[], enemies: Kioku[]) {
        this.allies = allies.map(k => ({
            kioku: k,
            breakGauge: 10,
            actionValue: 0,
            mp: 10
        }))
        this.enemies = enemies.map(k => ({
            kioku: k,
            breakGauge: 10,
            actionValue: 0,
            mp: 10
        }))
    }

    getLowestAv() {
        Math.min(...this.allies.map(c => c.actionValue), ... this.enemies.map(c => c.actionValue))
    }
}

const applyToBoth = (state: State, func: Function): Any[] => [...state.allies[func], ...state.enemies[func]]

function buildTree(): Node {
    const cache = new Map<string, Node>();

    function makeNode(state: State): Node {
        const h = hashState(state);
        let n = cache.get(h);
        if (!n) {
            n = { id: h, state, label: "" };
            cache.set(h, n);
        }
        console.log("retuning", n)
        return n;
    }



    const createTree = (state: State): Node => {
        const minAv = state.getLowestAv()




        const children: Node[] = []
        return { id: "", label: "root", state, children }
    }

    const allies: Unit[] = [{
        kioku: Kioku({name: "Brilliant Beam" }),
        breakGauge: 10,
        actionValue: 0,
        mp: 10
    }, {
        name: "Purple Will-o'-Wisp",
        breakGauge: 10,
        actionValue: 10,
        mp: 10
    }]
    const enemies: Unit[] = [{
        name: "Tiro Finale",
        breakGauge: 10,
        actionValue: 0,
        mp: 10
    }, {
        name: "Time Stop Strike",
        breakGauge: 10,
        actionValue: 0,
        mp: 10
    }]

    return createTree({ allies, enemies });
}

onMounted(() => {
    const width = 900, height = 900;
    const root = d3.hierarchy(buildTree(), d => d.children);
    const treeLayout = d3.tree<Node>().size([width, height - 50]);
    treeLayout(root);

    const svg = d3.select("#tree")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const links = root.links();

    // edges
    svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("x1", d => d.source.x!)
        .attr("y1", d => d.source.y!)
        .attr("x2", d => d.target.x!)
        .attr("y2", d => d.target.y!)
        .attr("stroke", "#aaa");

    // edge labels
    svg.append("g")
        .selectAll("text")
        .data(links)
        .join("text")
        .text(d => `Action`) // replace with real action if needed
        .attr("x", d => (d.source.x! + d.target.x!) / 2)
        .attr("y", d => (d.source.y! + d.target.y!) / 2 - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "#555");

    // nodes
    svg.append("g")
        .selectAll("circle")
        .data(root.descendants())
        .join("circle")
        .attr("r", 20)
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!)
        .attr("fill", d => d.depth === 0 ? "#60a5fa" : "#a78bfa")
        .on("click", (_, d) => selectedState.value = d.data.state);

    // node labels
    svg.append("g")
        .selectAll("text.node-label")
        .data(root.descendants())
        .join("text")
        .attr("class", "node-label")
        .text(d => `Turn ${d.data.label}`)
        .attr("x", d => d.x!)
        .attr("y", d => d.y!)
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#000");
});
</script>

<template>
    <div class="container">
        <!-- Left: game visualizer -->
        <div class="left-panel">
            <h2>Game State</h2>
            <pre>{{ selectedState }}</pre>
        </div>

        <!-- Right: tree -->
        <div class="right-panel">
            <h2>Action Tree</h2>
            <div id="tree"></div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
}

.left-panel {
    flex-shrink: 0;
    padding: 20px;
    border-right: 1px solid #ccc;
    overflow-y: auto;
}

.right-panel {
    flex-shrink: 0;
    padding: 20px;
    overflow-y: auto;
}

#tree svg {
    border: 1px solid #ccc;
    border-radius: 8px;
}

circle {
    cursor: pointer;
}
</style>
