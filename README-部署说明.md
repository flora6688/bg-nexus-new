# BG Nexus 完整前端代码与部署包

本包整合当前已发布版本的官网、登录／注册页、API 文档前端，以及完整图片、字体、动效与部署配置。包含新的透明底 logo、产品能力切换、统一导航和 GitHub Pages 项目路径适配。

**独立域名或服务器部署：发布 `site/` 的全部内容。GitHub Pages：上传本包内容到仓库根目录，保留 `.github/workflows/pages.yml`。无需 npm install。**

本包包含当前网站运行所需的全部前端文件。API 文档使用已有编译资源及可复现的适配脚本；此前材料未包含其原始 React/TypeScript 工程。真实认证与金融业务后端不在本包中。

## GitHub Pages 部署

1. 解压本包，将 `BG-Nexus-complete-20261005/` 内的文件放到仓库根目录。根目录中应能同时看到 `.github/`、`site/`、`tools/`，不要再套一层外部文件夹。
2. `.github` 是隐藏目录；Mac Finder 使用 `Command + Shift + .` 显示隐藏文件，确保上传时包含它。
3. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
4. 提交到 `main` 后，**Actions → Deploy BG Nexus** 会自动发布。已启用的现有仓库不需要重复设置。
5. 该仓库的访问地址为 https://flora6688.github.io/BG-Nexus/ 。也可在 Actions 的部署结果中查看实际地址。

工作流只上传处理后的站点，不公开 `source/`、`tools/` 或说明文件。`tools/prepare-pages.py` 会读取 Pages 的实际发布路径，为资源、导航与文档路由添加正确前缀；原 `site/` 仍适用于独立域名根路径。GitHub Pages 配置必须位于根目录 `.github/workflows/pages.yml`。

可手动生成 GitHub Pages 站点：

```sh
python3 tools/prepare-pages.py --source site --output _site --base /BG-Nexus
```

脚本需要一个尚不存在的输出目录。之后再次生成，请选择新输出目录或清理自己之前生成的 `_site/`。

## 直接上传部署

1. 解压本文件。
2. 将 `site/` 内的全部文件和文件夹上传到网站根目录，确保根目录直接包含 `index.html`。
3. 在域名根路径 `/` 访问，服务器需支持目录的 `index.html`。例如 `https://你的域名/login/`。
4. 如使用 Nginx，可参考 `deploy/nginx.conf`，把 `root` 改为实际的网站根目录。

独立域名的静态托管服务发布目录填写 `site`，构建命令留空。`site/` 内原文件使用根路径；GitHub Pages 的项目子目录由上方工作流自动适配。请通过 HTTP(S) 服务器访问，不要双击 HTML 以 `file://` 方式打开。配置域名、HTTPS 证书和反向代理由部署环境处理。

## Docker 部署

在包含 Dockerfile 的目录运行：

```sh
docker build -t bg-nexus .
docker run -d --name bg-nexus -p 8080:80 --restart unless-stopped bg-nexus
```

访问 `http://服务器地址:8080/`。正式域名可由现有反向代理转发到该端口。镜像构建只复制 `site/` 到网站目录，不公开 `source/`、`tools/` 或本说明。

## 本地预览

安装 Python 3 后，在本目录运行：

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory site
```

打开 `http://127.0.0.1:8080/`。Windows 可将 `python3` 换成 `python` 或 `py -3`。

## 页面入口

| 页面 | 路径 |
| --- | --- |
| 首页 | `/` |
| 产品能力 | `/#capabilities` |
| 登录 | `/login/` |
| 注册 | `/register/` |
| API 文档 | `/docs/` |
| 外汇 API 说明 | `/docs/#fx-api` |
| 跨境支付 API | `/docs/#payments-api` |

旧控制台入口会回到站内登录页；旧产品入口回到产品能力区域。页面内导航使用同一域名。

## 文件与修改位置

- `.github/workflows/pages.yml`：已验证的 GitHub Pages 自动发布工作流。
- `tools/prepare-pages.py`：GitHub Pages 子目录路径适配与输出资源验证。

- `site/index.html`：当前首页源码，包含首页样式和动效。
- `site/site-nav.js`、`site/site-nav.css`：全站共用顶部导航。
- `site/site-routes.js`：站内链接与旧入口映射。
- `site/product-capabilities.js`、`.css`：产品能力、视频占位、API 对应关系；视频可在产品的 `video.src` 中配置。
- `site/login/index.html`、`site/login.css`、`site/login.js`：登录／注册共用模板、样式和前端交互。
- `site/register/index.html`：由登录模板生成的注册页。
- `site/bg-nexus-logo.png`：用户提供的透明底 logo，原图未修改。
- `site/docs/`、`site/static/`：API 文档及其依赖、字体。
- `source/docs-product-pages.js`、`.css`：可编辑的产品 API 文档内容。
- `source/vendor/docs-app.original.js`：导入的文档原始编译资源，只用于重建，不对外部署。
- `tools/rebuild-docs.py`：文档适配过程，移除原站旧首页、登录和控制台路由，保留文档。

首页、导航、产品和账户页面是可直接修改的 HTML/CSS/JavaScript。文档主界面来自现有编译资源，原始 React/TypeScript 工程未包含在此前材料中；本包提供现有资源和可复现的适配脚本。未混入旧版 Vinext 示例工程。

修改登录模板或 `source/docs-product-pages.*` 后，运行：

```sh
python3 tools/rebuild.py
python3 tools/validate.py
```

其余 `site/` 文件可直接编辑并部署。登录与注册共同的模板内容应在 `site/login/index.html` 修改，以免下次重建覆盖注册页单独的修改。

## 当前功能范围

- 官网、动效、产品切换、站内导航、登录注册表单和 API 文档可以直接部署。
- **真实登录、注册、邮件验证码、商户控制台后端及金融业务接口尚未接入。** 表单校验后会明确提示账号服务未连接，不会创建账户、发送或保存密码，也不会跳转到演示后台。
- 接入认证服务时，需要实际接口协议、会话与权限处理，以及与服务端一致的密码规则。当前注册页面的密码检查是前端预览规则。
- 两个产品演示视频仍为占位，外汇专属接口文档待提供；跨境支付页面保留现有接口定义。
- 文档中的示例地址、账号和响应用于说明，不代表生产服务配置。请在实际业务接入时核对服务端提供的 API 地址。

## 验证

本包附有 `tools/validate.py`，可检查页面本地资源、站内路径、当前 logo 引用、导出源文件一致性及旧登录演示逻辑是否重新出现。导出时的检查结果见 `VALIDATION.md`。`SHA256SUMS` 用于核对发布文件。
