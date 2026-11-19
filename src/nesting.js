
const templates = [
  { id: 'keyring', name: '키링', width: 10, height: 10 },
  { id: 'wallet', name: '카드지갑', width: 20, height: 15 },
  { id: 'pouch', name: '파우치', width: 25, height: 20 },
]

// 한 방향으로 직사각형 도안을 배치
function calculateLayout(fabricWidth, fabricHeight, itemWidth, itemHeight) {
  const columns = Math.floor(fabricWidth / itemWidth)
  const rows = Math.floor(fabricHeight / itemHeight)

  const count = columns * rows
  const fabricArea = fabricWidth * fabricHeight
  const usedArea = count * itemWidth * itemHeight

  return {
    columns,
    rows,
    count,
    itemWidth,
    itemHeight,
    usage: (usedArea / fabricArea) * 100,
  }
}

// 원래 방향과 90도 회전 방향 비교
export function calculateRecommendations(width, height, quantity) {
  const fabricWidth = Number(width)
  const fabricHeight = Number(height)
  const fabricQuantity = Number(quantity)

  return templates.map((template) => {
    const normal = calculateLayout(
      fabricWidth,
      fabricHeight,
      template.width,
      template.height
    )

    const rotated = calculateLayout(
      fabricWidth,
      fabricHeight,
      template.height,
      template.width
    )

    const best = rotated.count > normal.count ? rotated : normal

    return {
      ...template,
      ...best,
      rotated: rotated.count > normal.count,
      totalCount: best.count * fabricQuantity,
      possible: best.count > 0,
    }
  }).sort((a, b) => b.usage - a.usage)
}
