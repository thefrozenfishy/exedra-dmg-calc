import * as d3 from "d3";

export type Unit = {
  name: string;
  breakGauge: number
  actionValue: number
};

export type State = {
  units: Unit[];
  step: number;
};

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
}

export interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}