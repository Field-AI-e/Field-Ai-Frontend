import { TopBar } from "@/components/TopBar";

export default function HistoryPage() {
  return (
    <>
      <TopBar title="History" />
      <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#212121' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-2xl font-bold mb-6">Chat History</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300">Your conversation history will appear here.</p>
          </div>
        </div>
      </div>
    </>
  );
}
