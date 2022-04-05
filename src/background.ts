import storage from './core/storage'

chrome.runtime.onMessage.addListener(({ type, value }, _sender, callback) => {
  switch (type) {
    case 'storage':
      storage.set({ [value.key]: value.value })
      updatePage(value.key, value.value)
      break
    case 'tryReload':
      fetch(value)
        .then((res: XMLHttpRequest) => callback && callback(res.responseText))
        .catch(err => {
          console.error(err)
          callback()
        })
      break
  }
  return true
})

function fetch(url: string, method: string = 'GET', params?): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = ({ target }) => {
      const { readyState, status } = xhr
      if (readyState === xhr.DONE) {
        if (status === 0 || (status >= 200 && status < 400)) {
          resolve(target)
        } else {
          reject(new Error('Request failed'))
        }
      }
    }
    xhr.onerror = reject
    xhr.open(method, url)
    xhr.send(params)
  })
}

const actions = {
  enable: 'reload',
  refresh: 'toggleRefresh',
  centered: 'toggleCentered',
  mdPlugins: 'updateMdPlugins',
  pageTheme: 'updatePageTheme',
}

function updatePage(type: string, value: any) {
  const action = actions[type]

  action &&
    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
      tabs.length &&
        chrome.tabs.sendMessage(tabs[0].id, { type: action, value })
    })
}
