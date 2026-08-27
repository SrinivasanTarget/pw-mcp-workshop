#!/usr/bin/env bash
#
# Stage 05 solution: a full checkout driven by the bundled Playwright CLI.
# Selector-based on purpose - snapshot refs (eN) change between runs, CSS
# [data-test=...] selectors do not. Run from the repo root:
#
#   ./scripts/cli-checkout-session.sh
#
set -euo pipefail

BASE_URL="${BASE_URL:-https://playwright-workshop.pages.dev}"

cli() { npx playwright cli "$@"; }

cleanup() { cli close >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "==> Sign in"
cli open "$BASE_URL/login"
cli fill "[data-test=username]" standard_user
cli fill "[data-test=password]" workshop123
cli click "[data-test=login-submit]"

echo "==> Add the Workshop Backpack and open the cart"
cli click "[data-test=add-p-001]"
cli click "a[href='/cart']"

echo "==> Check out"
cli click "[data-test=checkout]"
cli fill "[data-test=firstName]" Ada
cli fill "[data-test=lastName]" Lovelace
cli fill "[data-test=zip]" 00001
cli click "[data-test=place-order]"

echo "==> Confirm the order went through"
cli find "Thanks for your order"

echo "==> Done"
