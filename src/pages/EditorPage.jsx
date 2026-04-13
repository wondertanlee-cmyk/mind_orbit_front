import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { getMap, putMap } from '../utils/db';
import useMindMap from '../hooks/useMindMap';

function EditorCanvas({ map }) {
  const navigate = useNavigate();
  const {
    nodes,
    edges,
    selectedNode,
    selectedNodeId,
    editingNodeId,
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
  } = useMindMap(map);

  const [draftLabel, setDraftLabel] = useState('');
  const [titleDraft, setTitleDraft] = useState(map.title ?? '');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('저장됨');
  const [toastMessage, setToastMessage] = useState('');
  const didMountRef = useRef(false);

  const persistMap = useCallback(
    async (statusLabel) => {
      setSaveStatus(statusLabel);
      try {
        await putMap({
          id: map.id,
          title: titleDraft.trim() || '제목 없는 마인드맵',
          createdAt: map.createdAt,
          nodes,
          edges,
        });
        setSaveStatus('저장됨');
        return true;
      } catch {
        setSaveStatus('저장 실패');
        setToastMessage('저장에 실패했습니다. 다시 시도해주세요.');
        return false;
      }
    },
    [edges, map.createdAt, map.id, nodes, titleDraft]
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      setSaveStatus('자동 저장 중...');
      persistMap('자동 저장 중...');
    }, 1500);

    return () => clearTimeout(timer);
  }, [edges, nodes, persistMap]);

  useEffect(() => {
    const onKeydown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        persistMap('수동 저장 중...');
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [persistMap]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistMap('자동 저장 중...');
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [persistMap]);

  useEffect(() => {
    if (!isSaveModalOpen) return undefined;

    const onKeydown = (event) => {
      if (event.key === 'Escape') {
        setIsSaveModalOpen(false);
      }
      if (event.key === 'Enter') {
        persistMap('수동 저장 중...');
        setIsSaveModalOpen(false);
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [isSaveModalOpen, persistMap]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(''), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleGoDashboard = async () => {
    const ok = await persistMap('수동 저장 중...');
    if (ok) {
      navigate('/dashboard');
    }
  };

  const handleCanvasClick = () => {
    if (nodes.length === 0) {
      ensureRootNode();
      return;
    }

    setSelectedNodeId(null);
    setEditingNodeId(null);
  };

  const decoratedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        style: {
          background: node.data?.isRoot ? '#2d2663' : '#1f1a45',
          color: '#ffffff',
          border: selectedNodeId === node.id ? '2px solid #7b6fff' : '1px solid #5c4ec2',
          borderRadius: 12,
          minWidth: 120,
          boxShadow:
            selectedNodeId === node.id
              ? '0 0 0 3px rgba(123, 111, 255, 0.2)'
              : '0 8px 20px rgba(0, 0, 0, 0.22)',
          padding: '8px 14px',
          fontWeight: node.data?.style?.bold || node.data?.isRoot ? 700 : 500,
          fontStyle: node.data?.style?.italic ? 'italic' : 'normal',
          textDecoration: node.data?.style?.underline ? 'underline' : 'none',
        },
      })),
    [nodes, selectedNodeId]
  );

  return (
    <>
      <div className="editor-header">
        <h1 className="title">{titleDraft.trim() || '제목 없는 마인드맵'}</h1>
        <div className="editor-header-actions">
          <button type="button" className="btn-primary" onClick={() => setIsSaveModalOpen(true)}>
            저장
          </button>
          <button type="button" className="btn-primary" onClick={handleGoDashboard}>
            대시보드
          </button>
        </div>
      </div>
      <p className="muted save-status">{saveStatus}</p>

      {nodes.length === 0 ? (
        <button type="button" className="empty-state" onClick={handleCanvasClick}>
          캔버스를 클릭해 첫 노드를 만드세요
        </button>
      ) : null}

      <section className="flow-shell">
        <ReactFlow
          nodes={decoratedNodes}
          edges={edges}
          fitView
          minZoom={0.2}
          maxZoom={2}
          zoomOnPinch
          panOnDrag
          zoomOnDoubleClick={false}
          panOnScroll={false}
          selectionOnDrag={false}
          onPaneClick={handleCanvasClick}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => {
            setSelectedNodeId(node.id);
            setEditingNodeId(null);
          }}
          onNodeDoubleClick={(_, node) => {
            setSelectedNodeId(node.id);
            setEditingNodeId(node.id);
            setDraftLabel(node.data?.label ?? '');
          }}
        >
          <Background color="#343059" />
          <Controls />
        </ReactFlow>
      </section>

      <section className="editor-toolbar">
        <button
          type="button"
          className="btn-primary"
          disabled={!selectedNode}
          onClick={() => addChildNode(selectedNode.id)}
        >
          자식 +
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={!selectedNode}
          onClick={() => addSiblingNode(selectedNode.id)}
        >
          형제 +
        </button>
        <button
          type="button"
          className={`btn-primary style-btn ${selectedNode?.data?.style?.bold ? 'active' : ''}`}
          disabled={!selectedNode}
          onClick={() => toggleNodeTextStyle(selectedNode.id, 'bold')}
        >
          B
        </button>
        <button
          type="button"
          className={`btn-primary style-btn ${selectedNode?.data?.style?.italic ? 'active' : ''}`}
          disabled={!selectedNode}
          onClick={() => toggleNodeTextStyle(selectedNode.id, 'italic')}
        >
          I
        </button>
        <button
          type="button"
          className={`btn-primary style-btn ${selectedNode?.data?.style?.underline ? 'active' : ''}`}
          disabled={!selectedNode}
          onClick={() => toggleNodeTextStyle(selectedNode.id, 'underline')}
        >
          U
        </button>
        <button
          type="button"
          className="btn-danger"
          disabled={!selectedNode || selectedNode.data?.isRoot}
          onClick={() => deleteNodeRecursively(selectedNode.id)}
        >
          삭제
        </button>
      </section>

      {editingNodeId ? (
        <section className="card">
          <p className="muted">노드 텍스트 편집</p>
          <input
            className="node-input"
            value={draftLabel}
            maxLength={50}
            onChange={(event) => setDraftLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                updateNodeLabel(editingNodeId, draftLabel.trim());
              }
              if (event.key === 'Escape') {
                setEditingNodeId(null);
              }
            }}
          />
          <div className="editor-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => updateNodeLabel(editingNodeId, draftLabel.trim())}
            >
              적용
            </button>
            <button type="button" className="btn-danger" onClick={() => setEditingNodeId(null)}>
              취소
            </button>
          </div>
        </section>
      ) : null}

      {isSaveModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsSaveModalOpen(false)}>
          <section
            className="card save-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="map-title">마인드맵 저장</h2>
            <input
              className="node-input"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              maxLength={50}
              autoFocus
            />
            <div className="editor-actions">
              <button type="button" className="btn-danger" onClick={() => setIsSaveModalOpen(false)}>
                취소
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  persistMap('수동 저장 중...');
                  setIsSaveModalOpen(false);
                }}
              >
                저장
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {toastMessage ? <div className="toast">{toastMessage}</div> : null}
    </>
  );
}

function EditorPage() {
  const { mapId } = useParams();
  const [map, setMap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMap() {
      try {
        const foundMap = await getMap(mapId);
        setMap(foundMap ?? null);
      } finally {
        setIsLoading(false);
      }
    }

    loadMap();
  }, [mapId]);

  if (isLoading) {
    return (
      <main className="page">
        <p className="muted">맵을 불러오는 중...</p>
      </main>
    );
  }

  if (!map) {
    return (
      <main className="page">
        <section className="card">
          <h1 className="title">맵을 찾을 수 없습니다</h1>
          <Link to="/dashboard" className="btn-primary">
            대시보드로 돌아가기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <EditorCanvas key={map.id} map={map} />
    </main>
  );
}

export default EditorPage;
