# admin
[![Build Status](https://travis-ci.org/kuyoonjo/ycjs-admin.svg?branch=master)](https://travis-ci.org/kuyoonjo/ycjs-admin)
[![codecov](https://codecov.io/gh/kuyoonjo/ycjs-admin/branch/master/graph/badge.svg)](https://codecov.io/gh/kuyoonjo/ycjs-admin)
[![npm version](https://badge.fury.io/js/@ycjs/admin.svg)](http://badge.fury.io/js/@ycjs/admin)
[![devDependency Status](https://david-dm.org/kuyoonjo/ycjs-admin/dev-status.svg)](https://david-dm.org/kuyoonjo/ycjs-admin?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/kuyoonjo/ycjs-admin.svg)](https://github.com/kuyoonjo/ycjs-admin/issues)
[![GitHub stars](https://img.shields.io/github/stars/kuyoonjo/ycjs-admin.svg)](https://github.com/kuyoonjo/ycjs-admin/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/kuyoonjo/ycjs-admin/master/LICENSE)

## Demo
https://kuyoonjo.github.io/ycjs-admin/demo/

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#license)

## About



## Installation

Install through npm:
```
npm install --save @ycjs/admin
```

Then include in your apps module:

```typescript
import { Component, NgModule } from '@angular/core';
import { YcjsAdminModule } from '@ycjs/admin';

@NgModule({
  imports: [
    YcjsAdminModule.forRoot()
  ]
})
export class MyModule {}
```

Finally use in one of your apps components:
```typescript
import { Component } from '@angular/core';

@Component({
  template: '<hello-world></hello-world>'
})
export class MyComponent {}
```

You may also find it useful to view the [demo source](https://github.com/kuyoonjo/ycjs-admin/blob/master/demo/demo.component.ts).

### Usage without a module bundler
```
<script src="node_modules/@ycjs/admin/bundles/@ycjs/admin.umd.js"></script>
<script>
    // everything is exported ycjsAdmin namespace
</script>
```

## Documentation
All documentation is auto-generated from the source via [compodoc](https://compodoc.github.io/compodoc/) and can be viewed here:
https://kuyoonjo.github.io/ycjs-admin/docs/

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM (should come with)
* Install local dev dependencies: `npm install` while current directory is this repo

### Development server
Run `npm start` to start a development server on port 8000 with auto reload + tests.

### Testing
Run `npm test` to run tests once or `npm run test:watch` to continually run tests.

### Release
* Bump the version in package.json (once the module hits 1.0 this will become automatic)
```bash
npm run release
```

## License

MIT
