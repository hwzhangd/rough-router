export default class Router {
  constructor() {
    this.controller = []
  }

  on(route, callback) {
    if (Array.isArray(route)) {
      route.forEach( (route) => {
        this.controller.push({ route, callback })
      })
    } else {
      this.controller.push({ route, callback })
    }
  }

  start(ctx, next) {
    ctx.router = this
    this.exec(ctx, next)
    window.addEventListener('hashchange', () => {
      this.exec(ctx, next)
    })
  }

  exec(ctx, next) {
    let hash = location.hash
    let index = hash.indexOf('?')

    if (index !== -1) {
      hash = hash.slice(1, index)
    } else {
      hash = hash.slice(1)
    }

    if (hash === '') {
      location.hash = '#/'
    }

    this.controller.some(({route, callback}) => {
      if (route instanceof RegExp) {
        let matches = hash.match(route)
        if (matches) {
          ctx.router.match = match
          callback(ctx, next);
          return true
        }
      }

      if (typeof route === 'string') {
        let matches = route.match(/^(\/.*?\/):(.+)$/)
        if (matches) {
          let match = hash.replace(matches[1], '')
          if (match !== hash  && match.indexOf('/') === -1) {
            ctx.router.match = [match]
            callback(ctx, next)
            return true
          }
        }

        if (route === hash) {
          callback.call(ctx, next)
          return true
        }
      }

      return false
    })
  }
}
