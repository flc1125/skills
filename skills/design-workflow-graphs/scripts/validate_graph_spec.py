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
GUARD_STATE_REF = re.compile(r"\b([a-z][a-z0-9_-]*)\.")
NODE_KINDS = {"task", "router", "join", "approval", "side_effect", "terminal"}
MERGE_POLICIES = {"replace", "append", "reduce", "reject-conflict"}
PARALLEL_SAFE_MERGES = {"append", "reduce"}
JOIN_STRATEGIES = {"all", "any", "quorum"}
EVALUATION_SCOPES = {"node", "route", "join", "loop", "graph"}
FAILURE_CLASSES = {"retryable", "correctable", "rejectable", "terminal"}
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


def string_list(
    value: Any,
    label: str,
    errors: list[str],
    *,
    min_items: int = 0,
) -> list[str]:
    if not is_list(value):
        errors.append(f"{label} must be a list of strings")
        return []

    result: list[str] = []
    for index, item in enumerate(value):
        if not isinstance(item, str) or not item.strip():
            errors.append(f"{label}[{index}] must be a non-empty string")
            continue
        result.append(item)

    if len(result) < min_items:
        errors.append(f"{label} must contain at least {min_items} item(s)")
    return result


def validate_identifier(value: Any, label: str, errors: list[str]) -> str | None:
    if not isinstance(value, str) or not IDENTIFIER.fullmatch(value):
        errors.append(f"{label} must be a lowercase identifier")
        return None
    return value


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


def walk_until(start: str, stop: str, adjacency: dict[str, set[str]]) -> set[str]:
    visited: set[str] = set()
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node == stop or node in visited:
            continue
        visited.add(node)
        queue.extend(adjacency.get(node, set()) - visited - {stop})
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


def validate_document(document: Any) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if not is_mapping(document):
        return ["top level must be a JSON object"], warnings

    if str(document.get("schema_version", "")) != "1":
        errors.append('schema_version must be "1"')

    graph = document.get("graph")
    if not is_mapping(graph):
        return errors + ["graph must be a mapping"], warnings

    graph_id = validate_identifier(graph.get("id"), "graph.id", errors)
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

    state_fields: dict[str, dict[str, Any]] = {}
    declared_state_writers: dict[str, set[str]] = {}
    initial_state: set[str] = set()
    has_sensitive_state = False
    for index, field in enumerate(state_items):
        label = f"state[{index}]"
        if not is_mapping(field):
            errors.append(f"{label} must be a mapping")
            continue
        name = validate_identifier(field.get("name"), f"{label}.name", errors)
        if name is None:
            continue
        if name in state_fields:
            errors.append(f"duplicate state field: {name}")
            continue
        state_fields[name] = field
        if not isinstance(field.get("description"), str) or not field["description"].strip():
            errors.append(f"state field {name} needs a description")
        if not isinstance(field.get("type"), str) or not field["type"].strip():
            errors.append(f"state field {name} needs a non-empty type")
        if not isinstance(field.get("owner"), str) or not field["owner"].strip():
            errors.append(f"state field {name} needs an owner")
        merge = field.get("merge")
        if not isinstance(merge, str) or merge not in MERGE_POLICIES:
            errors.append(f"state field {name} has an invalid merge policy")
        if merge == "reduce" and (
            not isinstance(field.get("reducer"), str) or not field["reducer"].strip()
        ):
            errors.append(f"state field {name} with merge reduce needs a reducer")
        writers = string_list(field.get("writers"), f"state field {name}.writers", errors)
        valid_writers: set[str] = set()
        for writer in writers:
            if IDENTIFIER.fullmatch(writer):
                valid_writers.add(writer)
            else:
                errors.append(f"state field {name}.writers contains invalid node id: {writer}")
        if len(valid_writers) != len(writers):
            errors.append(f"state field {name}.writers must contain unique node ids")
        declared_state_writers[name] = valid_writers
        for flag in ("sensitive", "persist"):
            if not isinstance(field.get(flag), bool):
                errors.append(f"state field {name}.{flag} must be boolean")
        if not isinstance(field.get("initial"), bool):
            errors.append(f"state field {name}.initial must be boolean")
        elif field["initial"]:
            initial_state.add(name)
        if field.get("sensitive") is True:
            has_sensitive_state = True

    state_names = set(state_fields)
    node_items = document.get("nodes")
    if not is_list(node_items) or not node_items:
        return errors + ["nodes must be a non-empty list"], warnings

    nodes: dict[str, dict[str, Any]] = {}
    node_reads: dict[str, set[str]] = {}
    node_writes: dict[str, set[str]] = {}
    approval_nodes: list[str] = []
    failure_targets: dict[str, Any] = {}
    for index, node in enumerate(node_items):
        label = f"nodes[{index}]"
        if not is_mapping(node):
            errors.append(f"{label} must be a mapping")
            continue
        node_id = validate_identifier(node.get("id"), f"{label}.id", errors)
        if node_id is None:
            continue
        if node_id in nodes:
            errors.append(f"duplicate node id: {node_id}")
            continue
        nodes[node_id] = node
        kind = node.get("kind")
        if not isinstance(kind, str) or kind not in NODE_KINDS:
            errors.append(f"node {node_id} has an invalid kind")
        if not isinstance(node.get("purpose"), str) or not node["purpose"].strip():
            errors.append(f"node {node_id} needs a purpose")

        reads = string_list(node.get("reads"), f"node {node_id}.reads", errors)
        writes = string_list(node.get("writes"), f"node {node_id}.writes", errors)
        side_effects = string_list(
            node.get("side_effects"), f"node {node_id}.side_effects", errors
        )
        node_reads[node_id] = set(reads)
        node_writes[node_id] = set(writes)
        for key, values in (("reads", reads), ("writes", writes)):
            unknown = sorted(set(values) - state_names)
            if unknown:
                errors.append(
                    f"node {node_id}.{key} references unknown state: {', '.join(unknown)}"
                )

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
            if (
                not isinstance(max_attempts, int)
                or isinstance(max_attempts, bool)
                or max_attempts < 1
            ):
                errors.append(f"node {node_id}.retry.max_attempts must be a positive integer")
        if side_effects and max_attempts and max_attempts > 1 and node.get("idempotent") is not True:
            errors.append(f"node {node_id} retries non-idempotent side effects")
        if kind == "side_effect" and not side_effects:
            warnings.append(f"side-effect node {node_id} declares no side effects")

        if kind == "join":
            join = node.get("join")
            if not is_mapping(join):
                errors.append(f"join node {node_id} needs a valid join mapping")
            else:
                strategy = join.get("strategy")
                if not isinstance(strategy, str) or strategy not in JOIN_STRATEGIES:
                    errors.append(f"join node {node_id} needs a valid join.strategy")
                elif strategy == "quorum":
                    quorum = join.get("quorum")
                    if (
                        not isinstance(quorum, int)
                        or isinstance(quorum, bool)
                        or quorum < 1
                    ):
                        errors.append(f"join node {node_id} needs a positive join.quorum")

        if kind == "approval":
            approval_nodes.append(node_id)

        if kind == "terminal":
            if "failure" in node:
                errors.append(f"terminal node {node_id} must not define failure handling")
        else:
            failure = node.get("failure")
            if not is_mapping(failure):
                errors.append(f"node {node_id} needs a failure mapping")
            else:
                classification = failure.get("classification")
                if not isinstance(classification, str) or classification not in FAILURE_CLASSES:
                    errors.append(f"node {node_id}.failure.classification is invalid")
                failure_targets[node_id] = failure.get("on_failure")

    actual_state_writers: dict[str, set[str]] = defaultdict(set)
    for node_id, writes in node_writes.items():
        for state_name in writes & state_names:
            actual_state_writers[state_name].add(node_id)
    for state_name in sorted(state_names):
        declared = declared_state_writers.get(state_name, set())
        unknown_writers = sorted(declared - nodes.keys())
        if unknown_writers:
            errors.append(
                f"state field {state_name}.writers references unknown nodes: "
                f"{', '.join(unknown_writers)}"
            )
        actual = actual_state_writers.get(state_name, set())
        missing = sorted(actual - declared)
        extra = sorted((declared & nodes.keys()) - actual)
        if missing:
            errors.append(
                f"state field {state_name}.writers omits actual writers: {', '.join(missing)}"
            )
        if extra:
            errors.append(
                f"state field {state_name}.writers declares nodes that do not write it: "
                f"{', '.join(extra)}"
            )

    entry = graph.get("entry")
    if not isinstance(entry, str) or entry not in nodes:
        errors.append("graph.entry must reference an existing node")
        entry = None

    terminals_raw = graph.get("terminals")
    if not is_list(terminals_raw) or not terminals_raw:
        errors.append("graph.terminals must be a non-empty list")
        terminals: set[str] = set()
    else:
        terminal_values = string_list(terminals_raw, "graph.terminals", errors, min_items=1)
        terminals = set(terminal_values)
        if len(terminals) != len(terminal_values):
            errors.append("graph.terminals must contain unique node ids")
        unknown_terminals = sorted(terminals - nodes.keys())
        if unknown_terminals:
            errors.append(f"unknown terminal nodes: {', '.join(unknown_terminals)}")

    kind_terminals = {node_id for node_id, node in nodes.items() if node.get("kind") == "terminal"}
    unlisted_kind_terminals = sorted(kind_terminals - terminals)
    non_terminal_kinds = sorted((terminals & nodes.keys()) - kind_terminals)
    if unlisted_kind_terminals:
        errors.append(
            "kind terminal nodes missing from graph.terminals: "
            + ", ".join(unlisted_kind_terminals)
        )
    if non_terminal_kinds:
        errors.append(
            "graph.terminals nodes must use kind terminal: " + ", ".join(non_terminal_kinds)
        )

    edge_items = document.get("edges")
    if not is_list(edge_items):
        errors.append("edges must be a list")
        edge_items = []

    validated_edges: list[tuple[int, dict[str, Any], list[str]]] = []
    outgoing: dict[str, list[tuple[int, dict[str, Any], list[str]]]] = defaultdict(list)
    incoming: dict[str, list[tuple[int, dict[str, Any], list[str]]]] = defaultdict(list)
    adjacency: dict[str, set[str]] = defaultdict(set)
    for index, edge in enumerate(edge_items):
        label = f"edges[{index}]"
        if not is_mapping(edge):
            errors.append(f"{label} must be a mapping")
            continue
        source = edge.get("from")
        target = edge.get("to")
        valid_source = isinstance(source, str) and source in nodes
        valid_target = isinstance(target, str) and target in nodes
        if not isinstance(source, str):
            errors.append(f"{label}.from must be a node identifier")
        elif not valid_source:
            errors.append(f"{label}.from references unknown node: {source}")
        if not isinstance(target, str):
            errors.append(f"{label}.to must be a node identifier")
        elif not valid_target:
            errors.append(f"{label}.to references unknown node: {target}")

        has_guard = "when" in edge
        guard = edge.get("when")
        if has_guard and (not isinstance(guard, str) or not guard.strip()):
            errors.append(f"{label}.when must be a non-empty string")
        if "default" in edge and not isinstance(edge["default"], bool):
            errors.append(f"{label}.default must be boolean")
        if edge.get("default") is True and has_guard:
            errors.append(f"{label} cannot define both when and default: true")

        guard_reads: list[str] = []
        if has_guard:
            guard_reads = string_list(edge.get("reads"), f"{label}.reads", errors, min_items=1)
            unknown_reads = sorted(set(guard_reads) - state_names)
            if unknown_reads:
                errors.append(f"{label}.reads references unknown state: {', '.join(unknown_reads)}")
            if isinstance(guard, str):
                implicit_refs = set(GUARD_STATE_REF.findall(guard))
                omitted_refs = sorted(implicit_refs - set(guard_reads))
                if omitted_refs:
                    errors.append(
                        f"{label}.reads omits state referenced by guard: {', '.join(omitted_refs)}"
                    )
        elif "reads" in edge:
            unexpected_reads = string_list(edge.get("reads"), f"{label}.reads", errors)
            if unexpected_reads:
                errors.append(f"{label}.reads is only valid with when")

        if "priority" in edge:
            priority = edge.get("priority")
            if not isinstance(priority, int) or isinstance(priority, bool) or priority < 1:
                errors.append(f"{label}.priority must be a positive integer")

        if valid_source and valid_target:
            record = (index, edge, guard_reads)
            validated_edges.append(record)
            outgoing[source].append(record)
            incoming[target].append(record)
            adjacency[source].add(target)

    routing_nodes: set[str] = set()
    for node_id, node in nodes.items():
        edges = outgoing[node_id]
        if node.get("kind") == "terminal":
            if edges:
                errors.append(f"terminal node {node_id} must not have outgoing edges")
        elif not edges:
            errors.append(f"non-terminal node {node_id} has no outgoing edge")

        guarded = [record for record in edges if "when" in record[1]]
        defaults = [record for record in edges if record[1].get("default") is True]
        requires_routing = node.get("kind") == "router" or bool(guarded) or bool(defaults)
        if requires_routing:
            routing_nodes.add(node_id)
            if len(edges) < 2:
                errors.append(f"routing node {node_id} needs at least two outgoing edges")
            if len(defaults) != 1:
                errors.append(f"routing node {node_id} needs exactly one default edge")
            for _, edge, _ in edges:
                if edge.get("default") is not True and "when" not in edge:
                    errors.append(f"routing edge {node_id} -> {edge.get('to')} needs a condition")

            conditions: dict[str, int] = {}
            for index, edge, guard_reads in guarded:
                guard = edge.get("when")
                if isinstance(guard, str) and guard.strip():
                    normalized = " ".join(guard.split())
                    if normalized in conditions:
                        errors.append(
                            f"edges[{index}].when duplicates edges[{conditions[normalized]}].when"
                        )
                    else:
                        conditions[normalized] = index
                unavailable = sorted(
                    set(guard_reads) - (node_reads.get(node_id, set()) | node_writes.get(node_id, set()))
                )
                if unavailable:
                    errors.append(
                        f"edges[{index}].reads is unavailable to source node {node_id}: "
                        f"{', '.join(unavailable)}"
                    )

            if len(guarded) > 1:
                priorities = [record[1].get("priority") for record in guarded]
                if not all(
                    isinstance(priority, int)
                    and not isinstance(priority, bool)
                    and priority > 0
                    for priority in priorities
                ):
                    errors.append(
                        f"routing node {node_id} with multiple guards needs a priority on every guard"
                    )
                elif len(set(priorities)) != len(priorities):
                    errors.append(f"routing node {node_id} guard priorities must be unique")

        if node.get("kind") == "join":
            input_count = len(incoming[node_id])
            if input_count < 2:
                errors.append(f"join node {node_id} needs at least two incoming edges")
            join = node.get("join")
            if is_mapping(join) and join.get("strategy") == "quorum":
                quorum = join.get("quorum")
                if (
                    isinstance(quorum, int)
                    and not isinstance(quorum, bool)
                    and quorum > input_count
                ):
                    errors.append(
                        f"join node {node_id}.quorum exceeds its {input_count} incoming edges"
                    )

    reachability_adjacency: dict[str, set[str]] = defaultdict(set)
    for source, targets in adjacency.items():
        reachability_adjacency[source].update(targets)
    virtual_transitions: dict[tuple[str, str], bool] = {}

    def add_virtual_transition(
        source: str,
        target: str,
        *,
        include_source_writes: bool = False,
    ) -> None:
        reachability_adjacency[source].add(target)
        key = (source, target)
        if key in virtual_transitions:
            virtual_transitions[key] = (
                virtual_transitions[key] and include_source_writes
            )
        else:
            virtual_transitions[key] = include_source_writes

    for node_id, target in failure_targets.items():
        if not isinstance(target, str) or target not in nodes:
            errors.append(f"node {node_id}.failure.on_failure must reference a node")
        elif nodes[target].get("kind") == "join":
            errors.append(f"node {node_id}.failure.on_failure must not target a join")
        else:
            add_virtual_transition(node_id, target)

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
        group_id = validate_identifier(group.get("id"), f"{label}.id", errors)
        if group_id is not None:
            if group_id in seen_parallel:
                errors.append(f"duplicate parallel group id: {group_id}")
            seen_parallel.add(group_id)

        branches = string_list(group.get("branches"), f"{label}.branches", errors, min_items=2)
        if len(set(branches)) != len(branches):
            errors.append(f"{label}.branches must contain unique node ids")
        unknown_branches = sorted(set(branches) - nodes.keys())
        if unknown_branches:
            errors.append(f"{label} references unknown branches: {', '.join(unknown_branches)}")

        join_id = group.get("join")
        valid_join = isinstance(join_id, str) and join_id in nodes
        if not isinstance(join_id, str):
            errors.append(f"{label}.join must be a node identifier")
        elif not valid_join or nodes[join_id].get("kind") != "join":
            errors.append(f"{label}.join must reference a join node")

        branch_paths: dict[str, set[str]] = {}
        if valid_join:
            for branch in branches:
                if branch not in nodes:
                    continue
                if join_id not in walk(branch, adjacency):
                    errors.append(f"parallel branch {branch} cannot reach join {join_id}")
                    continue
                branch_paths[branch] = walk_until(branch, join_id, adjacency)

        valid_branches = sorted(branch_paths)
        for left_index, left in enumerate(valid_branches):
            for right in valid_branches[left_index + 1 :]:
                overlap = sorted(branch_paths[left] & branch_paths[right])
                if overlap:
                    errors.append(
                        f"parallel branches {left} and {right} converge before join {join_id}: "
                        f"{', '.join(overlap)}"
                    )
                left_writes = set().union(
                    *(node_writes.get(node_id, set()) for node_id in branch_paths[left])
                )
                right_writes = set().union(
                    *(node_writes.get(node_id, set()) for node_id in branch_paths[right])
                )
                for state_name in sorted(left_writes & right_writes):
                    merge = state_fields.get(state_name, {}).get("merge")
                    if merge not in PARALLEL_SAFE_MERGES:
                        errors.append(
                            f"parallel group {group_id or index} has conflicting writers for "
                            f"{state_name} with merge {merge}"
                        )

        partial_failure = group.get("on_partial_failure")
        if not isinstance(partial_failure, str) or not partial_failure.strip():
            errors.append(f"{label}.on_partial_failure must reference a recovery node")
        elif partial_failure not in nodes:
            errors.append(f"{label}.on_partial_failure references unknown node: {partial_failure}")
        elif nodes[partial_failure].get("kind") == "join":
            errors.append(f"{label}.on_partial_failure must not target a join")
        else:
            for branch in branches:
                if branch in nodes:
                    add_virtual_transition(branch, partial_failure)

    loop_items = document.get("loops", [])
    if not is_list(loop_items):
        errors.append("loops must be a list")
        loop_items = []
    declared_loops: list[set[str]] = []
    loop_read_contracts: list[tuple[str, str, set[str]]] = []
    loop_ids: set[str] = set()
    for index, loop in enumerate(loop_items):
        label = f"loops[{index}]"
        if not is_mapping(loop):
            errors.append(f"{label} must be a mapping")
            continue
        loop_id = validate_identifier(loop.get("id"), f"{label}.id", errors)
        if loop_id is not None:
            if loop_id in loop_ids:
                errors.append(f"duplicate loop id: {loop_id}")
            loop_ids.add(loop_id)

        members = string_list(loop.get("nodes"), f"{label}.nodes", errors, min_items=1)
        member_set = set(members)
        if len(member_set) != len(members):
            errors.append(f"{label}.nodes must contain unique node ids")
        unknown_members = sorted(member_set - nodes.keys())
        if unknown_members:
            errors.append(f"{label} references unknown nodes: {', '.join(unknown_members)}")
        if member_set in declared_loops:
            errors.append(f"{label}.nodes duplicates another declared loop")
        declared_loops.append(member_set)

        exit_when = loop.get("exit_when")
        if not isinstance(exit_when, str) or not exit_when.strip():
            errors.append(f"{label}.exit_when must be a non-empty string")
        exit_reads = string_list(loop.get("reads"), f"{label}.reads", errors, min_items=1)
        unknown_exit_reads = sorted(set(exit_reads) - state_names)
        if unknown_exit_reads:
            errors.append(f"{label}.reads references unknown state: {', '.join(unknown_exit_reads)}")
        if isinstance(exit_when, str):
            omitted_refs = sorted(set(GUARD_STATE_REF.findall(exit_when)) - set(exit_reads))
            if omitted_refs:
                errors.append(
                    f"{label}.reads omits state referenced by exit_when: {', '.join(omitted_refs)}"
                )
        evaluate_after = loop.get("evaluate_after")
        if not isinstance(evaluate_after, str) or evaluate_after not in member_set:
            errors.append(f"{label}.evaluate_after must reference a loop member")
        elif evaluate_after in nodes:
            loop_read_contracts.append((label, evaluate_after, set(exit_reads)))

        max_iterations = loop.get("max_iterations")
        timeout = loop.get("timeout")
        bounded_iterations = (
            isinstance(max_iterations, int)
            and not isinstance(max_iterations, bool)
            and max_iterations > 0
        )
        bounded_timeout = isinstance(timeout, str) and bool(timeout.strip())
        if not bounded_iterations and not bounded_timeout:
            errors.append(f"{label} needs a positive max_iterations or timeout")

        exhausted = loop.get("on_exhausted")
        if not isinstance(exhausted, str) or not exhausted.strip():
            errors.append(f"{label}.on_exhausted must reference a recovery node")
        elif exhausted not in nodes:
            errors.append(f"{label}.on_exhausted references unknown node: {exhausted}")
        elif exhausted in member_set:
            errors.append(f"{label}.on_exhausted must leave the loop")
        elif nodes[exhausted].get("kind") == "join":
            errors.append(f"{label}.on_exhausted must not target a join")
        else:
            for member in member_set & nodes.keys():
                add_virtual_transition(
                    member,
                    exhausted,
                    include_source_writes=True,
                )

    approval_resume_contracts: dict[str, set[str]] = {}
    for node_id in approval_nodes:
        approval = nodes[node_id].get("approval")
        if not is_mapping(approval):
            errors.append(f"approval node {node_id} needs an approval mapping")
            continue
        decision_state = approval.get("decision_state")
        if not isinstance(decision_state, str) or decision_state not in state_fields:
            errors.append(f"approval node {node_id}.decision_state must reference state")
        else:
            if decision_state not in node_writes.get(node_id, set()):
                errors.append(f"approval node {node_id} must write its decision_state")
            if state_fields[decision_state].get("persist") is not True:
                errors.append(f"approval node {node_id}.decision_state must persist")

        resume_state = string_list(
            approval.get("resume_state"),
            f"approval node {node_id}.resume_state",
            errors,
            min_items=1,
        )
        approval_resume_contracts[node_id] = set(resume_state)
        unknown_resume = sorted(set(resume_state) - state_names)
        if unknown_resume:
            errors.append(
                f"approval node {node_id}.resume_state references unknown state: "
                f"{', '.join(unknown_resume)}"
            )
        non_persistent = sorted(
            state_name
            for state_name in set(resume_state) & state_names
            if state_fields[state_name].get("persist") is not True
        )
        if non_persistent:
            errors.append(
                f"approval node {node_id}.resume_state must persist: {', '.join(non_persistent)}"
            )

        outgoing_targets = {record[1].get("to") for record in outgoing[node_id]}
        for key in ("on_rejected", "on_expired"):
            target = approval.get(key)
            if not isinstance(target, str) or target not in nodes:
                errors.append(f"approval node {node_id}.{key} must reference a node")
            elif target not in outgoing_targets:
                errors.append(f"approval node {node_id}.{key} needs a matching outgoing edge")

    recovery = document.get("recovery")
    if not is_mapping(recovery):
        warnings.append("recovery should define checkpoint_state and failure destinations")
    else:
        checkpoint_state = string_list(
            recovery.get("checkpoint_state"), "recovery.checkpoint_state", errors
        )
        unknown_checkpoint = sorted(set(checkpoint_state) - state_names)
        if unknown_checkpoint:
            errors.append(
                "recovery.checkpoint_state references unknown state: "
                + ", ".join(unknown_checkpoint)
            )
        non_persistent = sorted(
            state_name
            for state_name in set(checkpoint_state) & state_names
            if state_fields[state_name].get("persist") is not True
        )
        if non_persistent:
            errors.append(
                "recovery.checkpoint_state must persist: " + ", ".join(non_persistent)
            )
        for key in ("on_unhandled_error", "on_cancel"):
            target = recovery.get(key)
            if not isinstance(target, str) or target not in nodes:
                errors.append(f"recovery.{key} must reference a node")
            elif nodes[target].get("kind") == "join":
                errors.append(f"recovery.{key} must not target a join")
            else:
                for source, node in nodes.items():
                    if source != target and node.get("kind") != "terminal":
                        add_virtual_transition(source, target)

    actual_cycles = cyclic_components(nodes.keys(), reachability_adjacency)
    for component in actual_cycles:
        if component not in declared_loops:
            errors.append(
                "undeclared or incorrectly declared cycle including recovery paths: "
                + ", ".join(sorted(component))
            )
    for index, declared in enumerate(declared_loops):
        if declared and declared not in actual_cycles:
            errors.append(
                f"loops[{index}].nodes must exactly match a cyclic component: "
                + ", ".join(sorted(declared))
            )

    evaluation = document.get("evaluation")
    if not is_mapping(evaluation):
        warnings.append("evaluation should define at least one machine-readable check")
    else:
        checks = evaluation.get("checks")
        if not is_list(checks) or not checks:
            errors.append("evaluation.checks must be a non-empty list")
        else:
            for index, check in enumerate(checks):
                label = f"evaluation.checks[{index}]"
                if not is_mapping(check):
                    errors.append(f"{label} must be a mapping")
                    continue
                scope = check.get("scope")
                target = check.get("target")
                if not isinstance(scope, str) or scope not in EVALUATION_SCOPES:
                    errors.append(f"{label}.scope is invalid")
                if not isinstance(target, str) or not target.strip():
                    errors.append(f"{label}.target must be a non-empty string")
                elif scope == "graph" and target != graph_id:
                    errors.append(f"{label}.target must reference graph.id")
                elif scope == "loop" and target not in loop_ids:
                    errors.append(f"{label}.target must reference a loop")
                elif scope in {"node", "route", "join"} and target not in nodes:
                    errors.append(f"{label}.target must reference a node")
                elif scope == "route" and target not in routing_nodes:
                    errors.append(f"{label}.target must reference a routing node")
                elif scope == "join" and nodes.get(target, {}).get("kind") != "join":
                    errors.append(f"{label}.target must reference a join node")
                if not isinstance(check.get("metric"), str) or not check["metric"].strip():
                    errors.append(f"{label}.metric must be a non-empty string")

    observability = document.get("observability")
    if not is_mapping(observability):
        warnings.append("observability should define captured events and redaction")
    else:
        capture = string_list(observability.get("capture"), "observability.capture", errors)
        missing_events = sorted(REQUIRED_EVENTS - set(capture))
        if missing_events:
            warnings.append(f"observability.capture omits: {', '.join(missing_events)}")
        redact_sensitive_state = observability.get("redact_sensitive_state")
        if not isinstance(redact_sensitive_state, bool):
            errors.append("observability.redact_sensitive_state must be boolean")
        elif has_sensitive_state and redact_sensitive_state is not True:
            errors.append("observability must redact declared sensitive state")

    if entry is not None:
        reachable = walk(entry, reachability_adjacency)
        unreachable = sorted(nodes.keys() - reachable)
        if unreachable:
            errors.append(f"unreachable nodes: {', '.join(unreachable)}")

        predecessors: dict[str, list[tuple[str, bool]]] = defaultdict(list)
        for _, edge, _ in validated_edges:
            source = edge["from"]
            target = edge["to"]
            predecessors[target].append((source, True))
        for (source, target), include_source_writes in virtual_transitions.items():
            predecessors[target].append((source, include_source_writes))

        available_in = {
            node_id: set(initial_state) if node_id == entry else set(state_names)
            for node_id in nodes
        }
        max_rounds = max(1, len(nodes) * (len(state_names) + 1))
        for _ in range(max_rounds):
            changed = False
            next_available = {node_id: set(values) for node_id, values in available_in.items()}
            for node_id, node in nodes.items():
                if node_id == entry:
                    candidate = set(initial_state)
                else:
                    incoming_availability: list[set[str]] = []
                    for source, include_source_writes in predecessors[node_id]:
                        source_state = set(available_in[source])
                        if include_source_writes:
                            source_state.update(node_writes.get(source, set()))
                        incoming_availability.append(source_state)

                    if not incoming_availability:
                        candidate = set()
                    elif node.get("kind") == "join" and is_mapping(node.get("join")):
                        strategy = node["join"].get("strategy")
                        if strategy == "all":
                            required_arrivals = len(incoming_availability)
                        elif strategy == "quorum":
                            quorum = node["join"].get("quorum")
                            required_arrivals = (
                                quorum
                                if isinstance(quorum, int)
                                and not isinstance(quorum, bool)
                                and quorum > 0
                                else 1
                            )
                        else:
                            required_arrivals = 1
                        required_writers = len(incoming_availability) - required_arrivals + 1
                        candidate = {
                            state_name
                            for state_name in state_names
                            if sum(
                                state_name in values for values in incoming_availability
                            )
                            >= required_writers
                        }
                    else:
                        candidate = set.intersection(*incoming_availability)

                if candidate != available_in[node_id]:
                    next_available[node_id] = candidate
                    changed = True
            available_in = next_available
            if not changed:
                break

        for node_id in sorted(reachable):
            unavailable_reads = sorted(node_reads.get(node_id, set()) - available_in[node_id])
            if unavailable_reads:
                errors.append(
                    f"node {node_id}.reads is not definitely available on every path: "
                    f"{', '.join(unavailable_reads)}"
                )

        for label, evaluate_after, reads in loop_read_contracts:
            available_after = available_in[evaluate_after] | node_writes.get(
                evaluate_after, set()
            )
            unavailable_reads = sorted(reads - available_after)
            if unavailable_reads:
                errors.append(
                    f"{label}.reads is not definitely available after {evaluate_after}: "
                    f"{', '.join(unavailable_reads)}"
                )

        for node_id, resume_state in approval_resume_contracts.items():
            unavailable_resume = sorted(resume_state - available_in[node_id])
            if unavailable_resume:
                errors.append(
                    f"approval node {node_id}.resume_state is not definitely available: "
                    f"{', '.join(unavailable_resume)}"
                )

    return errors, warnings


def run_self_test() -> int:
    asset_path = Path(__file__).resolve().parent.parent / "assets" / "graph-spec.json"
    try:
        valid = json.loads(asset_path.read_text())
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        print(f"[ERROR] self-test cannot read template: {exc}")
        return 1

    valid_errors, valid_warnings = validate_document(valid)
    if valid_errors or valid_warnings:
        print("[ERROR] self-test template fixture failed:")
        for message in valid_errors:
            print(f"  - error: {message}")
        for message in valid_warnings:
            print(f"  - warning: {message}")
        return 1

    exhausted_valid = json.loads(json.dumps(valid))
    exhausted_valid["graph"]["terminals"].append("exhausted")
    exhausted_valid["nodes"].append(
        {
            "id": "exhausted",
            "kind": "terminal",
            "purpose": "Record the final loop decision after exhaustion.",
            "reads": ["review_decision"],
            "writes": [],
            "side_effects": [],
            "idempotent": True,
            "timeout": "1m",
            "retry": {"max_attempts": 1},
        }
    )
    exhausted_valid["loops"][0]["on_exhausted"] = "exhausted"
    exhausted_errors, exhausted_warnings = validate_document(exhausted_valid)
    if exhausted_errors or exhausted_warnings:
        print("[ERROR] self-test valid exhaustion fixture failed:")
        for message in exhausted_errors:
            print(f"  - error: {message}")
        for message in exhausted_warnings:
            print(f"  - warning: {message}")
        return 1

    cases: list[tuple[str, dict[str, Any], str]] = []

    missing_target = json.loads(json.dumps(valid))
    missing_target["edges"][0]["to"] = "missing"
    cases.append(("missing target", missing_target, "references unknown node"))

    sensitive = json.loads(json.dumps(valid))
    sensitive["state"][0]["sensitive"] = True
    sensitive["observability"]["redact_sensitive_state"] = False
    cases.append(("sensitive state", sensitive, "must redact declared sensitive state"))

    malformed = json.loads(json.dumps(valid))
    malformed["nodes"][0]["reads"] = [[]]
    malformed["edges"][0]["from"] = []
    cases.append(("malformed types", malformed, "must be a node identifier"))

    quorum = json.loads(json.dumps(valid))
    synthesize = next(node for node in quorum["nodes"] if node["id"] == "synthesize")
    synthesize["join"] = {"strategy": "quorum", "quorum": 99}
    cases.append(("impossible quorum", quorum, "quorum exceeds"))

    terminal_drift = json.loads(json.dumps(valid))
    publish = next(node for node in terminal_drift["nodes"] if node["id"] == "publish")
    publish["kind"] = "terminal"
    cases.append(("terminal drift", terminal_drift, "missing from graph.terminals"))

    exhaustion = json.loads(json.dumps(valid))
    exhaustion["loops"][0]["on_exhausted"] = "missing"
    cases.append(("unknown exhaustion", exhaustion, "on_exhausted references unknown node"))

    partial_failure = json.loads(json.dumps(valid))
    partial_failure["parallel_groups"][0]["on_partial_failure"] = "missing"
    cases.append(
        (
            "unknown partial failure",
            partial_failure,
            "on_partial_failure references unknown node",
        )
    )

    conflict = json.loads(json.dumps(valid))
    research = next(node for node in conflict["nodes"] if node["id"] == "research")
    risk = next(node for node in conflict["nodes"] if node["id"] == "risk_assessment")
    research["writes"].append("proposal")
    risk["writes"].append("proposal")
    proposal = next(field for field in conflict["state"] if field["name"] == "proposal")
    proposal["writers"].append("research")
    proposal["writers"].append("risk_assessment")
    cases.append(("parallel writer conflict", conflict, "conflicting writers for proposal"))

    unknown_guard = json.loads(json.dumps(valid))
    review_edge = next(edge for edge in unknown_guard["edges"] if edge.get("when"))
    review_edge["when"] = 'ghost.status == "approved"'
    review_edge["reads"] = ["ghost"]
    cases.append(("unknown guard state", unknown_guard, "reads references unknown state"))

    duplicate_guard = json.loads(json.dumps(valid))
    review_edges = [edge for edge in duplicate_guard["edges"] if edge["from"] == "review"]
    review_edges[1].pop("default")
    review_edges[1]["when"] = review_edges[0]["when"]
    review_edges[1]["reads"] = list(review_edges[0]["reads"])
    review_edges[0]["priority"] = 1
    review_edges[1]["priority"] = 2
    cases.append(("duplicate guard", duplicate_guard, ".when duplicates"))

    writer_drift = json.loads(json.dumps(valid))
    proposal = next(field for field in writer_drift["state"] if field["name"] == "proposal")
    proposal["writers"].remove("revise")
    cases.append(("writer drift", writer_drift, "writers omits actual writers"))

    approval_contract = json.loads(json.dumps(valid))
    approval = next(node for node in approval_contract["nodes"] if node["id"] == "approval")
    approval.pop("approval")
    cases.append(("approval contract", approval_contract, "needs an approval mapping"))

    recovery_contract = json.loads(json.dumps(valid))
    recovery_contract["recovery"]["on_cancel"] = "missing"
    cases.append(("recovery contract", recovery_contract, "recovery.on_cancel must reference"))

    evaluation_contract = json.loads(json.dumps(valid))
    evaluation_contract["evaluation"]["checks"][0]["target"] = "publish"
    cases.append(
        (
            "evaluation contract",
            evaluation_contract,
            "target must reference a routing node",
        )
    )

    recovery_cycle = json.loads(json.dumps(valid))
    recovery_cycle["recovery"]["on_unhandled_error"] = "intake"
    cases.append(
        (
            "recovery cycle",
            recovery_cycle,
            "cycle including recovery paths",
        )
    )

    unavailable_state = json.loads(json.dumps(valid))
    failed = next(node for node in unavailable_state["nodes"] if node["id"] == "failed")
    failed["reads"] = ["proposal"]
    cases.append(
        (
            "unavailable failure state",
            unavailable_state,
            "not definitely available on every path",
        )
    )

    missing_initial_contract = json.loads(json.dumps(valid))
    missing_initial_contract["state"][0].pop("initial")
    cases.append(
        (
            "initial state contract",
            missing_initial_contract,
            ".initial must be boolean",
        )
    )

    missing_failure_contract = json.loads(json.dumps(valid))
    intake = next(node for node in missing_failure_contract["nodes"] if node["id"] == "intake")
    intake.pop("failure")
    cases.append(
        (
            "node failure contract",
            missing_failure_contract,
            "needs a failure mapping",
        )
    )

    unavailable_loop_read = json.loads(json.dumps(valid))
    unavailable_loop_read["loops"][0]["reads"] = ["approval_decision"]
    unavailable_loop_read["loops"][0]["exit_when"] = (
        'approval_decision.status == "approved"'
    )
    cases.append(
        (
            "unavailable loop read",
            unavailable_loop_read,
            "is not definitely available after review",
        )
    )

    unavailable_resume_state = json.loads(json.dumps(valid))
    approval = next(
        node for node in unavailable_resume_state["nodes"] if node["id"] == "approval"
    )
    approval["approval"]["resume_state"].append("approval_decision")
    cases.append(
        (
            "unavailable approval resume state",
            unavailable_resume_state,
            "resume_state is not definitely available",
        )
    )

    padded_loop = json.loads(json.dumps(valid))
    padded_loop["loops"][0]["nodes"].append("approval")
    padded_loop["loops"][0]["evaluate_after"] = "approval"
    padded_loop["loops"][0]["reads"] = ["approval_decision"]
    padded_loop["loops"][0]["exit_when"] = (
        'approval_decision.status == "approved"'
    )
    cases.append(
        (
            "padded loop membership",
            padded_loop,
            "nodes must exactly match a cyclic component",
        )
    )

    for name, fixture, expected in cases:
        try:
            case_errors, _ = validate_document(fixture)
        except Exception as exc:  # pragma: no cover - this is the behavior under test
            print(f"[ERROR] self-test {name} crashed: {exc}")
            return 1
        if not any(expected in message for message in case_errors):
            print(f"[ERROR] self-test {name} missed expected error: {expected}")
            for message in case_errors:
                print(f"  - {message}")
            return 1

    print(f"[OK] validator self-test passed ({len(cases)} invalid fixtures)")
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
