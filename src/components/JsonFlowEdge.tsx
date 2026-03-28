"use client";

import { memo } from "react";
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";


const STROKE = "hsl(173 55% 42% / 0.55)";

const JsonFlowEdge = memo(function JsonFlowEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
  } = props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const stroke = STROKE;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        strokeWidth: 1.5,
        stroke,
        ...style,
      }}
      interactionWidth={22}
    />
  );
});

export default JsonFlowEdge;
