;(function () {
  'use strict'

  const courtFilter = document.getElementById('court-filter')
  const analysisFilter = document.getElementById('analysis-filter')
  const sortSelect = document.getElementById('sort-select')
  const searchInput = document.getElementById('search-input')
  const table = document.getElementById('auction-table')
  const resultCount = document.getElementById('result-count')

  if (!table) return

  const tbody = table.querySelector('tbody')
  const rows = Array.from(tbody.querySelectorAll('tr'))
  const totalCount = rows.length

  // Stat card 클릭으로 법원 필터링
  const statCards = document.querySelectorAll('.stat-card[data-court]')
  statCards.forEach((card) => {
    card.addEventListener('click', () => {
      const court = card.dataset.court
      if (courtFilter) {
        courtFilter.value = courtFilter.value === court ? '' : court
        applyFilters()
      }
    })
  })

  function updateResultCount() {
    if (!resultCount) return
    const visible = rows.filter((r) => r.style.display !== 'none').length
    if (visible === totalCount) {
      resultCount.innerHTML = `총 <strong>${totalCount}</strong>건`
    } else {
      resultCount.innerHTML = `<strong>${visible}</strong> / ${totalCount}건`
    }
  }

  function applyFilters() {
    const court = courtFilter ? courtFilter.value : ''
    const analysis = analysisFilter ? analysisFilter.value : ''
    const query = searchInput ? searchInput.value.toLowerCase().trim() : ''

    rows.forEach((row) => {
      const rowCourt = row.dataset.court || ''
      const rowAnalyzed = row.dataset.analyzed || ''
      const text = row.textContent.toLowerCase()

      const courtMatch = !court || rowCourt === court
      const analysisMatch = !analysis
        || (analysis === 'analyzed' && rowAnalyzed === 'yes')
        || (analysis === 'pending' && rowAnalyzed === 'no')
      const searchMatch = !query || text.includes(query)

      row.style.display = courtMatch && analysisMatch && searchMatch ? '' : 'none'
    })

    updateResultCount()
  }

  function applySort() {
    const sortValue = sortSelect ? sortSelect.value : 'date-asc'
    const [field, direction] = sortValue.split('-')
    const multiplier = direction === 'desc' ? -1 : 1

    const sorted = [...rows].sort((a, b) => {
      let valA, valB

      switch (field) {
        case 'date':
          valA = a.dataset.date || ''
          valB = b.dataset.date || ''
          return multiplier * valA.localeCompare(valB)
        case 'price':
          valA = parseInt(a.dataset.price, 10) || 0
          valB = parseInt(b.dataset.price, 10) || 0
          return multiplier * (valA - valB)
        case 'rate':
          valA = parseInt(a.dataset.rate, 10) || 0
          valB = parseInt(b.dataset.rate, 10) || 0
          return multiplier * (valA - valB)
        default:
          return 0
      }
    })

    sorted.forEach((row) => tbody.appendChild(row))
  }

  if (courtFilter) courtFilter.addEventListener('change', applyFilters)
  if (analysisFilter) analysisFilter.addEventListener('change', applyFilters)
  if (searchInput) searchInput.addEventListener('input', applyFilters)
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applySort()
      applyFilters()
    })
  }

  // 페이지 로드 시 기본 정렬 적용 (매각기일순 오름차순)
  applySort()
  updateResultCount()
})()
