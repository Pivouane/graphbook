import { fetchGraphData } from "./actions/graph";
import Graph from "@/components/d3/graph";

export default async function HomePage() {
  const data = await fetchGraphData();
  const promos = [...new Set(data.nodes.map((n) => n.promo).filter(Boolean))] as string[];

  return (
    <div className="w-full h-screen overflow-hidden">
      <Graph data={data} promos={promos} />
    </div>
  );
}
