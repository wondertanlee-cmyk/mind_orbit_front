import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMap, getAllMaps, putMap } from '../utils/db';

function createEmptyMap() {
  const id = crypto.randomUUID();
  const now = Date.now();

  return {
    id,
    title: '제목 없는 마인드맵',
    createdAt: now,
    updatedAt: now,
    nodes: [],
    edges: [],
  };
}

function DashboardPage() {
  const navigate = useNavigate();
  const [maps, setMaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    async function loadMaps() {
      try {
        const list = await getAllMaps();
        setMaps(list);
      } finally {
        setIsLoading(false);
      }
    }

    loadMaps();
  }, []);

  const handleCreateMap = async () => {
    const map = createEmptyMap();
    await putMap(map);
    navigate(`/editor/${map.id}`);
  };

  const handleOpenMap = (mapId) => {
    navigate(`/editor/${mapId}`);
  };

  const handleDeleteMap = async (mapId) => {
    await deleteMap(mapId);
    setMaps((prev) => prev.filter((map) => map.id !== mapId));
  };

  const handleCopyJson = async (map) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(map));
      setToastMessage('맵 JSON이 복사되었습니다.');
    } catch {
      setToastMessage('클립보드 복사에 실패했습니다.');
    }
  };

  const formatRelativeDate = (timestamp) => {
    if (!timestamp) return '방금 전';
    const updated = new Date(timestamp);
    const now = new Date();
    const updatedDate = updated.toDateString();
    const nowDate = now.toDateString();
    if (updatedDate === nowDate) return '오늘';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (updatedDate === yesterday.toDateString()) return '어제';

    return `${updated.getMonth() + 1}/${updated.getDate()}`;
  };

  return (
    <main className="page">
      <section className="dashboard-header">
        <h1 className="title">Orbit</h1>
        <p className="subtitle">당신의 생각을 연결하는 궤도</p>
      </section>

      <button type="button" className="card add-card" onClick={handleCreateMap}>
        + 새로운 마인드맵
      </button>

      {isLoading ? <p className="muted">불러오는 중...</p> : null}

      {!isLoading && maps.length === 0 ? (
        <p className="muted">저장된 마인드맵이 없습니다. 새 맵을 만들어보세요.</p>
      ) : null}

      <section className="map-list">
        {maps.map((map) => (
          <article
            key={map.id}
            className="card map-card"
            role="button"
            tabIndex={0}
            onClick={() => handleOpenMap(map.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleOpenMap(map.id);
              }
            }}
          >
            <h2 className="map-title">{map.title}</h2>
            <p className="muted">{formatRelativeDate(map.updatedAt)}</p>
            <p className="muted">노드 {map.nodes?.length ?? 0}개</p>
            <div className="card-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={(event) => {
                  event.stopPropagation();
                  handleCopyJson(map);
                }}
              >
                JSON 공유
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteMap(map.id);
                }}
              >
                삭제
              </button>
            </div>
          </article>
        ))}
      </section>

      {toastMessage ? <div className="toast">{toastMessage}</div> : null}
    </main>
  );
}

export default DashboardPage;
