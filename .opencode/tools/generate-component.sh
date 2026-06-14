#!/usr/bin/env bash
# generate-component.sh — Wraps generate-components.py to boot React templates based on active contract
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run Python generator
python "${script_dir}/generate-components.py" "$@"
