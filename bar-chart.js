async function drawHistogram() {
  // 1. Access data
  const data = await d3.json("./data/my_weather_data.json")

  const xAccessor = (d) => d.humidity
  const yAccessor = (d) => d.length

  // 2. Create chart dimensions
  const width = 600

  const dimensions = {
    width,
    height: width * 0.6,
    margins: {
      top: 30,
      right: 10,
      bottom: 60,
      left: 60,
    },
  }

  dimensions.boundedWidth =
    dimensions.width - dimensions.margins.right - dimensions.margins.left

  dimensions.boundedHeight =
    dimensions.height - dimensions.margins.top - dimensions.margins.bottom

  // 3. Draw canvas
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  wrapper.attr("role", "figure").attr("tabindex", "0")

  wrapper
    .append("title")
    .text("Histogram looking at the distribution of humidity in 2016")

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`
    )

  // 4. Create scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice()

  const binsGenerator = d3
    .bin()
    .domain(xScale.domain())
    .value(xAccessor)
    .thresholds(12)

  const bins = binsGenerator(data)

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(bins, yAccessor)])
    .range([dimensions.boundedHeight, 0])
    .nice()

  // 5. Draw data
  const binsGroup = bounds.append("g")

  binsGroup
    .attr("tabindex", 0)
    .attr("role", "list")
    .attr("aria-label", "histogram bars")

  const binGroups = binsGroup
    .selectAll("g")
    .data(bins)
    .join("g")
    .attr("class", "bin")

  binGroups
    .attr("tabindex", "0")
    .attr("role", "listitem")
    .attr(
      "aria-label",
      (d) =>
        `There were ${yAccessor(d)} days between ${d.x0} and ${
          d.x1
        } humidity levels`
    )

  const barPadding = 1

  let barRects = binGroups
    .append("rect")
    .attr("x", (d) => xScale(d.x0) + barPadding / 2)
    .attr("y", dimensions.boundedHeight)
    .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - barPadding)
    .attr("height", 0)
    .transition()
    .duration(500)
    .ease(d3.easeBounceOut)

  barRects
    .attr("x", (d) => xScale(d.x0) + barPadding / 2)
    .attr("y", (d) => yScale(yAccessor(d)))
    .attr("height", (d) => dimensions.boundedHeight - yScale(yAccessor(d)))

  const barText = binGroups
    .filter(yAccessor)
    .append("text")
    .text((d) => yAccessor(d))
    .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
    .attr("y", dimensions.boundedHeight)
    .attr("text-anchor", "middle")
    .style("fill", "#666")
    .style("font-size", "12px")
    .style("font-family", "sans-serif")
    .transition()
    .duration(500)
    .ease(d3.easeBounceOut)

  barText
    .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
    .attr("y", (d) => yScale(yAccessor(d)) - 10)

  // 6. Draw peripherals

  const mean = d3.mean(data, xAccessor)

  const meanLine = bounds
    .append("line")
    .attr("x1", xScale(mean))
    .attr("y1", -15)
    .attr("x2", xScale(mean))
    .attr("y2", dimensions.boundedHeight)
    .style("stroke", "maroon")
    .style("stroke-dasharray", "4px 5px")

  const meanLabel = bounds
    .append("text")
    .text("mean")
    .style("fill", "maroon")
    .attr("x", xScale(mean))
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-family", "sans-serif")
    .attr("role", "presentation")
    .attr("aria-hidden", true)

  // 7. Draw axes

  const xAxisGenerator = d3.axisBottom().scale(xScale)

  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .attr("role", "presentation")
    .attr("aria-hidden", true)

  const xAxisLabel = xAxis
    .append("text")
    .text("Humidity")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margins.bottom - 10)
    .style("fill", "black")
    .style("font-size", "1.4em")
    .attr("role", "presentation")
    .attr("aria-hidden", true)

  // 8. Create interactions

  const tooltip = d3.select("#tooltip")

  binGroups.on("mouseenter", onMouseEnter).on("mouseleave", onMouseLeave)

  function onMouseEnter(event, d) {
    tooltip.select("#range").text([d.x0, d.x1].join(" - "))

    tooltip.select('#count')
           .text(d.length)

    const x = xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2 + dimensions.margins.left
    
    const y = yScale(yAccessor(d)) + dimensions.margins.top

    tooltip.style('transform', `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`)
    tooltip.style("opacity", 1)
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0)
  }
}

drawHistogram()
