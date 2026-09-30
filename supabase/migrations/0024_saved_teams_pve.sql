-- Migration: saved teams for the PvE Simulator.
--
-- kind = 'pve' holds one team of 5 slots plus the simulator setup in data.extra: the stage, wave, target
-- and broken choices, the damage dealer, excluded effects, control mode, RNG mode and seed, turn count,
-- every decision taken (manual picks and changed rolls) and the Solo Raid settings/attempts.
-- A long manual run carries a few hundred decisions, so the size bound is raised as well.

ALTER TABLE public.user_saved_teams
  DROP CONSTRAINT saved_team_kind;

ALTER TABLE public.user_saved_teams
  ADD CONSTRAINT saved_team_kind CHECK (kind IN ('single', 'pvp', 'pve'));

ALTER TABLE public.user_saved_teams
  DROP CONSTRAINT saved_team_data_shape;

ALTER TABLE public.user_saved_teams
  ADD CONSTRAINT saved_team_data_shape CHECK (
    jsonb_typeof(data) = 'object' AND octet_length(data::text) <= 400000
  );
