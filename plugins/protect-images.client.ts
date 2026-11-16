// Stops the right click menu and dragging on watermarked pictures (/media/...). This only
// removes the easy ways to save one; the logo is part of the file itself, so a copy taken any
// other way still carries it.
export default defineNuxtPlugin(() => {
  const isProtected = (t: EventTarget | null) =>
    t instanceof HTMLImageElement && /\/media\/(products|portfolios)\//.test(t.currentSrc || t.src)
  const block = (e: Event) => {
    if (isProtected(e.target)) e.preventDefault()
  }
  document.addEventListener('contextmenu', block)
  document.addEventListener('dragstart', block)
})
