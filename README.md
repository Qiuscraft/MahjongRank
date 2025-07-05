# MahjongRank

本项目是一个立直麻将段位系统。

## 1. 项目运行

### 1.1 安装

确保安装了依赖：

```bash
pnpm install
```

新建`.env`文件，复制`.env.example`中的内容到`.env`中，并配置所有环境变量。

### 1.2 开发服务器

在`http://localhost:3000`启动开发服务器：

```bash
pnpm dev
```

### 1.3 生产

构建生产制品：

```bash
# npm
pnpm build
```

本地预览构建结果：

```bash
pnpm preview
```

查看[部署文档](https://nuxt.com/docs/getting-started/deployment)以获得更多信息。

## 2. 项目设计文档

### 2.1 前端设计

#### 2.1.1 个人主页

| 显示内容                     | 是否实现 |
|--------------------------|------|
| 排名                       |      |
| 总局数                      | √    |
| 段位                       |      |
| 最高点数                     | √    |
| 平均点数                     | √    |
| 平均顺位                     | √    |
| 顺位饼状图                    | √    |
| 数据维度图（火力、防守、稳定、运势、技术、进攻） |      |

### 2.2 后端及接口设计

[Apifox](https://apifox.com/apidoc/shared/b793d103-e1b8-4e3c-aac3-ad5f49dd785d)
