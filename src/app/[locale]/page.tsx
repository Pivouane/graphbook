import Graph from "@/components/graph";
import { fetchGraphData } from "../actions/graph";
export default async function Page() {
  const data = await fetchGraphData();

  return (
    <div className="w-full h-screen bg-white dark:bg-gray-900">
      <Graph data={data} />
    </div>
  );
}
