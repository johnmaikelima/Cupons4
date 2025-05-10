export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-10 w-28 bg-gray-200 rounded"></div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="h-12 bg-gray-50"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-t border-gray-200">
            <div className="grid grid-cols-7 gap-4 p-4">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
