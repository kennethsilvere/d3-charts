async function drawChart() {
  // 1. Access data
  const data = await d3.json("./data/my_weather_data.json")

  const xAccessor = (d) => d.dewPoint
  const yAccessor = (d) => d.humidity
  const colorAccessor = (d) => d.cloudCover

  // 2. Create chart dimensions

  /* The chart height & width have to be equal for a scatter plot */
  const sideLength = d3.min([window.innerHeight, window.innerWidth])

  const dimensions = {
    height: sideLength * 0.8,
    width: sideLength * 0.8,
    margins: {
      top: 10,
      right: 10,
      bottom: 80,
      left: 80,
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
    .attr("height", dimensions.height)
    .attr("width", dimensions.width)

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

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice()

  const colorScale = d3
    .scaleLinear()
    .domain(d3.extent(data, colorAccessor))
    .range(["#e6ccff", "#400080"])

  // 5. Draw data
  const dots = bounds
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", 0)
    .attr("cy", dimensions.boundedHeight)
    .attr("r", 6)
    .style("fill", (d) => colorScale(colorAccessor(d)))
    .transition()

  dots
    .transition()
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))

  // 6. Draw peripherals
  const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(5)

  const yAxis = bounds.append("g").call(yAxisGenerator)

  const xAxisGenerator = d3.axisBottom().scale(xScale)

  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)

  const xAxisLabel = xAxis
    .append("text")
    .style("fill", "black")
    .html("Dew Point (&deg;F)")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margins.bottom - 30)
    .attr("font-size", "1.5rem")

  const yAxisLabel = yAxis
    .append("text")
    .style("fill", "black")
    .html("Humidity")
    .style("transform", `rotate(-90deg)`)
    .attr("x", -(dimensions.boundedHeight / 2))
    .attr("y", -dimensions.margins.left + 30)
    .attr("font-size", "1.5rem")
    .style("text-anchor", "middle")

  // 7. Setup interactions

  const delaunay = d3.Delaunay.from(
     data,
     d => xScale(xAccessor(d)),
     d => yScale(yAccessor(d))
  )

  const voronoi = delaunay.voronoi()
  voronoi.xmax = dimensions.boundedWidth
  voronoi.ymax = dimensions.boundedHeight

  bounds.selectAll('.voronoi')
        .data(data)
        .join('path')
        .attr('class', 'voronoi')
        .attr('d', (d, i) => voronoi.renderCell(i))
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave);

  const tooltip = d3.select("#tooltip");

  function onMouseEnter(event, d) {
    let date = d["date"]
    const dateParser = d3.timeParse("%Y-%m-%d")
    const formatDate = d3.timeFormat("%B %A %-d, %Y")

    date = formatDate(dateParser(date))
    tooltip.select("#date").text(date)

    tooltip.select("#humidity")
           .text(yAccessor(d))

    tooltip.select("#dew-point")
           .text(xAccessor(d))

    const x = xScale(xAccessor(d)) + dimensions.margins.left
    const y = yScale(yAccessor(d)) + dimensions.margins.top

    tooltip.style('transform', `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`)

    const dayDot = bounds.append('circle')
         .attr("class", "tooltip-dot")
         .attr("cx", xScale(xAccessor(d)))
         .attr("cy", yScale(yAccessor(d)))
         .attr("r", 9)
         .style("fill", "salmon")
         .style("pointer-events", "none")

    tooltip.style("opacity", 1)
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0)

    d3.selectAll(".tooltip-dot").remove()
  }
}

drawChart()
