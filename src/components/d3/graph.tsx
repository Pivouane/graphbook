// Good luck and be brave...
"use client";

import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface NodeData {
  id: string;
  image: string | null;
  label: string;
  sub: string;
  size: number;
  url: string;
  promo: string | null;
}

interface LinkData {
  source: string;
  target: string;
  strength: number;
}

interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

type SimNode = d3.SimulationNodeDatum & NodeData;
type SimLink = d3.SimulationLinkDatum<SimNode> & { strength: number };

const DEFAULT_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

export default function Graph({ data, promos }: { data: GraphData; promos: string[] }) {
  const t = useTranslations("graph");
  const ref = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const [activePromo, setActivePromo] = useState<string>("");

  const filteredData: GraphData = useMemo(() => {
    const filteredNodes = activePromo
      ? data.nodes.filter((n) => n.promo === activePromo)
      : data.nodes;

    const nodeIds = new Set(filteredNodes.map((n) => n.id));

    const filteredLinks = activePromo
      ? data.links.filter((l) => {
          const sourceId = typeof l.source === "object" ? (l.source as NodeData).id : l.source;
          const targetId = typeof l.target === "object" ? (l.target as NodeData).id : l.target;
          return nodeIds.has(sourceId) && nodeIds.has(targetId);
        })
      : data.links;

    return { nodes: filteredNodes, links: filteredLinks };
  }, [activePromo, data]);

  useEffect(() => {
    if (!ref.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = 50;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => g.attr("transform", event.transform)),
    );

    const defs = svg.append("defs");
    filteredData.nodes.forEach((node) => {
      defs
        .append("clipPath")
        .attr("id", `clip-${node.id}`)
        .append("circle")
        .attr("r", node.size)
        .attr("cx", 0)
        .attr("cy", 0);
    });

    const simNodes: SimNode[] = filteredData.nodes.map((n) => ({ ...n }));
    const simLinks: SimLink[] = filteredData.links.map((l) => ({ ...l })) as SimLink[];

    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .strength((d) => d.strength * 0.1),
      )
      .force("center", d3.forceCenter((width - 2 * margin) / 2, (height - 2 * margin) / 2))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("collide", d3.forceCollide<SimNode>().radius((d) => d.size + 5));

    const link = g
      .selectAll<SVGLineElement, SimLink>("line")
      .data(simLinks)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", (d) => Math.max(1, d.strength));

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#333")
      .style("color", "#fff")
      .style("padding", "5px 10px")
      .style("border-radius", "5px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("visibility", "hidden");

    const nodeGroups = g
      .selectAll<SVGGElement, SimNode>(".node")
      .data(simNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("cursor", "pointer")
      .on("mouseover", function (_event, d) {
        d3.select(this).select("circle").transition().attr("r", d.size + 5);
        d3.select(this)
          .select("image")
          .attr("x", -(d.size + 5))
          .attr("y", -(d.size + 5))
          .attr("width", (d.size + 5) * 2)
          .attr("height", (d.size + 5) * 2);
        tooltip.style("visibility", "visible").text(d.label);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY + 12 + "px")
          .style("left", event.pageX + 12 + "px");
      })
      .on("mouseout", function (_event, d) {
        d3.select(this).select("circle").transition().attr("r", d.size);
        d3.select(this)
          .select("image")
          .attr("x", -d.size)
          .attr("y", -d.size)
          .attr("width", d.size * 2)
          .attr("height", d.size * 2);
        tooltip.style("visibility", "hidden");
      })
      .on("click", function (_event, d) {
        tooltip.style("visibility", "hidden");
        router.push(d.url);
      })
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    nodeGroups
      .append("circle")
      .attr("r", (d) => d.size)
      .attr("fill", "steelblue")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    nodeGroups
      .append("image")
      .attr("xlink:href", (d) => d.image || DEFAULT_AVATAR)
      .attr("x", (d) => -d.size)
      .attr("y", (d) => -d.size)
      .attr("width", (d) => d.size * 2)
      .attr("height", (d) => d.size * 2)
      .attr("clip-path", (d) => `url(#clip-${d.id})`)
      .attr("preserveAspectRatio", "xMidYMid slice");

    nodeGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("fill", "white")
      .attr("font-size", (d) => d.size * 0.7)
      .attr("pointer-events", "none")
      .text((d) => (d.image ? "" : d.sub));

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeGroups.attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [filteredData, router]);

  return (
    <div className="w-full h-full relative">
      {promos?.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <select
            value={activePromo}
            onChange={(e) => setActivePromo(e.target.value)}
            className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("allPromos")}</option>
            {promos.map((promo) => (
              <option key={promo} value={promo}>
                {promo}
              </option>
            ))}
          </select>
        </div>
      )}
      <svg className="w-full h-full" ref={ref} />
    </div>
  );
}
