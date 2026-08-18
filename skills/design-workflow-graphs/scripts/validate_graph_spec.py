#!/usr/bin/env python3
"""Validate a design-workflow-graphs JSON Graph Spec."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict, deque
from pathlib import Path
from typing import Any

IDENTIFIER = re.compile(r"^[a-z][a-z0-9_-]*$")
NODE_KINDS = {"task", "router", "join", "approval", "side_effect", "terminal"}
MERGE_POLICIES = {"replace", "append", "reduce", "reject-conflict"}
JOIN_STRATEGIES = {"all", "any", "quorum"}
REQUIRED_EVENTS = {
    "node_start",
    "node_end",
    "edge_selected",
    "state_delta",
    "retry",
    "latency",
    "error",
}


def is_mapping(value: Any) -> bool:
    return isinstance(value, dict)


def is_list(value: Any) -> bool:
    return isinstance(value, list)


def validate_document(document: Any) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if not is_mapping(document):
        return ["top level must be a JSON object"], warnings

    if str(document.get("schema_version", "")) != "1":
        errors.append("schema_version must be \"1\"")

    graph = document.get("graph")
    if not is_mapping(graph):
        return errors + ["graph must be a mapping"], warnings

    graph_id = graph.get("id")
    if not isinstance(graph_id, str) or not IDENTIFIER.fullmatch(graph_id):
        errors.append("graph.id must be a lowercase identifier")
    if not isinstance(graph.get("goal"), str) or not graph["goal"].strip():
        errors.append("graph.goal must be a non-empty string")

    controls = graph.get("controls")
    if not is_mapping(controls):
        warnings.append("graph.controls should define max_steps and timeout")
    else:
        max_steps = controls.get("max_steps")
        if not isinstance(max_steps, int) or isinstance(max_steps, bool) or max_steps < 1:
            errors.append("graph.controls.max_steps must be a positive integer")
        if not isinstance(controls.get("timeout"), str) or not controls["timeout"].strip():
            errors.append("graph.controls.timeout must be a non-empty string")

    state_items = document.get("state", [])
    if not is_list(state_items):
        errors.append("state must be a list")
        state_items = []

    state_names: set[str] = set()
    has_sensitive_state = False
    for index, field in enumerate(state_items):
        label = f"state[{index}]"
        if not is_mapping(field):
            errors.append(f"{label} must be a mapping")
            continue
        name = field.get("name")
        if not isinstance(name, str) or not IDENTIFIER.fullmatch(name):
            errors.append(f"{label}.name must be a lowercase identifier")
            continue
        if name in state_names:
            errors.append(f"duplicate state field: {name}")
        state_names.add(name)
        if not isinstance(field.get("description"), str) or not field["description"].strip():
            errors.append(f"state field {name} needs a description")
        if not isinstance(field.get("owner"), str) or not field["owner"].strip():
            errors.append(f"state field {name} needs an owner")
        if field.get("merge") not in MERGE_POLICIES:
            errors.append(f"state field {name} has an invalid merge policy")
        for flag in ("sensitive", "persist"):
            if not isinstance(field.get(flag), bool):
                errors.append(f"state field {name}.{flag} must be boolean")
        if field.get("sensitive") is True:
            has_sensitive_state = True

    node_items = document.get("nodes")
    if not is_list(node_items) or not node_items:
        return errors + ["nodes must be a non-empty list"], warnings

    nodes: dict[str, dict[str, Any]] = {}
    for index, node in enumerate(node_items):
        label = f"nodes[{index}]"
        if not is_mapping(node):
            errors.append(f"{label} must be a mapping")
            continue
        node_id = node.get("id")
        if not isinstance(node_id, str) or not IDENTIFIER.fullmatch(node_id):
            errors.append(f"{label}.id must be a lowercase identifier")
            continue
        if node_id in nodes:
            errors.append(f"duplicate node id: {node_id}")
        nodes[node_id] = node
        kind = node.get("kind")
        if kind not in NODE_KINDS:
            errors.append(f"node {node_id} has an invalid kind")
        if not isinstance(node.get("purpose"), str) or not node["purpose"].strip():
            errors.append(f"node {node_id} needs a purpose")
        for key in ("reads", "writes", "side_effects"):
            values = node.get(key)
            if not is_list(values) or not all(isinstance(item, str) for item in values):
                errors.append(f"node {node_id}.{key} must be a list of strings")
        for key in ("reads", "writes"):
            values = node.get(key, [])
            if is_list(values):
                unknown = sorted({item for item in values if item not in state_names})
                if unknown:
                    errors.append(f"node {node_id}.{key} references unknown state: {', '.join(unknown)}")
        if not isinstance(node.get("idempotent"), bool):
            errors.append(f"node {node_id}.idempotent must be boolean")
        if not isinstance(node.get("timeout"), str) or not node["timeout"].strip():
            errors.append(f"node {node_id}.timeout must be a non-empty string")
        retry = node.get("retry")
        max_attempts = None
        if not is_mapping(retry):
            errors.append(f"node {node_id}.retry must be a mapping")
        else:
            max_attempts = retry.get("max_attempts")
            if not isinstance(max_attempts, int) or isinstance(max_attempts, bool) or max_attempts < 1:
                errors.append(f"node {node_id}.retry.max_attempts must be a positive integer")
        side_effects = node.get("side_effects", [])
        if side_effects and max_attempts and max_attempts > 1 and node.get("idempotent") is not True:
            errors.append(f"node {node_id} retries non-idempotent side effects")
        if kind == "side_effect" and not side_effects:
            warnings.append(f"side-effect node {node_id} declares no side effects")
        if kind == "join":
            join = node.get("join")
            if not is_mapping(join) or join.get("strategy") not in JOIN_STRATEGIES:
                errors.append(f"join node {node_id} needs a valid join.strategy")
            elif join.get("strategy") == "quorum":
                quorum = join.get("quorum")
                if not isinstance(quorum, int) or isinstance(quorum, bool) or quorum < 1:
                    errors.append(f"join node {node_id} needs a positive join.quorum")

    entry = graph.get("entry")
    if entry not in nodes:
        errors.append("graph.entry must reference an existing node")
    terminals_raw = graph.get("terminals")
    if not is_list(terminals_raw) or not terminals_raw:
        errors.append("graph.terminals must be a non-empty list")
        terminals: set[str] = set()
    else:
        terminals = {item for item in terminals_raw if isinstance(item, str)}
        if len(terminals) != len(terminals_raw):
            errors.append("graph.terminals must contain unique string identifiers")
        unknown_terminals = sorted(terminals - nodes.keys())
        if unknown_terminals:
            errors.append(f"unknown terminal nodes: {', '.join(unknown_terminals)}")
        for terminal in sorted(terminals & nodes.keys()):
            if nodes[terminal].get("kind") != "terminal":
                errors.append(f"terminal node {terminal} must use kind: terminal")

    edge_items = document.get("edges")
    if not is_list(edge_items):
        errors.append("edges must be a list")
        edge_items = []

    outgoing: dict[str, list[dict[str, Any]]] = defaultdict(list)
    incoming: dict[str, list[dict[str, Any]]] = defaultdict(list)
    adjacency: dict[str, set[str]] = defaultdict(set)
    for index, edge in enumerate(edge_items):
        label = f"edges[{index}]"
        if not is_mapping(edge):
            errors.append(f"{label} must be a mapping")
            continue
        source = edge.get("from")
        target = edge.get("to")
        if source not in nodes:
            errors.append(f"{label}.from references unknown node: {source}")
        if target not in nodes:
            errors.append(f"{label}.to references unknown node: {target}")
        if source in nodes and target in nodes:
            outgoing[source].append(edge)
            incoming[target].append(edge)
            adjacency[source].add(target)
        if "when" in edge and (not isinstance(edge["when"], str) or not edge["when"].strip()):
            errors.append(f"{label}.when must be a non-empty string")
        if "default" in edge and not isinstance(edge["default"], bool):
            errors.append(f"{label}.default must be boolean")
        if edge.get("default") is True and "when" in edge:
            errors.append(f"{label} cannot define both when and default: true")

    for node_id, node in nodes.items():
        edges = outgoing[node_id]
        if node_id in terminals:
            if edges:
                errors.append(f"terminal node {node_id} must not have outgoing edges")
        elif not edges:
            errors.append(f"non-terminal node {node_id} has no outgoing edge")

        guarded = [edge for edge in edges if "when" in edge]
        defaults = [edge for edge in edges if edge.get("default") is True]
        requires_routing = node.get("kind") == "router" or bool(guarded) or bool(defaults)
        if requires_routing:
            if len(edges) < 2:
                errors.append(f"routing node {node_id} needs at least two outgoing edges")
            if len(defaults) != 1:
                errors.append(f"routing node {node_id} needs exactly one default edge")
            for edge in edges:
                if edge not in defaults and "when" not in edge:
                    errors.append(f"routing edge {node_id} -> {edge.get('to')} needs a condition")

        if node.get("kind") == "join" and len(incoming[node_id]) < 2:
            errors.append(f"join node {node_id} needs at least two incoming edges")

    if entry in nodes:
        reachable = walk(entry, adjacency)
        unreachable = sorted(nodes.keys() - reachable)
        if unreachable:
            errors.append(f"unreachable nodes: {', '.join(unreachable)}")

    parallel_items = document.get("parallel_groups", [])
    if not is_list(parallel_items):
        errors.append("parallel_groups must be a list")
        parallel_items = []
    seen_parallel: set[str] = set()
    for index, group in enumerate(parallel_items):
        label = f"parallel_groups[{index}]"
        if not is_mapping(group):
            errors.append(f"{label} must be a mapping")
            continue
        group_id = group.get("id")
        if not isinstance(group_id, str) or not IDENTIFIER.fullmatch(group_id):
            errors.append(f"{label}.id must be a lowercase identifier")
        elif group_id in seen_parallel:
            errors.append(f"duplicate parallel group id: {group_id}")
        else:
            seen_parallel.add(group_id)
        branches = group.get("branches")
        join_id = group.get("join")
        if not is_list(branches) or len(branches) < 2 or not all(isinstance(item, str) for item in branches):
            errors.append(f"{label}.branches must contain at least two node ids")
            branches = []
        unknown = sorted(set(branches) - nodes.keys())
        if unknown:
            errors.append(f"{label} references unknown branches: {', '.join(unknown)}")
        if join_id not in nodes or nodes.get(join_id, {}).get("kind") != "join":
            errors.append(f"{label}.join must reference a join node")
        elif branches:
            for branch in branches:
                if branch in nodes and join_id not in walk(branch, adjacency):
                    errors.append(f"parallel branch {branch} cannot reach join {join_id}")
        if not isinstance(group.get("on_partial_failure"), str) or not group["on_partial_failure"].strip():
            warnings.append(f"{label} should define on_partial_failure")

    loop_items = document.get("loops", [])
    if not is_list(loop_items):
        errors.append("loops must be a list")
        loop_items = []
    declared_loops: list[set[str]] = []
    seen_loops: set[str] = set()
    for index, loop in enumerate(loop_items):
        label = f"loops[{index}]"
        if not is_mapping(loop):
            errors.append(f"{label} must be a mapping")
            continue
        loop_id = loop.get("id")
        if not isinstance(loop_id, str) or not IDENTIFIER.fullmatch(loop_id):
            errors.append(f"{label}.id must be a lowercase identifier")
        elif loop_id in seen_loops:
            errors.append(f"duplicate loop id: {loop_id}")
        else:
            seen_loops.add(loop_id)
        members = loop.get("nodes")
        if not is_list(members) or not members or not all(isinstance(item, str) for item in members):
            errors.append(f"{label}.nodes must be a non-empty list of node ids")
            member_set: set[str] = set()
        else:
            member_set = set(members)
            unknown = sorted(member_set - nodes.keys())
            if unknown:
                errors.append(f"{label} references unknown nodes: {', '.join(unknown)}")
            declared_loops.append(member_set)
        if not isinstance(loop.get("exit_when"), str) or not loop["exit_when"].strip():
            errors.append(f"{label}.exit_when must be a non-empty string")
        max_iterations = loop.get("max_iterations")
        timeout = loop.get("timeout")
        bounded_iterations = isinstance(max_iterations, int) and not isinstance(max_iterations, bool) and max_iterations > 0
        bounded_timeout = isinstance(timeout, str) and bool(timeout.strip())
        if not bounded_iterations and not bounded_timeout:
            errors.append(f"{label} needs a positive max_iterations or timeout")
        if not isinstance(loop.get("on_exhausted"), str) or not loop["on_exhausted"].strip():
            errors.append(f"{label}.on_exhausted must be a non-empty string")

    for component in cyclic_components(nodes.keys(), adjacency):
        if not any(component <= declared for declared in declared_loops):
            errors.append(f"undeclared or incompletely declared cycle: {', '.join(sorted(component))}")

    observability = document.get("observability")
    if not is_mapping(observability):
        warnings.append("observability should define captured events and redaction")
    else:
        capture = observability.get("capture")
        if not is_list(capture) or not all(isinstance(item, str) for item in capture):
            errors.append("observability.capture must be a list of strings")
        else:
            missing = sorted(REQUIRED_EVENTS - set(capture))
            if missing:
                warnings.append(f"observability.capture omits: {', '.join(missing)}")
        redact_sensitive_state = observability.get("redact_sensitive_state")
        if not isinstance(redact_sensitive_state, bool):
            errors.append("observability.redact_sensitive_state must be boolean")
        elif has_sensitive_state and redact_sensitive_state is not True:
            errors.append("observability must redact declared sensitive state")

    return errors, warnings


def walk(start: str, adjacency: dict[str, set[str]]) -> set[str]:
    visited: set[str] = set()
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node in visited:
            continue
        visited.add(node)
        queue.extend(adjacency.get(node, set()) - visited)
    return visited


def cyclic_components(node_ids: Any, adjacency: dict[str, set[str]]) -> list[set[str]]:
    index = 0
    indices: dict[str, int] = {}
    lowlinks: dict[str, int] = {}
    stack: list[str] = []
    on_stack: set[str] = set()
    components: list[set[str]] = []

    def visit(node: str) -> None:
        nonlocal index
        indices[node] = index
        lowlinks[node] = index
        index += 1
        stack.append(node)
        on_stack.add(node)

        for target in adjacency.get(node, set()):
            if target not in indices:
                visit(target)
                lowlinks[node] = min(lowlinks[node], lowlinks[target])
            elif target in on_stack:
                lowlinks[node] = min(lowlinks[node], indices[target])

        if lowlinks[node] == indices[node]:
            component: set[str] = set()
            while True:
                member = stack.pop()
                on_stack.remove(member)
                component.add(member)
                if member == node:
                    break
            if len(component) > 1 or node in adjacency.get(node, set()):
                components.append(component)

    for node in node_ids:
        if node not in indices:
            visit(node)
    return components


def run_self_test() -> int:
    valid = {
        "schema_version": "1",
        "graph": {
            "id": "self_test",
            "goal": "Exercise validator invariants.",
            "entry": "start",
            "terminals": ["done"],
            "controls": {"max_steps": 2, "timeout": "1m"},
        },
        "state": [],
        "nodes": [
            {
                "id": "start",
                "kind": "task",
                "purpose": "Start.",
                "reads": [],
                "writes": [],
                "side_effects": [],
                "idempotent": True,
                "timeout": "1m",
                "retry": {"max_attempts": 1},
            },
            {
                "id": "done",
                "kind": "terminal",
                "purpose": "Finish.",
                "reads": [],
                "writes": [],
                "side_effects": [],
                "idempotent": True,
                "timeout": "1m",
                "retry": {"max_attempts": 1},
            },
        ],
        "edges": [{"from": "start", "to": "done"}],
        "parallel_groups": [],
        "loops": [],
        "observability": {
            "capture": sorted(REQUIRED_EVENTS),
            "redact_sensitive_state": True,
        },
    }
    valid_errors, _ = validate_document(valid)
    invalid = dict(valid)
    invalid["edges"] = [{"from": "start", "to": "missing"}]
    invalid_errors, _ = validate_document(invalid)
    sensitive = json.loads(json.dumps(valid))
    sensitive["state"] = [
        {
            "name": "secret",
            "description": "Sensitive test state.",
            "owner": "start",
            "merge": "replace",
            "sensitive": True,
            "persist": True,
        }
    ]
    sensitive["observability"]["redact_sensitive_state"] = False
    sensitive_errors, _ = validate_document(sensitive)
    if valid_errors:
        print("[ERROR] self-test valid fixture failed:")
        for message in valid_errors:
            print(f"  - {message}")
        return 1
    if not invalid_errors:
        print("[ERROR] self-test invalid fixture unexpectedly passed")
        return 1
    if "observability must redact declared sensitive state" not in sensitive_errors:
        print("[ERROR] self-test sensitive-state fixture unexpectedly passed")
        return 1
    print("[OK] validator self-test passed")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spec", nargs="?", help="Path to a JSON Graph Spec")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as failures")
    parser.add_argument("--self-test", action="store_true", help="Run built-in validator checks")
    args = parser.parse_args()

    if args.self_test:
        return run_self_test()
    if not args.spec:
        parser.error("spec is required unless --self-test is used")

    path = Path(args.spec)
    try:
        document = json.loads(path.read_text())
    except FileNotFoundError:
        print(f"[ERROR] file not found: {path}", file=sys.stderr)
        return 2
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        print(f"[ERROR] cannot read JSON: {exc}", file=sys.stderr)
        return 2

    errors, warnings = validate_document(document)
    for message in warnings:
        print(f"[WARN] {message}")
    for message in errors:
        print(f"[ERROR] {message}")

    if errors or (args.strict and warnings):
        print(f"[FAIL] {len(errors)} error(s), {len(warnings)} warning(s)")
        return 1
    print(f"[OK] Graph Spec is valid with {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
