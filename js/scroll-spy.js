;(function () {
  'use strict'

  const tocLinks = document.querySelectorAll('.toc-bar a[data-section]')
  if (!tocLinks.length) return

  const sectionIds = Array.from(tocLinks).map((a) => a.dataset.section)
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean)

  if (!sections.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          tocLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === id)
          })

          // 활성 TOC 항목이 보이도록 스크롤
          const activeLink = document.querySelector(`.toc-bar a[data-section="${id}"]`)
          if (activeLink) {
            activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
          }
        }
      })
    },
    {
      rootMargin: '-100px 0px -70% 0px',
      threshold: 0,
    }
  )

  sections.forEach((section) => observer.observe(section))
})()
