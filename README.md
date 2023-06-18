# STATIC-UPLOAD

上传静态资源到服务器，目前支持 aliyun oss。

## 安装

```bash
$ pnpm global add @vingogo/static-upload
```

## 配置文件

如果使用 OSS，则在项目根目录下创建 oss.config.js，配置上传基本信息:

```javascript
module.exports = {
  bucket: 'vingogo',
  region: 'oss-cn-guangzhou',
  directory: 'dist',
  prefix: `test`
};
```

## 使用

```bash
$ static-upload start
```
