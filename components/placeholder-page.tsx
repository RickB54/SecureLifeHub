export default function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-xl text-gray-400">Coming soon</p>
    </div>
  )
}

