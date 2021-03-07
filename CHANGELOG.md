# Changelog


## [1.4.14] - 2021-03-02

### Added

- Schema.prototype.pre('findOneAndUpdate', ()=>{})
- Schema.prototype.pre('findOneAndDelete', ()=>{})

### Changed

- Model.prototype.updateOne()
- Model.prototype.updateMany()
- Model.prototype.findOneAndUpdate()
- Model.prototype.findOneAndDelete()


## [1.4.13] - 2021-03-02

### Added

- Check if table exists, otherwise update structure during connection creating

### Changed

- sqltool.connect() and sqltool.createConnection() are async functions

### Removed

- Check if table exists for each query


## [1.4.12] - 2021-03-01

### Added

- Model.prototype.findOneAndDelete()
- Model.prototype.findByIdAndDelete()
- Model.prototype.findOneAndUpdate()
- Model.prototype.findByIdAndUpdate()


## [1.4.11] - 2021-02-26

### Added

- Descriptions of query selectors
- More connection params of mysql

### Changed

- Model.prototype.findOne()
- Model.prototype.findById()


[1.4.14]: https://github.com/ashotsiroyan/sqltool/compare/1.4.13...1.4.14
[1.4.13]: https://github.com/ashotsiroyan/sqltool/compare/1.4.12...1.4.13
[1.4.12]: https://github.com/ashotsiroyan/sqltool/compare/1.4.11...1.4.12
[1.4.11]: https://github.com/ashotsiroyan/sqltool/compare/1.4.10...1.4.11