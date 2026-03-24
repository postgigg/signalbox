-- Migration 037: Add opens column to ab_test_results for funnel tracking

ALTER TABLE ab_test_results ADD COLUMN opens INT NOT NULL DEFAULT 0;
