async function drawLineChart() {
  // loading our data
  const data = await d3.json("./data/my_weather_data.json")

  // create our accessor functions
  // we want x-axis to show date, y-axis to show maxTemperature
  const yAccessor = (d) => d.temperatureMax

  const dateParser = d3.timeParse("%Y-%m-%d")
  const xAccessor = (d) => dateParser(d.date)

  // create our dimensions
  let dimensions = {
    height: 400,
    width: window.innerWidth * 0.9,
    margins: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }

  dimensions.boundedHeight =
    dimensions.height - dimensions.margins.top - dimensions.margins.bottom

  dimensions.boundedWidth =
    dimensions.width - dimensions.margins.left - dimensions.margins.right

  // create wrapper and bounds
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

  // create our scales
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, yAccessor))
    .range([dimensions.boundedHeight, 0])

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth])

  // create a rect to indicate freezing point and below
  const freezingPointPlacement = yScale(32)
  const freezingPointIndicator = bounds
    .append("rect")
    .attr("x", 0)
    .attr("y", freezingPointPlacement)
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight - freezingPointPlacement)
    .attr("fill", "#b6e2e2")

  // draw data
  // use line generator to generate line for the 'd' attribute of path element

  const initialLineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y(dimensions.boundedHeight)

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)))

  const line = bounds
    .append("path")
    .attr("d", initialLineGenerator(data))
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", 2)
    .transition()
    .duration(2000)

  line.attr("d", lineGenerator(data))

  // create yAxis on the chart
  const yAxisGenerator = d3.axisLeft().scale(yScale)

  const yAxis = bounds.append("g").call(yAxisGenerator)

  // create xAxis on the chart
  const xAxisGenerator = d3.axisBottom().scale(xScale)

  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translate(0, ${dimensions.boundedHeight}px)`)

  // 7. Create interactions
  const tooltip = d3.select("#tooltip")

  const listeningRect = bounds
    .append("rect")
    .attr("class", "listening-rect")
    .attr("height", dimensions.boundedHeight)
    .attr("width", dimensions.boundedWidth)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave)

  const dayDot = bounds
    .append("circle")
    .attr("class", "day-dot")
    .attr("r", 7)
    .style("opacity", 0)

  function onMouseMove(event, d) {
    const mousePosition = d3.pointer(event)
    const hoveredDate = xScale.invert(mousePosition[0])

    const getDistanceFromClosestDataPoint = (d) =>
      Math.abs(xAccessor(d) - hoveredDate)

    const closestIndex = d3.leastIndex(
      data,
      (a, b) =>
        getDistanceFromClosestDataPoint(a) - getDistanceFromClosestDataPoint(b)
    )

    const closestDataPoint = data[closestIndex]

    // populate tooltip

    const formatDate = d3.timeFormat("%B %A %-d, %Y")

    tooltip.select("#date").text(formatDate(xAccessor(closestDataPoint)))

    const formatTemperature = (d) => `${d3.format("0.1f")(d)} °F`

    tooltip
      .select("#temperature")
      .text(formatTemperature(yAccessor(closestDataPoint)))

    const x = xScale(xAccessor(closestDataPoint)) + dimensions.margins.left
    const y = yScale(yAccessor(closestDataPoint)) + dimensions.margins.top

    tooltip.style(
      "transform",
      `translate(
      calc(-50% + ${x}px),
      calc(-100% + ${y}px)
    )`
    )

    dayDot.style(
      "transform",
      `translate(
      ${xScale(xAccessor(closestDataPoint))}px,
      ${yScale(yAccessor(closestDataPoint))}px
    )`
    )

    tooltip.style("opacity", 1)
    dayDot.style("opacity", 1)
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0)
    dayDot.style("opacity", 0)
  }
}

drawLineChart()
