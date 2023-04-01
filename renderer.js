/// @ts-check
const btn = document.getElementById('btn')
const filePathElement = document.getElementById('filePath')

btn?.addEventListener('click', async () => {
  const filePath = await window.electronAPI.openFile('hoge')
  if (filePathElement) filePathElement.innerText = filePath ?? ''
})
