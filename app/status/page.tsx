export default function StatusPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Deployment Status Check</h1>
      <p>Timestamp: {new Date().toISOString()}</p>
      <p>If you can see this page, the deployment is working.</p>
      <div>
        <h2>Test Links:</h2>
        <ul>
          <li>
            <a href="/api/ping">API Ping Test</a>
          </li>
          <li>
            <a href="/api/health">Health Check</a>
          </li>
          <li>
            <a href="/">Homepage</a>
          </li>
        </ul>
      </div>
    </div>
  )
}
