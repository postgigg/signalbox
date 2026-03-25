#!/bin/bash
# Hook: Block edits that rename existing variables/functions/parameters.
# Runs on PreToolUse for Edit. Exits 2 to block, 0 to allow.

INPUT=$(cat)

OLD_STRING=$(echo "$INPUT" | jq -r '.tool_input.old_string // empty')
NEW_STRING=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')

if [ -z "$OLD_STRING" ] || [ -z "$NEW_STRING" ]; then
  exit 0
fi

# Extract declared variable/function names from old and new strings.
# Catches: const x, let x, var x, function x, type x, interface x
extract_names() {
  echo "$1" | grep -oE '(const|let|var|function|type|interface)\s+[a-zA-Z_][a-zA-Z0-9_]*' | awk '{print $2}' | sort -u
}

OLD_NAMES=$(extract_names "$OLD_STRING")
NEW_NAMES=$(extract_names "$NEW_STRING")

if [ -z "$OLD_NAMES" ]; then
  exit 0
fi

# Count declarations in old vs new. If counts differ, it's not a simple rename.
OLD_COUNT=$(echo "$OLD_NAMES" | wc -l)
NEW_COUNT=$(echo "$NEW_NAMES" | wc -l)

# Check if any old name disappeared and was replaced by a new name
for old_name in $OLD_NAMES; do
  if ! echo "$NEW_NAMES" | grep -qx "$old_name"; then
    # This old variable name is gone from declarations in the new string.
    # Check if the new string still references it (maybe it was just removed, not renamed)
    if ! echo "$NEW_STRING" | grep -qw "$old_name"; then
      # Old name is completely gone. Check if a new declaration appeared.
      for new_name in $NEW_NAMES; do
        if ! echo "$OLD_NAMES" | grep -qx "$new_name"; then
          echo "BLOCKED: Variable rename detected: '$old_name' -> '$new_name'. Do NOT rename existing variables. Fix type errors using type assertions, casts, or narrowing instead. If you must rename, the user must explicitly request it." >&2
          exit 2
        fi
      done
    fi
  fi
done

exit 0
