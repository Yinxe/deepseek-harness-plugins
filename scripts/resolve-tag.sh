#!/usr/bin/env bash
# 按 DSH 版本查插件 tag：./scripts/resolve-tag.sh <插件目录名> <dsh-version>
# 例：./scripts/resolve-tag.sh vision-bridge 0.1.5-rc.1  →  vision-bridge-v1.4.0
# 找不到匹配时报错并以非零退出。只依赖 bash + python3。
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "用法: $0 <插件目录名> <dsh-version>" >&2
  echo "例:   $0 vision-bridge 0.1.5-rc.1" >&2
  exit 2
fi

PLUGIN="$1"
VERSION="$2"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MATRIX="$ROOT/plugins/$PLUGIN/compat.json"

if [ ! -f "$MATRIX" ]; then
  echo "找不到兼容矩阵: $MATRIX" >&2
  exit 1
fi

MATRIX="$MATRIX" VERSION="$VERSION" python3 - <<'PY'
import json, os, re, sys

matrix = json.load(open(os.environ["MATRIX"], encoding="utf-8"))
version = os.environ["VERSION"]

def parse(v):
    v = v.strip().lstrip("v")
    m = re.match(r"^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$", v)
    if not m:
        raise ValueError(f"非法版本号: {v}")
    nums = tuple(int(m.group(i)) for i in (1, 2, 3))
    pre = tuple(
        int(x) if x.isdigit() else x
        for x in (m.group(4).split(".") if m.group(4) else [])
    )
    return nums, pre

def cmp_key(parsed):
    nums, pre = parsed
    # 正式版 > 同元组任何预发布：用标记位保证 (0,有预发布) < (1,无)
    if pre:
        return (nums, 0, tuple((0, x) if isinstance(x, int) else (1, x) for x in pre))
    return (nums, 1, ())

def expand(token):
    """把 ^ ~ = 裸版本 展开成比较器列表"""
    token = token.strip()
    op = ""
    for prefix in (">=", "<=", ">", "<", "=", "^", "~"):
        if token.startswith(prefix):
            op, token = prefix, token[len(prefix):].strip()
            break
    v = parse(token)
    if op in ("", "="):
        return [("=", v)]
    if op in (">=", "<=", ">", "<"):
        return [(op, v)]
    nums, pre = v
    major, minor, patch = nums
    if op == "^":  # ^0.1.5 := >=0.1.5 <0.2.0；^1.2.3 := >=1.2.3 <2.0.0
        upper = ((major + 1, 0, 0) if major else (0, minor + 1, 0) if minor else (0, 0, patch + 1), ())
        return [(">=", v), ("<", upper)]
    if op == "~":  # ~0.1.5 := >=0.1.5 <0.2.0
        return [(">=", v), ("<", ((major, minor + 1, 0), ()))]
    raise ValueError(f"不支持的范围: {token}")

def satisfies(version, range_str):
    v = parse(version)
    key = cmp_key(v)
    for part in range_str.split("||"):
        comps = []
        for token in part.strip().split():
            comps.extend(expand(token))
        # npm 规则近似：带预发布的版本，只有当同 [M,m,p] 的比较器也带预发布时才允许命中
        if v[1]:
            allow = any(c[1][0] == v[0] and c[1][1] for c in comps)
            if not allow:
                continue
        ok = True
        for op, c in comps:
            ck = cmp_key(c)
            if op == "=" and key != ck:
                ok = False
            elif op == ">=" and key < ck:
                ok = False
            elif op == "<=" and key > ck:
                ok = False
            elif op == ">" and key <= ck:
                ok = False
            elif op == "<" and key >= ck:
                ok = False
        if ok:
            return True
    return False

try:
    for row in matrix.get("compat", []):
        if satisfies(version, row["dsh"]):
            print(row["tag"])
            sys.exit(0)
except ValueError as e:
    print(f"错误: {e}", file=sys.stderr)
    sys.exit(2)

print(f"无兼容版本：{matrix.get('plugin', '?')} 不支持 DSH {version}", file=sys.stderr)
sys.exit(1)
PY
