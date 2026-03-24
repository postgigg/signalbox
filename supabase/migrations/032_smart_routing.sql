-- Migration 032: Smart routing strategy support
-- Extends lead_routing_rules with multiple routing strategies

-- Add strategy columns to lead_routing_rules
ALTER TABLE lead_routing_rules
  ADD COLUMN routing_strategy TEXT NOT NULL DEFAULT 'direct'
    CHECK (routing_strategy IN ('direct', 'skill', 'geographic', 'value', 'round_robin', 'availability')),
  ADD COLUMN match_country TEXT[],
  ADD COLUMN match_region TEXT[],
  ADD COLUMN match_skill_tags TEXT[],
  ADD COLUMN match_score_min INT CHECK (match_score_min IS NULL OR (match_score_min BETWEEN 0 AND 100)),
  ADD COLUMN match_score_max INT CHECK (match_score_max IS NULL OR (match_score_max BETWEEN 0 AND 100)),
  ADD COLUMN round_robin_pool UUID[],
  ADD COLUMN round_robin_weights JSONB,
  ADD COLUMN fallback_strategy TEXT NOT NULL DEFAULT 'none'
    CHECK (fallback_strategy IN ('none', 'round_robin', 'unassigned'));

-- Allow null assign_to_member_id for dynamic strategies (skill, geographic, round_robin, availability)
ALTER TABLE lead_routing_rules ALTER COLUMN assign_to_member_id DROP NOT NULL;
