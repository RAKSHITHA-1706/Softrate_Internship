#!/bin/bash
# Script to remove secrets from git history
# This replaces hardcoded secrets with environment variable references

export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch -f --tree-filter '
if [ -f src/pages/auth/GoogleCallback.tsx ]; then
    # Replace the client_id secret
    sed -i "s/770704469828-l8h00ffgghunslvjqts7phlrh3944sm9\.apps\.googleusercontent\.com/REPLACED_WITH_ENV_VAR/g" src/pages/auth/GoogleCallback.tsx
    # Replace the client_secret
    sed -i "s/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/REPLACED_WITH_ENV_VAR/g" src/pages/auth/GoogleCallback.tsx
fi
' HEAD
