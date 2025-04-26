document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas")
  const ctx = canvas.getContext("2d")
  const algorithmSelect = document.getElementById("algorithm")
  const runBtn = document.getElementById("run-btn")
  const clearBtn = document.getElementById("clear-btn")

    const kmeansControls = document.getElementById("kmeans-controls")
  const dbscanControls = document.getElementById("dbscan-controls")
  const hierarchyControls = document.getElementById("hierarchy-controls")

    const canvasSize = Math.min(window.innerWidth * 0.8, 600)
  canvas.width = canvasSize
  canvas.height = canvasSize

  let points = []
  let clusters = []
    const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F3FF33",
    "#FF33F3",
    "#33FFF3",
    "#FF8C33",
    "#8C33FF",
    "#FF338C",
    "#338CFF"
  ]

  
  canvas.addEventListener("click", addPoint)
  algorithmSelect.addEventListener("change", toggleControls)
  runBtn.addEventListener("click", runClustering)
  clearBtn.addEventListener("click", clearPoints)

    function toggleControls() {
    const algorithm = algorithmSelect.value

        kmeansControls.style.display = "none"
    dbscanControls.style.display = "none"
    hierarchyControls.style.display = "none"

        switch (algorithm) {
      case "kmeans":
        kmeansControls.style.display = "flex"
        break
      case "dbscan":
        dbscanControls.style.display = "flex"
        break
      case "hierarchy":
        hierarchyControls.style.display = "flex"
        break
    }
  }
      toggleControls()

    function addPoint(e) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    points.push({ x, y })
    drawPoints()
        runBtn.click()
  }

    function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

        points.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = "gray"
      ctx.fill()
    })

        if (clusters.length > 0) {
      clusters.forEach((cluster, i) => {
        const color = colors[i % colors.length]

                const center = calculateClusterCenter(cluster)

        cluster.forEach((pointIndex) => {
          const point = points[pointIndex]

                    ctx.beginPath()
          ctx.moveTo(center.x, center.y)
          ctx.lineTo(point.x, point.y)
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.stroke()

                    ctx.beginPath()
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = "black"
          ctx.lineWidth = 1
          ctx.stroke()
        })

                ctx.beginPath()
        ctx.arc(center.x, center.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = "black"
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }
  }

    function calculateClusterCenter(cluster) {
    const center = { x: 0, y: 0 }
        cluster.forEach((pointIndex) => {
      center.x += points[pointIndex].x
      center.y += points[pointIndex].y
    })
        center.x /= cluster.length
    center.y /= cluster.length

    return center
  }

  
    function clearPoints() {
    points = []
    clusters = []
    drawPoints()
  }

  function runClustering() {
    if (points.length === 0) {
      alert("Добавьте точки для кластеризации")
      return
    }

    const algorithm = algorithmSelect.value

    switch (algorithm) {
      case "kmeans":
        const k = Number.parseInt(document.getElementById("points-num").value)
        clusters = kMeans(points, k)
        break
      case "dbscan":
        const radius = Number.parseInt(document.getElementById("radius").value)
        const minPts = Number.parseInt(document.getElementById("min-pts").value)
        clusters = dbscan(points, radius, minPts)
        break
      case "hierarchy":
        const numClusters = Number.parseInt(document.getElementById("clusters-count").value)
        clusters = hierarchyClustering(points, numClusters)
        break
    }

    drawPoints()
  }

    function kMeans(points, k) {
    if (points.length < k) {
      return []
    }

    const centres = []
        const usedIndices = new Set()
        while (centres.length < k) {
      const randomIndex = Math.floor(Math.random() * points.length)
            if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex)
        centres.push({ ...points[randomIndex] })
      }
    }

    let clusters = Array(k).fill().map(() => [])
    let iterations = 0
    let centresChanged = true

        while (centresChanged && iterations < 100) {
            clusters = Array(k).fill().map(() => [])

            points.forEach((point, pointIndex) => {
        let minDistance = Number.POSITIVE_INFINITY
        let closestCentreIndex = 0

        centres.forEach((centre, centreIndex) => {
          const distance = euclideanDistance(point, centre)
          if (distance < minDistance) {
            minDistance = distance
            closestCentreIndex = centreIndex
          }
        })

        clusters[closestCentreIndex].push(pointIndex)
      })

            centresChanged = false

      centres.forEach((centre, i) => {
        if (clusters[i].length === 0) return
                const newCentre = { x: 0, y: 0 }

        clusters[i].forEach((pointIndex) => {
          newCentre.x += points[pointIndex].x
          newCentre.y += points[pointIndex].y
        })
                newCentre.x /= clusters[i].length
        newCentre.y /= clusters[i].length

                if (Math.abs(newCentre.x - centre.x) > 0.1 || Math.abs(newCentre.y - centre.y) > 0.1) {
          centresChanged = true
        }

        centres[i] = newCentre
      })

      iterations++
    }

        return clusters.filter((cluster) => cluster.length > 0)
  }

    function dbscan(points, radius, minPts) {
        const visited = new Set()
    const clusters = []
    let currentCluster = []

    points.forEach((point, pointIndex) => {
            if (visited.has(pointIndex)) return

            visited.add(pointIndex)

            const neighbors = nearPoints(points, pointIndex, radius)

                  if (neighbors.length < minPts-1) return

            currentCluster = [pointIndex]
      clusters.push(currentCluster)

            const neighborQueue = [...neighbors]

            while (neighborQueue.length > 0) {
        const currentPoint = neighborQueue.shift()

                if (visited.has(currentPoint)) continue

                visited.add(currentPoint)
        currentCluster.push(currentPoint)

                const currentNeighbors = nearPoints(points, currentPoint, radius)

                if (currentNeighbors.length >= minPts) {
          currentNeighbors.forEach((neighbor) => {
            if (!visited.has(neighbor) && !neighborQueue.includes(neighbor)) {
              neighborQueue.push(neighbor)
            }
          })
        }
      }
    })

    return clusters
  }

  function hierarchyClustering(points, numClusters) {
        let clusters = points.map((_, i) => [i])

        let distances = []
    updateDistances(clusters, distances)

        while (clusters.length > numClusters) {
      let minDistance = Number.POSITIVE_INFINITY
      let minI = 0
      let minJ = 0
            for (let i = 0; i < distances.length; i++) {
        for (let j = 0; j < distances[i].length; j++) {
          if (distances[i][j] < minDistance) {
            minDistance = distances[i][j]
            minI = i
            minJ = j
          }
        }
      }

            const newCluster = clusters[minI].concat(clusters[minJ])

            const newClusters = clusters.filter((_, i) => i !== minI && i !== minJ)
            newClusters.push(newCluster)

            const newDistances = []
      updateDistances(newClusters, newDistances)

      clusters = newClusters
      distances = newDistances
    }

    return clusters
  }

    function euclideanDistance(pointA, pointB) {
    return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2))
  }
    function nearPoints(points, pointIndex, radius) {
    const neighbors = []

    points.forEach((point, i) => {
      if (i !== pointIndex && euclideanDistance(points[pointIndex], point) <= radius) {
        neighbors.push(i)
      }
    })

    return neighbors
  }

    function clusterDistance(clusterA, clusterB, points) {
    let minDistance = Number.POSITIVE_INFINITY

        clusterA.forEach((indexA) => {
      clusterB.forEach((indexB) => {
        const distance = euclideanDistance(points[indexA], points[indexB])
        minDistance = Math.min(minDistance, distance)
      })
    })

    return minDistance
  }

    function updateDistances(clusters, distances){
    for (let i = 0; i < clusters.length; i++) {
      distances[i] = []
      for (let j = 0; j < clusters.length; j++) {
        if (i === j) {
          distances[i][j] = Number.POSITIVE_INFINITY
        } else {
          distances[i][j] = clusterDistance(clusters[i], clusters[j], points)
        }
      }
    }
  }
})

