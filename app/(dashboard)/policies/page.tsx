import { TopBar } from "@/components/TopBar";

export default function PoliciesPage() {
  return (
    <>
      <TopBar title="Policies" />
      <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#212121' }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300">Company policies and compliance documents will appear here.</p>
          </div>
        </div>
      </div>
    </>
  );
}
