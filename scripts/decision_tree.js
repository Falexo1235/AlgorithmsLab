class DecisionNode {
  constructor(attributeIndex, threshold, left, right, value, samples, nodePath = []) {
    this.attributeIndex = attributeIndex 
    this.threshold = threshold 
    this.left = left 
    this.right = right 
    this.value = value 
    this.samples = samples 
    this.nodePath = nodePath 
  }

  isLeaf() {
    return this.value !== undefined
  }
}

class DecisionTree {
  constructor() {
    this.root = null 
    this.attributeNames = [] 
    this.trainingData = [] 
    this.categoryAttr = "" 
    this.categoricalAttributes = {} 
  }

  calculateImpurity(y) {
    const counts = {}

    const n = y.length

    for (const label of y) {

      counts[label] = (counts[label] || 0) + 1
    }

    let impurity = 1

    for (const count of Object.values(counts)) {
      const p = count / n

      impurity -= p * p
    }

    return impurity
  }

  detectCategoricalAttributes() {

    for (const attribute of this.attributeNames) {
      this.categoricalAttributes[attribute] = false
    }

    for (const attribute of this.attributeNames) {

      for (const row of this.trainingData) {
        const value = row[attribute]
        if (isNaN(Number(value))) {
          break
        }
      }

    }
  }

  train() {

    this.detectCategoricalAttributes()

    const X = []
    const y = []

    for (const row of this.trainingData) {
      const attributes = []
      for (const attribute of this.attributeNames) {

        if (this.categoricalAttributes[attribute]) {
          attributes.push(row[attribute])
        } else {

          attributes.push(Number.parseFloat(row[attribute]))
        }
      }
      X.push(attributes)
      y.push(row[this.categoryAttr])
    }

    this.root = this.buildTree(X, y)
    return this
  }

  findBestSplit(X, y) {

    const nSamples = X.length

    const nAttributes = X[0].length

    let bestGain = Number.NEGATIVE_INFINITY
    let bestAttributeIndex = 0
    let bestThreshold = 0

    const currentImpurity = this.calculateImpurity(y)

    for (let attributeIndex = 0; attributeIndex < nAttributes; attributeIndex++) {
      const attributeName = this.attributeNames[attributeIndex]
      const isCategorical = this.categoricalAttributes[attributeName]

      const attributeValues = [...new Set(X.map((x) => x[attributeIndex]))]

      if (isCategorical) {

        for (const category of attributeValues) {

          const [leftIndexes, rightIndexes] = this.splitCategoricalData(X, attributeIndex, category)

          if (leftIndexes.length === 0 || rightIndexes.length === 0) continue

          const leftY = leftIndexes.map((idx) => y[idx])
          const rightY = rightIndexes.map((idx) => y[idx])

          const leftImpurity = this.calculateImpurity(leftY)
          const rightImpurity = this.calculateImpurity(rightY)

          const leftWeight = leftY.length / nSamples
          const rightWeight = rightY.length / nSamples

          const weightedImpurity = leftWeight * leftImpurity + rightWeight * rightImpurity

          const infoGain = currentImpurity - weightedImpurity

          if (infoGain > bestGain) {
            bestGain = infoGain
            bestAttributeIndex = attributeIndex
            bestThreshold = category
          }
        }
      } else {

        attributeValues.sort((a, b) => a - b)

        for (let i = 0; i < attributeValues.length - 1; i++) {
          const threshold = (attributeValues[i] + attributeValues[i + 1]) / 2

          const [leftIndexes, rightIndexes] = this.splitData(X, attributeIndex, threshold)

          if (leftIndexes.length === 0 || rightIndexes.length === 0) continue

          const leftY = leftIndexes.map((idx) => y[idx])
          const rightY = rightIndexes.map((idx) => y[idx])

          const leftImpurity = this.calculateImpurity(leftY)
          const rightImpurity = this.calculateImpurity(rightY)

          const leftWeight = leftY.length / nSamples
          const rightWeight = rightY.length / nSamples

          const weightedImpurity = leftWeight * leftImpurity + rightWeight * rightImpurity

          const infoGain = currentImpurity - weightedImpurity

          if (infoGain > bestGain) {
            bestGain = infoGain
            bestAttributeIndex = attributeIndex
            bestThreshold = threshold
          }
        }
      }
    }

    return {
      attributeIndex: bestAttributeIndex,
      threshold: bestThreshold,
    }
  }

  splitCategoricalData(X, attributeIndex, category) {
    const leftIndexes = []
    const rightIndexes = []

    for (let i = 0; i < X.length; i++) {

      if (X[i][attributeIndex] === category) {
        leftIndexes.push(i)

      } else {
        rightIndexes.push(i)
      }
    }

    return [leftIndexes, rightIndexes]
  }

  splitData(X, attributeIndex, threshold) {
    const leftIndexes = []
    const rightIndexes = []

    for (let i = 0; i < X.length; i++) {

      if (X[i][attributeIndex] <= threshold) {
        leftIndexes.push(i)

      } else {
        rightIndexes.push(i)
      }
    }

    return [leftIndexes, rightIndexes]
  }

  getLeafValue(y) {
    const counts = {}
    let maxCount = 0
    let mostCommonClass = null

    for (const label of y) {
      counts[label] = (counts[label] || 0) + 1
      if (counts[label] > maxCount) {
        maxCount = counts[label]
        mostCommonClass = label
      }
    }

    return mostCommonClass
  }

  buildTree(X, y, depth = 0, nodePath = []) {
    const nSamples = X.length

    if (new Set(y).size === 1) {
      const leafNode = new DecisionNode(null, null, null, null, this.getLeafValue(y), nSamples, nodePath)
      leafNode.originalY = [...y] 
      return leafNode
    }

    const { attributeIndex, threshold } = this.findBestSplit(X, y)
    const attributeName = this.attributeNames[attributeIndex]
    const isCategorical = this.categoricalAttributes[attributeName]

    let leftIndexes, rightIndexes

    if (isCategorical) {
      ;[leftIndexes, rightIndexes] = this.splitCategoricalData(X, attributeIndex, threshold)
    } else {
      ;[leftIndexes, rightIndexes] = this.splitData(X, attributeIndex, threshold)
    }

    const leftX = leftIndexes.map((idx) => X[idx])
    const leftY = leftIndexes.map((idx) => y[idx])

    let leftPathThreshold
    if (isCategorical) {
      leftPathThreshold = `=${threshold}`
    } else {
      leftPathThreshold = `≤${threshold.toFixed(3)}`
    }

    const leftPath = [
      ...nodePath,
      {
        attribute: attributeName,
        value: leftPathThreshold,
      },
    ]

    const left = this.buildTree(leftX, leftY, depth + 1, leftPath)

    const rightX = rightIndexes.map((idx) => X[idx])
    const rightY = rightIndexes.map((idx) => y[idx])

    let rightPathThreshold
    if (isCategorical) {
      rightPathThreshold = `≠${threshold}`
    } else {
      rightPathThreshold = `>${threshold.toFixed(3)}`
    }

    const rightPath = [
      ...nodePath,
      {
        attribute: attributeName,
        value: rightPathThreshold,
      },
    ]
    const right = this.buildTree(rightX, rightY, depth + 1, rightPath)

    const node = new DecisionNode(attributeIndex, threshold, left, right, undefined, nSamples, nodePath)
    node.isCategorical = isCategorical

    node.impurity = this.calculateImpurity(y)
    node.originalY = [...y] 

    return node
  }

  optimizeTree(criticalError) {
    if (!this.root) return

    const pruneNode = (node) => {

      if (node.isLeaf()) return node

      node.left = pruneNode(node.left)
      node.right = pruneNode(node.right)

      if (node.left.isLeaf() && node.right.isLeaf()) {

        if (node.impurity <= criticalError) {

          const leafNode = new DecisionNode(
            null,
            null,
            null,
            null,
            this.getLeafValue(node.originalY),
            node.samples,
            node.nodePath,
          )
          leafNode.originalY = [...node.originalY] 
          return leafNode
        }
      }

      return node
    }

    this.root = pruneNode(this.root)

    return this
  }

  predict(sample) {

    this.lastDecisionPath = []

    const x = this.attributeNames.map((attribute) => {
      if (this.categoricalAttributes[attribute]) {

        return sample[attribute]
      } else {

        return Number.parseFloat(sample[attribute])
      }
    })

    let node = this.root

    while (!node.isLeaf()) {
      const attributeName = this.attributeNames[node.attributeIndex]
      const attributeValue = x[node.attributeIndex]

      let decision

      if (node.isCategorical) {
        decision = attributeValue === node.threshold
      } else {
        decision = attributeValue <= node.threshold
      }

      this.lastDecisionPath.push({
        type: "attribute",
        name: attributeName,
        value: attributeValue,
        threshold: node.threshold,
        isCategorical: node.isCategorical,
        decision: decision,
      })

      node = decision ? node.left : node.right
    }

    this.lastDecisionPath.push({
      type: "prediction",
      value: node.value,
      count: node.samples,
    })

    return node.value
  }

  getDecisionPath() {
    return this.lastDecisionPath
  }

  toTreeFormat(node = this.root) {
    if (!node) return null

    if (node.isLeaf()) {
      return {
        name: `${node.value}`,
        samples: node.samples,
        nodePath: node.nodePath,
        tooltip: this.getClassDistribution(node.originalY || [node.value]),
      }
    }

    const attributeName = this.attributeNames[node.attributeIndex]

    let nodeName
    if (node.isCategorical) {
      nodeName = `${attributeName} = ${node.threshold}`
    } else {
      nodeName = `${attributeName} ≤ ${node.threshold.toFixed(3)}`
    }

    return {
      name: nodeName,
      samples: node.samples,
      nodePath: node.nodePath,
      tooltip: this.getClassDistribution(node.originalY),
      children: [this.toTreeFormat(node.left), this.toTreeFormat(node.right)],
    }
  }

  getClassDistribution(y) {
    if (!y || y.length === 0) return "Нет данных"

    const counts = {}
    const total = y.length

    for (const label of y) {
      counts[label] = (counts[label] || 0) + 1
    }

    let distribution = `Всего: ${total} объектов\nРаспределение классов:\n`

    for (const [label, count] of Object.entries(counts)) {

      const percentage = ((count / total) * 100).toFixed(1)
      distribution += `${label}: ${count} (${percentage}%)\n`
    }

    return distribution
  }
}

function parseCSV(csvText) {

  const lines = csvText.trim().split("\n")

  const headers = lines[0].split(",")

  const result = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue 

    const values = line.split(",")
    const obj = {}

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j]
    }

    result.push(obj)
  }

  return result
}


function visualizeTree(data, targetColumnName) {

  const container = document.getElementById("treeVisualization")
  container.innerHTML = ""

  const title = document.createElement("h3")
  title.textContent = `Определение ${targetColumnName}`
  title.style.textAlign = "center"
  container.appendChild(title)

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", "100%")

  function getTreeDepth(node) {
    if (!node || !node.children || node.children.length === 0) return 0
    return 1 + Math.max(...node.children.map(getTreeDepth))
  }

  const treeDepth = getTreeDepth(data)

  const svgHeight = Math.max(600, (treeDepth + 1) * 100)

  svg.setAttribute("height", svgHeight)
  container.appendChild(svg)

  const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  svg.appendChild(mainGroup)

  const hierarchy = data

  const treeLayout = calculateTreeLayout(hierarchy)

  drawLinks(treeLayout, mainGroup)

  drawNodes(treeLayout, mainGroup)

  setupZoom(svg, mainGroup)

  const initialScale = Math.min(1, container.clientWidth / (treeLayout._width || 800))
  mainGroup.setAttribute("transform", `translate(20, 60) scale(${initialScale})`)
}

function calculateTreeLayout(root) {

  function getDepth(node) {
    if (!node.children || node.children.length === 0) return 0
    return 1 + Math.max(...node.children.map(getDepth))
  }

  function countLeaves(node) {
    if (!node.children || node.children.length === 0) return 1
    return node.children.reduce((sum, child) => sum + countLeaves(child), 0)
  }

  const depth = getDepth(root)
  const totalLeaves = countLeaves(root)

  const nodeMinWidth = 240

  const containerWidth = document.getElementById("treeVisualization").clientWidth - 40
  const width = Math.max(containerWidth, totalLeaves * nodeMinWidth)
  const height = 400 + 80 * depth

  const levelHeight = height / (depth + 1)

  function calculateNodeWidths(node) {
    if (!node) return 0

    if (!node.children || node.children.length === 0) {
      node._width = nodeMinWidth
      return node._width
    }

    let totalChildrenWidth = 0
    for (const child of node.children) {
      totalChildrenWidth += calculateNodeWidths(child)
    }

    node._width = Math.max(totalChildrenWidth, nodeMinWidth)
    return node._width
  }

  calculateNodeWidths(root)

  function layoutNode(node, level = 0, leftPos = 0) {
    if (!node) return null

    if (!node.children || node.children.length === 0) {
      const x = leftPos + nodeMinWidth / 2
      const y = level * levelHeight
      return { ...node, x, y, level }
    }

    const childrenCount = node.children.length
    let currentLeftPos = leftPos
    const processedChildren = []

    for (let i = 0; i < childrenCount; i++) {
      const child = node.children[i]
      const processedChild = layoutNode(child, level + 1, currentLeftPos)
      if (processedChild) {
        processedChildren.push(processedChild)
        currentLeftPos += child._width
      }
    }

    let x
    if (processedChildren.length > 0) {
      const firstChild = processedChildren[0]
      const lastChild = processedChildren[processedChildren.length - 1]
      x = (firstChild.x + lastChild.x) / 2
    } else {
      x = leftPos + node._width / 2
    }

    const y = level * levelHeight
    return { ...node, x, y, level, children: processedChildren }
  }

  return layoutNode(root)
}

function drawLinks(node, container) {

  if (!node || !node.children || node.children.length === 0) return

  for (const child of node.children) {

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", node.x)
    line.setAttribute("y1", node.y)
    line.setAttribute("x2", child.x)
    line.setAttribute("y2", child.y)
    line.setAttribute("stroke", "#ccc")
    line.setAttribute("stroke-width", "2")
    line.setAttribute("class", "link")
    container.appendChild(line)

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttribute("x", (node.x + child.x) / 2)
    text.setAttribute("y", (node.y + child.y) / 2 - 5)
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("font-size", "12px")
    text.setAttribute("class", "link-label")

    const isLeft = node.children[0] === child
    text.textContent = isLeft ? "Да" : "Нет"

    container.appendChild(text)

    drawLinks(child, container)
  }
}

function drawNodes(node, container) {
  if (!node) return

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
  group.setAttribute("transform", `translate(${node.x}, ${node.y})`)
  group.setAttribute("class", `node ${node.children && node.children.length > 0 ? "node--internal" : "node--leaf"}`)

  if (node.nodePath) {
    group.setAttribute("data-path", JSON.stringify(node.nodePath))
  }

  const name = node.name
  const width = Math.max(name.length * 7, 120)

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  rect.setAttribute("width", width)
  rect.setAttribute("height", "40")
  rect.setAttribute("x", -width / 2)
  rect.setAttribute("y", "-20")
  rect.setAttribute("rx", "5")
  rect.setAttribute("ry", "5")
  rect.setAttribute("fill", node.children && node.children.length > 0 ? "#e6f3ff" : "#e6ffe6")
  rect.setAttribute("stroke", "#666")
  rect.setAttribute("stroke-width", "1")

  group.appendChild(rect)

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
  text.setAttribute("dy", "5")
  text.setAttribute("text-anchor", "middle")
  text.setAttribute("font-size", "12px")

  if (!node.children || node.children.length === 0) {
    text.textContent = `${node.name} (${node.samples})`
  } else {

    const displayText = `${node.name} (${node.samples})`
    if (displayText.length > 20) {
      text.textContent = displayText.substring(0, 17) + "..."
    } else {
      text.textContent = displayText
    }
  }

  const title = document.createElementNS("http://www.w3.org/2000/svg", "title")
  title.textContent = node.tooltip || "Нет данных"
  text.appendChild(title)

  group.appendChild(text)
  container.appendChild(group)

  if (node.children) {
    for (const child of node.children) {
      drawNodes(child, container)
    }
  }
}

function setupZoom(svg, mainGroup) {
  let scale = 1
  let translateX = 0
  let translateY = 0
  let startX, startY
  let dragging = false

  svg.addEventListener("wheel", (event) => {
    event.preventDefault()

    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.max(0.5, Math.min(2, scale + delta))

    scale = newScale
    updateTransform()
  })

  svg.addEventListener("mousedown", (event) => {
    const rect = svg.getBoundingClientRect()
    startX = event.clientX - rect.left
    startY = event.clientY - rect.top
    dragging = true
  })

  svg.addEventListener("mousemove", (event) => {
    if (!dragging) return

    const rect = svg.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    translateX += (x - startX) / scale
    translateY += (y - startY) / scale

    startX = x
    startY = y

    updateTransform()
  })

  svg.addEventListener("mouseup", () => {
    dragging = false
  })

  svg.addEventListener("mouseleave", () => {
    dragging = false
  })

  function updateTransform() {
    mainGroup.setAttribute("transform", `translate(${translateX + 20}, ${translateY + 60}) scale(${scale})`)
  }
}

function highlightDecisionPath(path) {

  const highlightedNodes = document.querySelectorAll(".highlighted-node")
  highlightedNodes.forEach((node) => {
    node.classList.remove("highlighted-node")
    const rect = node.querySelector("rect")
    if (rect) {
      rect.setAttribute("fill", node.classList.contains("node--internal") ? "#e6f3ff" : "#e6ffe6")
    }
  })

  const highlightedLinks = document.querySelectorAll(".highlighted-link")
  highlightedLinks.forEach((link) => {
    link.classList.remove("highlighted-link")
    link.setAttribute("stroke", "#ccc")
    link.setAttribute("stroke-width", "2")
  })

  const pathToMatch = []

  for (let i = 0; i < path.length - 1; i++) {
    if (path[i].type === "attribute") {
      let valueDescription
      if (path[i].isCategorical) {
        valueDescription = path[i].decision ? `=${path[i].threshold}` : `≠${path[i].threshold}`
      } else {
        valueDescription = path[i].decision ? `≤${path[i].threshold.toFixed(3)}` : `>${path[i].threshold.toFixed(3)}`
      }

      pathToMatch.push({
        attribute: path[i].name,
        value: valueDescription,
      })
    }
  }

  const nodes = document.querySelectorAll(".node")
  nodes.forEach((node) => {
    const nodePathStr = node.getAttribute("data-path")
    if (nodePathStr) {
      const nodePath = JSON.parse(nodePathStr)

      if (isSubPath(nodePath, pathToMatch)) {
        node.classList.add("highlighted-node")
        const rect = node.querySelector("rect")
        if (rect) {
          rect.setAttribute("fill", "#ffcc99")
        }

        if (nodePath.length > 0) {

          const transform = node.getAttribute("transform")
          const coords = transform.replace("translate(", "").replace(")", "").split(",")
          const x = Number.parseFloat(coords[0])
          const y = Number.parseFloat(coords[1])

          const links = document.querySelectorAll("line.link")
          links.forEach((link) => {
            const lineX2 = Number.parseFloat(link.getAttribute("x2"))
            const lineY2 = Number.parseFloat(link.getAttribute("y2"))

            if (Math.abs(lineX2 - x) < 0.1 && Math.abs(lineY2 - y) < 0.1) {
              link.classList.add("highlighted-link")
              link.setAttribute("stroke", "#ff9933")
              link.setAttribute("stroke-width", "3")
            }
          })
        }
      }
    }
  })
}

function isSubPath(nodePath, decisionPath) {
  if (nodePath.length > decisionPath.length) return false

  for (let i = 0; i < nodePath.length; i++) {
    if (nodePath[i].attribute !== decisionPath[i].attribute || nodePath[i].value !== decisionPath[i].value) {
      return false
    }
  }

  return true
}

document.addEventListener("DOMContentLoaded", () => {
  let decisionTree = null
  
  document.getElementById("buildTree").addEventListener("click", () => {
    try {
      const trainingDataText = document.getElementById("trainingData").value
      if (!trainingDataText.trim()) {
        throw new Error("Введите обучающие данные")
      }

      const parsedData = parseCSV(trainingDataText)
      if (parsedData.length < 2) {
        throw new Error("Недостаточно строк данных")
      }

      const attributes = Object.keys(parsedData[0])
      const categoryAttr = attributes[attributes.length - 1] 
      const attributeNames = attributes.slice(0, -1) 

      decisionTree = new DecisionTree()

      decisionTree.trainingData = parsedData
      decisionTree.attributeNames = attributeNames
      decisionTree.categoryAttr = categoryAttr

      decisionTree.train()

      const treeData = decisionTree.toTreeFormat()
      visualizeTree(treeData, categoryAttr)

      document.getElementById("trainingError").classList.add("hidden")

      document.getElementById("predictionResult").classList.add("hidden")

    } catch (error) {
      document.getElementById("trainingError").textContent = error.message
      document.getElementById("trainingError").classList.remove("hidden")
    }
  })

  document.getElementById("addToTestData").addEventListener("click", () => {
    const testDataSelect = document.getElementById("testDataSelect")
    const selectedValue = testDataSelect.value

    if (selectedValue !== "") {
      document.getElementById("testData").value = selectedValue
    }
  })

  document.getElementById("predictButton").addEventListener("click", () => {
    try {
      if (!decisionTree) {
        throw new Error("Сначала постройте дерево.")
      }

      const testDataStr = document.getElementById("testData").value.trim()
      if (!testDataStr) {
        throw new Error("Введите тестовые данные.")
      }

      const attributeNames = decisionTree.attributeNames
      const csvHeader = attributeNames.join(",")
      const testCsvStr = `${csvHeader}\n${testDataStr}`

      const parsedTestData = parseCSV(testCsvStr)[0]

      const prediction = decisionTree.predict(parsedTestData)
      const decisionPath = decisionTree.getDecisionPath()

      document.getElementById("predictionValue").textContent = prediction

      let pathText = ""
      decisionPath.forEach((step, index) => {
        if (step.type === "attribute") {
          let valueText
          if (step.isCategorical) {
            valueText = `Значение равно "${step.value}", `
            valueText += step.decision ? `= ${step.threshold} → Влево\n` : `≠ ${step.threshold} → Вправо\n`
          } else {
            valueText = `Значение равно ${step.value}, `
            valueText += step.decision
              ? `≤ ${step.threshold.toFixed(3)} → Влево\n`
              : `> ${step.threshold.toFixed(3)} → Вправо\n`
          }
          pathText += `${index + 1}. Проверка "${step.name}": ${valueText}`
        } else {
          pathText += `${index + 1}. Результат: "${step.value}" (${step.count} строк)\n`
        }
      })

      document.getElementById("decisionPath").textContent = pathText
      document.getElementById("predictionResult").classList.remove("hidden")

      highlightDecisionPath(decisionPath)

      document.getElementById("testError").classList.add("hidden")
    } catch (error) {
      document.getElementById("testError").textContent = error.message
      document.getElementById("testError").classList.remove("hidden")
    }
  })

  document.getElementById("optimizeTree").addEventListener("click", () => {
    try {
      if (!decisionTree) {
        throw new Error("Сначала постройте дерево.")
      }

      const criticalError = Number.parseFloat(document.getElementById("criticalError").value)

      decisionTree.optimizeTree(criticalError)

      const treeData = decisionTree.toTreeFormat()
      const categoryAttr = decisionTree.categoryAttr
      visualizeTree(treeData, categoryAttr)

      document.getElementById("predictionResult").classList.add("hidden")

      document.getElementById("trainingError").classList.add("hidden")
    } catch (error) {
      document.getElementById("trainingError").textContent = error.message
      document.getElementById("trainingError").classList.remove("hidden")
    }
  })

  document.getElementById("loadExampleBtn").addEventListener("click", () => {

    document.getElementById("trainingData").value =
      "age,income,student,credit_rating,buys_computer\n" +
      "30,high,no,fair,no\n" +
      "25,high,no,excellent,no\n" +
      "46,medium,no,fair,yes\n" +
      "60,medium,no,fair,yes\n" +
      "55,low,yes,fair,yes\n" +
      "52,low,yes,excellent,no\n" +
      "42,low,yes,excellent,yes\n" +
      "35,medium,no,fair,no\n" +
      "28,low,yes,fair,yes\n" +
      "62,medium,yes,fair,yes\n" +
      "31,medium,yes,excellent,yes\n" +
      "45,medium,no,excellent,yes\n" +
      "40,high,yes,fair,yes\n" +
      "58,medium,no,excellent,no"
  })
})