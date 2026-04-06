export default function App() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "3rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1>vite-plugin-env-banner example</h1>
      <p>
        This sample app loads the plugin from this repository and reads
        <code> VITE_APP_ENV </code> from <code>.env</code>.
      </p>
      <p>Try changing the value to development, staging, or production.</p>
    </main>
  );
}
