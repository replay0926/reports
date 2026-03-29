;(function () {
  'use strict'

  // === DOM References ===
  const judgmentFilter = document.getElementById('judgment-filter')
  const sortSelect = document.getElementById('sort-select')
  const searchInput = document.getElementById('search-input')
  const table = document.getElementById('auction-table')
  const resultCount = document.getElementById('result-count')
  const tableView = document.getElementById('table-view')
  const cardView = document.getElementById('card-view')
  const cardGrid = document.getElementById('card-grid')
  const viewToggle = document.getElementById('view-toggle')

  if (!table) return

  const tbody = table.querySelector('tbody')
  const rows = Array.from(tbody.querySelectorAll('tr.auction-row'))
  const totalCount = rows.length

  // === View Toggle ===
  const STORAGE_KEY = 'auction-dashboard-view'
  let currentView = localStorage.getItem(STORAGE_KEY) || getDefaultView()

  function getDefaultView() {
    return window.innerWidth <= 768 ? 'card' : 'table'
  }

  function setView(view) {
    currentView = view
    localStorage.setItem(STORAGE_KEY, view)

    if (view === 'table') {
      tableView.style.display = ''
      cardView.style.display = 'none'
    } else {
      tableView.style.display = 'none'
      cardView.style.display = ''
      renderCards()
    }

    // Update toggle buttons
    if (viewToggle) {
      viewToggle.querySelectorAll('.view-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.view === view)
      })
    }
  }

  if (viewToggle) {
    viewToggle.querySelectorAll('.view-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setView(btn.dataset.view)
      })
    })
  }

  // === Card Rendering ===
  function renderCards() {
    if (!cardGrid) return
    cardGrid.innerHTML = ''

    var visibleRows = rows.filter(function (r) {
      return r.style.display !== 'none'
    })

    visibleRows.forEach(function (row) {
      var card = buildCard(row)
      cardGrid.appendChild(card)
    })
  }

  function buildCard(row) {
    var d = row.dataset
    var card = document.createElement('div')
    card.className = 'auction-card'

    // Judgment badge
    var judgmentHtml = ''
    if (d.judgment === 'GO') {
      judgmentHtml = '<span class="judgment-badge judgment-go">GO</span>'
    } else if (d.judgment === 'NOGO') {
      judgmentHtml = '<span class="judgment-badge judgment-nogo">NOGO</span>'
    } else if (d.judgment === 'CONDITIONAL') {
      judgmentHtml = '<span class="judgment-badge judgment-cond">COND</span>'
    } else {
      judgmentHtml = '<span class="judgment-badge judgment-none">--</span>'
    }

    // Status badge
    var statusHtml = ''
    var status = d.status || ''
    if (status) {
      var statusClass = ''
      if (status.indexOf('\uB9E4\uAC01') >= 0) statusClass = 'status-\uB9E4\uAC01'
      else if (status.indexOf('\uC720\uCC30') >= 0) statusClass = 'status-\uC720\uCC30'
      else if (status.indexOf('\uBCC0\uACBD') >= 0) statusClass = 'status-\uBCC0\uACBD'
      else if (status.indexOf('\uC2E0\uAC74') >= 0) statusClass = 'status-\uC2E0\uAC74'
      statusHtml = '<span class="status-badge ' + statusClass + '">' + status + '</span>'
    }

    // Risk badge
    var riskHtml = ''
    var risk = (d.risk || '').toUpperCase()
    if (risk) {
      riskHtml = '<span class="auction-card-risk auction-card-risk--' + risk.toLowerCase() + '">' + risk + '</span>'
    }

    // ROE
    var roeHtml = ''
    if (d.roeMid) {
      roeHtml = '<span class="auction-card-roe">ROE <strong>' + d.roeLow + '~' + d.roeHigh + '%</strong></span>'
    }

    // Reasons
    var reasonsHtml = ''
    var reasons = (d.reasons || '').split('|||').filter(function (r) { return r.trim() })
    if (reasons.length > 0) {
      reasonsHtml = '<div class="auction-card-reasons">'
      reasons.slice(0, 2).forEach(function (r) {
        // Clean up reason text (remove prefix like "CRITICAL: ")
        var clean = r.replace(/^(CRITICAL|HIGH|MEDIUM|LOW|R\d{3}[^:]*): ?/i, '')
        if (clean.length > 60) clean = clean.substring(0, 57) + '...'
        reasonsHtml += '<div class="auction-card-reason">' + escapeHtml(clean) + '</div>'
      })
      reasonsHtml += '</div>'
    }

    // Court short name
    var court = (d.court || '').replace('\uC9C0\uBC29\uBC95\uC6D0', '')

    // Analysis link
    var analysisHtml = ''
    if (d.analysisUrl) {
      analysisHtml = '<a href="' + d.analysisUrl + '" class="auction-card-link badge badge-analyzed">분석 보기</a>'
    } else {
      analysisHtml = '<span class="badge badge-pending">미분석</span>'
    }

    // Format min price for display
    var minPrice = d.minPrice || ''
    if (minPrice && minPrice !== '0') {
      var num = parseInt(minPrice.replace(/,/g, ''), 10)
      if (!isNaN(num)) {
        if (num >= 100000000) {
          minPrice = (num / 100000000).toFixed(1).replace(/\.0$/, '') + '\uC5B5'
        } else if (num >= 10000) {
          minPrice = Math.round(num / 10000).toLocaleString() + '\uB9CC'
        }
      }
    }

    card.innerHTML =
      '<div class="auction-card-header">' +
        '<div class="auction-card-case">' + court + '<br><strong>' + d.case + '</strong>' +
        (d.itemNo ? ' <span class="case-item">[' + d.itemNo + ']</span>' : '') +
        '</div>' +
        judgmentHtml +
      '</div>' +
      '<div class="auction-card-address">' + escapeHtml(d.address) + '</div>' +
      '<div class="auction-card-stats">' +
        '<div class="auction-card-stat">' +
          '<span class="auction-card-stat-label">최저가</span>' +
          '<span class="auction-card-stat-value">' + (d.minPrice || '--') + '</span>' +
        '</div>' +
        '<div class="auction-card-stat">' +
          '<span class="auction-card-stat-label">저감율</span>' +
          '<span class="auction-card-stat-value accent">' + (d.rate ? d.rate + '%' : '--') + '</span>' +
        '</div>' +
        '<div class="auction-card-stat">' +
          '<span class="auction-card-stat-label">매각기일</span>' +
          '<span class="auction-card-stat-value">' + (d.date || '--') + '</span>' +
        '</div>' +
        '<div class="auction-card-stat">' +
          '<span class="auction-card-stat-label">상태</span>' +
          '<span class="auction-card-stat-value">' + (statusHtml || '--') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="auction-card-meta">' +
        riskHtml +
        roeHtml +
      '</div>' +
      reasonsHtml +
      '<div class="auction-card-footer">' +
        analysisHtml +
      '</div>'

    return card
  }

  function escapeHtml(str) {
    var div = document.createElement('div')
    div.appendChild(document.createTextNode(str || ''))
    return div.innerHTML
  }

  // === KPI Card Click → Filter ===
  var kpiCards = document.querySelectorAll('.kpi-card[data-judgment]')
  kpiCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var judgment = card.dataset.judgment
      // Toggle behavior
      if (judgmentFilter) {
        if (judgmentFilter.value === judgment) {
          judgmentFilter.value = ''
        } else {
          judgmentFilter.value = judgment
        }
        updateKpiActive()
        applyFilters()
      }
    })
  })

  function updateKpiActive() {
    var current = judgmentFilter ? judgmentFilter.value : ''
    kpiCards.forEach(function (card) {
      card.classList.toggle('active', card.dataset.judgment === current)
    })
  }

  // === Filtering ===
  function updateResultCount() {
    if (!resultCount) return
    var visible = rows.filter(function (r) { return r.style.display !== 'none' }).length
    if (visible === totalCount) {
      resultCount.innerHTML = '\uCD1D <strong>' + totalCount + '</strong>\uAC74'
    } else {
      resultCount.innerHTML = '<strong>' + visible + '</strong> / ' + totalCount + '\uAC74'
    }
  }

  function applyFilters() {
    var judgment = judgmentFilter ? judgmentFilter.value : ''
    var query = searchInput ? searchInput.value.toLowerCase().trim() : ''

    rows.forEach(function (row) {
      var rowJudgment = row.dataset.judgment || ''
      var text = row.textContent.toLowerCase()

      var judgmentMatch = !judgment || rowJudgment === judgment
      var searchMatch = !query || text.includes(query)

      row.style.display = (judgmentMatch && searchMatch) ? '' : 'none'
    })

    updateResultCount()

    // Re-render cards if in card view
    if (currentView === 'card') {
      renderCards()
    }
  }

  // === Sorting ===
  function applySort() {
    var sortValue = sortSelect ? sortSelect.value : 'date-asc'
    var parts = sortValue.split('-')
    var field = parts[0]
    var direction = parts[1]
    var multiplier = direction === 'desc' ? -1 : 1

    var sorted = rows.slice().sort(function (a, b) {
      var valA, valB

      switch (field) {
        case 'date':
          valA = a.dataset.date || ''
          valB = b.dataset.date || ''
          return multiplier * valA.localeCompare(valB)
        case 'price':
          valA = parseInt((a.dataset.price || '0').replace(/,/g, ''), 10) || 0
          valB = parseInt((b.dataset.price || '0').replace(/,/g, ''), 10) || 0
          return multiplier * (valA - valB)
        case 'rate':
          valA = parseFloat(a.dataset.rate) || 0
          valB = parseFloat(b.dataset.rate) || 0
          return multiplier * (valA - valB)
        default:
          return 0
      }
    })

    sorted.forEach(function (row) { tbody.appendChild(row) })
    // Update rows array order
    rows.length = 0
    rows.push.apply(rows, sorted)
  }

  // === Event Listeners ===
  if (judgmentFilter) {
    judgmentFilter.addEventListener('change', function () {
      updateKpiActive()
      applyFilters()
    })
  }
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters)
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      applySort()
      applyFilters()
    })
  }

  // === Sidebar Toggle (mobile) ===
  const sidebarToggle = document.getElementById('sidebar-toggle')
  const sidebarContent = document.getElementById('sidebar-content')
  if (sidebarToggle && sidebarContent) {
    sidebarToggle.addEventListener('click', function () {
      const isOpen = sidebarContent.classList.toggle('open')
      sidebarToggle.textContent = isOpen ? '전략 & 회고 ▲' : '전략 & 회고 ▼'
    })
  }

  // === Init ===
  applySort()
  updateResultCount()
  setView(currentView)
})()
