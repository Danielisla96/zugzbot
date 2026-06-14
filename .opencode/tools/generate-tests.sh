#!/usr/bin/env bash
# generate-tests.sh — Wraps generate-tests.py to auto-generate test templates from active contract
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run Python generator
python3 "${script_dir}/generate-tests.py" "$@"
