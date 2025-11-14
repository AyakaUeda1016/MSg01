window.addEventListener("load", () => {
  const canvas = document.getElementById("radarChart")
  const ctx = canvas.getContext("2d")

  // Set canvas size
  canvas.width = 400
  canvas.height = 400

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = 140

  // Labels for each axis (clockwise from top)
  const labels = ["自己認識", "気持ちのコントロール", "理解力", "話す力", "思いやり"]

  // Data values (0-100)
  const data = [85, 90, 88, 92, 87]

  // Draw background grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.lineWidth = 1

  // Draw concentric circles
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Draw axis lines
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Draw data polygon
  ctx.strokeStyle = "rgba(100, 150, 255, 1)"
  ctx.fillStyle = "rgba(100, 150, 255, 0.3)"
  ctx.lineWidth = 2
  ctx.beginPath()

  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const value = data[i] / 100
    const x = centerX + Math.cos(angle) * radius * value
    const y = centerY + Math.sin(angle) * radius * value

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Draw labels and icons
  ctx.fillStyle = "white"
  ctx.font = "14px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const iconSize = 20
  const labelOffset = 35

  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const x = centerX + Math.cos(angle) * (radius + labelOffset)
    const y = centerY + Math.sin(angle) * (radius + labelOffset)

    // Draw icon based on index
    switch (i) {
      case 0: // Top - Lightbulb (自己認識)
        drawLightbulbIcon(ctx, x, y - 10, iconSize)
        break
      case 1: // Top-right - Heart (緊張感)
        drawHeartIcon(ctx, x, y - 10, iconSize)
        break
      case 2: // Bottom-right - Target (落ち着き)
        drawTargetIcon(ctx, x, y - 10, iconSize)
        break
      case 3: // Bottom-left - Users (傾聴力)
        drawUsersIcon(ctx, x, y - 10, iconSize)
        break
      case 4: // Top-left - Message (表現力)
        drawMessageIcon(ctx, x, y - 10, iconSize)
        break
    }

    // Draw label
    ctx.fillText(labels[i], x, y + 15)
  }
})

function drawLightbulbIcon(ctx, x, y, size) {
  ctx.strokeStyle = "white"
  ctx.lineWidth = 2
  ctx.beginPath()
  // Bulb
  ctx.arc(x, y, size / 3, 0, Math.PI * 2)
  ctx.stroke()
  // Base lines
  ctx.beginPath()
  ctx.moveTo(x - size / 4, y + size / 2.5)
  ctx.lineTo(x + size / 4, y + size / 2.5)
  ctx.moveTo(x - size / 6, y + size / 1.8)
  ctx.lineTo(x + size / 6, y + size / 1.8)
  ctx.stroke()
}

function drawHeartIcon(ctx, x, y, size) {
  ctx.strokeStyle = "white"
  ctx.fillStyle = "white"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y + size / 2.5)
  // Left curve
  ctx.bezierCurveTo(x - size / 1.8, y + size / 6, x - size / 1.8, y - size / 4, x - size / 6, y - size / 3)
  ctx.bezierCurveTo(x - size / 12, y - size / 2.5, x, y - size / 3, x, y - size / 6)
  // Right curve
  ctx.bezierCurveTo(x, y - size / 3, x + size / 12, y - size / 2.5, x + size / 6, y - size / 3)
  ctx.bezierCurveTo(x + size / 1.8, y - size / 4, x + size / 1.8, y + size / 6, x, y + size / 2.5)
  ctx.closePath()
  ctx.stroke()
}

function drawTargetIcon(ctx, x, y, size) {
  ctx.strokeStyle = "white"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, size / 2.5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, size / 4.5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, size / 9, 0, Math.PI * 2)
  ctx.stroke()
}

function drawUsersIcon(ctx, x, y, size) {
  ctx.strokeStyle = "white"
  ctx.lineWidth = 2
  // Left person
  ctx.beginPath()
  ctx.arc(x - size / 4, y - size / 3, size / 6, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x - size / 4, y + size / 6, size / 4, 0, Math.PI, true)
  ctx.stroke()
  // Right person
  ctx.beginPath()
  ctx.arc(x + size / 4, y - size / 3, size / 6, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x + size / 4, y + size / 6, size / 4, 0, Math.PI, true)
  ctx.stroke()
}

function drawMessageIcon(ctx, x, y, size) {
  ctx.strokeStyle = "white"
  ctx.lineWidth = 2
  ctx.beginPath()
  // Speech bubble
  ctx.roundRect(x - size / 2, y - size / 2, size, size * 0.7, 3)
  ctx.stroke()
  // Tail
  ctx.beginPath()
  ctx.moveTo(x - size / 6, y + size / 5)
  ctx.lineTo(x - size / 3, y + size / 2)
  ctx.lineTo(x, y + size / 5)
  ctx.stroke()
}
