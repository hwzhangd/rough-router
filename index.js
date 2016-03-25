import co from 'co'

export default class Router {
  constructor() {
    this.controllers = []
  }

  on(route, callback) {
    if (Array.isArray(route)) {
      route.forEach( (route) => {
        this.controllers.push({ route, callback })
      })
    } else {
      this.controllers.push({ route, callback })
    }
  }

  start(ctx, next) {
    var router = this
    return function* (next) {
      var ctx = this
      this.router = router
      router.exec(ctx, next)
      window.addEventListener('hashchange', () => {
        router.exec(ctx, next)
      })
    }
  }

  exec(ctx, next) {
    let hash = location.hash
    let index = hash.indexOf('?')

    if (index !== -1) {
      hash = hash.slice(1, index)
    } else {
      hash = hash.slice(1)
    }

    if (hash[hash.length - 1] == '/') {
      hash.slice(0, -1)
    }

    if (hash === '') {
      location.hash = '#/'
    }

    ctx.router.matches = null
    for (let i = 0, len = this.controllers.length; i < len; i++) {
      let {route, callback} = this.controllers[i]
      let matches = []

      if (route instanceof RegExp) {
        matches = hash.match(route)
        if (matches) {
          ctx.router.matches = matches
        }
      }

      if (typeof route === 'string') {
        let routeFragments = route.split('/')
        let hashFragments = hash.split('/')

        if (routeFragments.length != hashFragments.length) continue

        let matched = routeFragments.every((routeFragment, j) => {
          let hashFragment = hashFragments[j]

          if (hashFragment == routeFragment) return true

          if (/^:(.+)$/.test(routeFragment)) {
            matches.push(hashFragment)
            return true
          }

          return false
        })

        if (matched) {
          ctx.router.matches = matches
        }
      }

      if (ctx.router.matches) {
        co(callback.bind(ctx, next))
        break
      }
    }
  }
}
