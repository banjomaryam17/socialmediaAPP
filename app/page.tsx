export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900">
      <h1 className="text-4xl font-bold mb-4">Welcome to Connectify</h1>
      <p className="text-lg mb-6">Your social media journey starts here.</p>
      <a
        href="/signup"
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Get Started
      </a>
    </main>
  )
}
