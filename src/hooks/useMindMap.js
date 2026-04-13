import { useCallback, useMemo, useState } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
} from 'reactflow';

const ROOT_X = 0;
const ROOT_Y = 0;
const HORIZONTAL_GAP = 220;
const VERTICAL_GAP = 90;

function createNode({ id, label, x, y, isRoot = false }) {
  return {
    id,
    type: 'default',
    position: { x, y },
    data: {
      label,
      isRoot,
      style: { bold: false, italic: false, underline: false },
    },
  };
}

export default function useMindMap(initialMap) {
  const [nodes, setNodes] = useState(initialMap?.nodes ?? []);
  const [edges, setEdges] = useState(initialMap?.edges ?? []);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);

  const ensureRootNode = useCallback((position) => {
    if (nodes.length > 0) {
      return nodes[0];
    }

    const rootId = crypto.randomUUID();
    const root = createNode({
      id: rootId,
      label: '중심 주제',
      x: position?.x ?? ROOT_X,
      y: position?.y ?? ROOT_Y,
      isRoot: true,
    });

    setNodes([root]);
    setSelectedNodeId(rootId);
    setEditingNodeId(rootId);
    return root;
  }, [nodes]);

  const onNodesChange = useCallback(
    (changes) => setNodes((currentNodes) => applyNodeChanges(changes, currentNodes)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges)),
    []
  );

  const onConnect = useCallback(
    (connection) =>
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { stroke: '#7b6fff', strokeWidth: 1.5 },
          },
          currentEdges
        )
      ),
    []
  );

  const getChildren = useCallback(
    (parentId) => edges.filter((edge) => edge.source === parentId).map((edge) => edge.target),
    [edges]
  );

  const addChildNode = useCallback(
    (parentId) => {
      const parent = nodes.find((node) => node.id === parentId);
      if (!parent) return;

      const siblingCount = getChildren(parentId).length;
      const childId = crypto.randomUUID();
      const childNode = createNode({
        id: childId,
        label: '새 노드',
        x: parent.position.x + HORIZONTAL_GAP,
        y: parent.position.y + siblingCount * VERTICAL_GAP,
      });

      const childEdge = {
        id: `e-${parentId}-${childId}`,
        source: parentId,
        target: childId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#7b6fff', strokeWidth: 1.5 },
      };

      setNodes((current) => [...current, childNode]);
      setEdges((current) => [...current, childEdge]);
      setSelectedNodeId(childId);
      setEditingNodeId(childId);
    },
    [getChildren, nodes]
  );

  const addSiblingNode = useCallback(
    (nodeId) => {
      const parentEdge = edges.find((edge) => edge.target === nodeId);
      if (!parentEdge) return;
      addChildNode(parentEdge.source);
    },
    [addChildNode, edges]
  );

  const deleteNodeRecursively = useCallback(
    (nodeId) => {
      const target = nodes.find((node) => node.id === nodeId);
      if (!target || target.data?.isRoot) return;

      const toDelete = new Set([nodeId]);
      const queue = [nodeId];

      while (queue.length > 0) {
        const current = queue.shift();
        edges.forEach((edge) => {
          if (edge.source === current && !toDelete.has(edge.target)) {
            toDelete.add(edge.target);
            queue.push(edge.target);
          }
        });
      }

      setNodes((current) => current.filter((node) => !toDelete.has(node.id)));
      setEdges(
        (current) =>
          current.filter((edge) => !toDelete.has(edge.source) && !toDelete.has(edge.target))
      );
      setSelectedNodeId(null);
      setEditingNodeId(null);
    },
    [edges, nodes]
  );

  const updateNodeLabel = useCallback((nodeId, label) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label: label || '새 노드' } } : node
      )
    );
    setEditingNodeId(null);
  }, []);

  const toggleNodeTextStyle = useCallback((nodeId, styleKey) => {
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== nodeId) return node;

        const style = {
          bold: false,
          italic: false,
          underline: false,
          ...node.data?.style,
        };

        return {
          ...node,
          data: {
            ...node.data,
            style: {
              ...style,
              [styleKey]: !style[styleKey],
            },
          },
        };
      })
    );
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  return {
    nodes,
    edges,
    selectedNode,
    selectedNodeId,
    editingNodeId,
    setNodes,
    setEdges,
    setSelectedNodeId,
    setEditingNodeId,
    ensureRootNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addChildNode,
    addSiblingNode,
    deleteNodeRecursively,
    updateNodeLabel,
    toggleNodeTextStyle,
  };
}

