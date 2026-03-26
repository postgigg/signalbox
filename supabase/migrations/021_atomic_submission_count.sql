CREATE OR REPLACE FUNCTION increment_submission_count(widget_uuid UUID, current_limit INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE widgets
  SET submission_count = submission_count + 1
  WHERE id = widget_uuid
    AND (current_limit = -1 OR submission_count < current_limit)
  RETURNING submission_count INTO updated_count;

  RETURN updated_count IS NOT NULL;
END;
$$;
