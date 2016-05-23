module.exports.get = function *() {
  this.body = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>foo</title></head><body>Hello World</body></html>'
}

module.exports.default = function*() {
  this.body = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>foo</title></head><body>Hello World 2</body></html>'
}
