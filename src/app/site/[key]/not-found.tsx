export default function SiteNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-5xl font-bold text-gray-900">404</h1>
      <p className="mt-3 text-gray-600">Deze pagina bestaat niet (meer).</p>
      <a href="/" className="mt-6 text-brand-600 hover:underline">
        Terug naar de homepagina
      </a>
    </div>
  );
}
