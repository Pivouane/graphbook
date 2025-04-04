"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Graph({ data }) {
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = 50;

    // Clear any existing SVG content
    d3.select(ref.current).selectAll("*").remove();

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .call(d3.zoom().scaleExtent([0.5, 3]).on("zoom", (event) => {
        g.attr("transform", event.transform);
      })).on("end", (event) => {
        const transform = event.transform;
        if (transform.k < 0.5) {
          svg.transition().duration(500).call(d3.zoom().transform, d3.zoomIdentity);
        }
      });

    const g = svg.append("g")
      .attr("transform", `translate(${margin}, ${margin})`);

    // Define defs for image clipping
    const defs = svg.append("defs");
    
    // Create a clipPath for each node
    data.nodes.forEach(node => {
      defs.append("clipPath")
        .attr("id", `clip-${node.id}`)
        .append("circle")
        .attr("r", node.size)
        .attr("cx", 0)
        .attr("cy", 0);
    });

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).strength(d => d.strength * 0.1))
      .force("center", d3.forceCenter((width - 2 * margin) / 2, (height - 2 * margin) / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-200))
      .force("collide", d3.forceCollide().radius(d => d.size + 5));

    const link = g.selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2);

    // Create node groups instead of just circles
    const nodeGroups = g.selectAll(".node")
      .data(data.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // Scale up the backing circle on hover
        d3.select(this).select("circle").transition().attr("r", d.size + 5);
        tooltip.style("visibility", "visible").text(d.label);
      })
      .on("mousemove", function (event) {
        tooltip.style("top", (event.pageY + 10) + "px").style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function (event, d) {
        // Scale back down on mouseout
        d3.select(this).select("circle").transition().attr("r", d.size);
        tooltip.style("visibility", "hidden");
      })
      .on("click", function (event, d) {
        router.push(d.url);
        tooltip.style("visibility", "hidden");
      });

    // Add backing circles (optional, but useful for nodes with transparent images)
    nodeGroups.append("circle")
      .attr("r", d => d.size)
      .attr("fill", d => d.color || "steelblue")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

      
    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", d => 5)
      .attr("fill", "#333")
      .text(d => d.sub);

    // Add images to the nodes
    nodeGroups.append("image")
      .attr("xlink:href", d => d.image || "https://media.istockphoto.com/id/1175266114/photo/every-day-is-a-new-start.jpg?s=612x612&w=0&k=20&c=Xe6QMcj2TprrzrjqVLft9C_aiiDnsDh6hi3p0zH6gvU=")
      .attr("x", d => -d.size)
      .attr("y", d => -d.size)
      .attr("width", d => d.size * 2) 
      .attr("height", d => d.size * 2)
      .attr("clip-path", d => `url(#clip-${d.id})`)
      .attr("preserveAspectRatio", "xMidYMid slice");



    // Show hover icons on mouseover
    nodeGroups.on("mouseover", function(event, d) {
      d3.select(this).select("circle").transition().attr("r", d.size + 5);
      d3.select(this).select("image").attr("clip-path", `url(#clip-${d.id})`);
      tooltip.style("visibility", "visible").text(d.label);
    }).on("mouseout", function(event, d) {
      d3.select(this).select("circle").transition().attr("r", d.size);
      tooltip.style("visibility", "hidden");
    });

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#333")
      .style("color", "#fff")
      .style("padding", "5px 10px")
      .style("border-radius", "5px")
      .style("visibility", "hidden");

    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

      // Update position of the entire node group
      nodeGroups.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    // Cleanup on unmount
    return () => {
      tooltip.remove();
    };

  }, [data, router]);

  return <svg className="w-full h-full" ref={ref}></svg>;
}
