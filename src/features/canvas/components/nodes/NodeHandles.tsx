"use client";

import React from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * Shared connection handles for all canvas nodes.
 * Only right (source) and left (target) — enforces horizontal L→R flow.
 * Edge factory uses sourceHandle: 'src-right', targetHandle: 'tgt-left'.
 */
export function NodeHandles() {
  return (
    <>
      <Handle type="target" position={Position.Left} id="tgt-left" className="opacity-0" />
      <Handle type="source" position={Position.Right} id="src-right" className="opacity-0" />
    </>
  );
}
