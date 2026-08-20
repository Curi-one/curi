#!/usr/bin/env bash
# Apply Curi magic-link email template (link + 6-digit OTP) to hosted Supabase.
#
# Requires:
#   SUPABASE_ACCESS_TOKEN — personal access token from https://supabase.com/dashboard/account/tokens
#   SUPABASE_PROJECT_REF  — project ref (e.g. xoyqmwmudqoncwxvtkps)
#
# Usage:
#   SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=xoyqmwmudqoncwxvtkps ./scripts/apply-supabase-auth-email-template.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_FILE="$ROOT/supabase/templates/magic_link.html"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Missing SUPABASE_ACCESS_TOKEN" >&2
  exit 1
fi

if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "Missing SUPABASE_PROJECT_REF" >&2
  exit 1
fi

if [[ ! -f "$TEMPLATE_FILE" ]]; then
  echo "Template not found: $TEMPLATE_FILE" >&2
  exit 1
fi

PAYLOAD=$(ROOT="$ROOT" python3 - <<'PY'
import json
import os
from pathlib import Path

root = Path(os.environ["ROOT"])
content = (root / "supabase/templates/magic_link.html").read_text()
print(json.dumps({
    "mailer_subjects_magic_link": "Your Curi sign-in link and code",
    "mailer_templates_magic_link_content": content,
    "mailer_otp_length": 6,
}))
PY
)

curl -fsS -X PATCH \
  "https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

echo ""
echo "Applied magic link template (ConfirmationURL + Token) and OTP length 6 to project ${SUPABASE_PROJECT_REF}"
