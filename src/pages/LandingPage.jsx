import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Orbit</h1>
        <p className="subtitle">당신의 생각을 연결하는 궤도</p>
        <Link to="/dashboard" className="btn-primary">
          시작하기
        </Link>
      </section>
    </main>
  );
}

export default LandingPage;
