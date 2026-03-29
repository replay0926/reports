;(function () {
  'use strict'

  /**
   * 리포트 섹션을 접이식(details/summary)으로 변환
   * .report-divider[data-label] 기준으로 분할
   */
  function convertToCollapsible() {
    const container = document.querySelector('.report-content')
    if (!container) return

    const dividers = container.querySelectorAll('.report-divider[data-label]')
    if (!dividers.length) return

    dividers.forEach(function (divider, index) {
      var label = divider.getAttribute('data-label')
      var siblings = []
      var next = divider.nextElementSibling

      // divider 다음 요소부터 다음 divider 전까지 수집
      while (next && !next.classList.contains('report-divider')) {
        siblings.push(next)
        next = next.nextElementSibling
      }

      if (!siblings.length) return

      // details 요소 생성
      var details = document.createElement('details')
      details.className = 'report-collapsible'
      // 첫 번째 섹션은 기본 열림
      if (index === 0) {
        details.open = true
      }

      var summary = document.createElement('summary')
      summary.className = 'report-collapsible-summary'
      summary.innerHTML =
        '<span class="report-collapsible-label">' + label + '</span>' +
        '<span class="report-collapsible-icon"></span>'

      var content = document.createElement('div')
      content.className = 'report-collapsible-content'

      siblings.forEach(function (el) {
        content.appendChild(el)
      })

      details.appendChild(summary)
      details.appendChild(content)

      // divider 자리에 details 삽입
      divider.parentNode.replaceChild(details, divider)
    })
  }

  // DOMContentLoaded 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', convertToCollapsible)
  } else {
    convertToCollapsible()
  }
})()
