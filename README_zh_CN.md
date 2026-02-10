# Mermaid 图表放大预览

一个 [思源笔记](https://b3log.org/siyuan) 插件，为 Mermaid / Graphviz / PlantUML 图表添加**点击放大预览**功能。

## 功能特性

- **双击图表** → 全屏弹窗查看大图
- **鼠标滚轮** 缩放
- **拖拽平移** 浏览大图
- **重置缩放** 按钮恢复原始视图
- **导出 PNG** 2倍分辨率保证清晰度
- **快捷键** `Alt+Shift+Z` 快速打开预览
- **悬浮按钮** 鼠标悬停时右上角显示放大按钮
- **右键菜单** 集成

## 支持的图表类型

- Mermaid
- Graphviz
- PlantUML

## 安装方式

### 从思源集市安装

1. 打开思源笔记
2. 进入 **设置 → 集市 → 插件**
3. 搜索 "Mermaid Zoom" 或 "Mermaid 图表放大预览"
4. 点击安装

### 手动安装

1. 从 [Releases](https://github.com/583175694/siyuan-plugin-mermaid-zoom/releases) 下载 `package.zip`
2. 解压到 `{思源工作空间}/data/plugins/siyuan-plugin-mermaid-zoom/`
3. 重启思源或刷新页面

## 使用方法

1. 在思源笔记中创建一个 Mermaid/Graphviz/PlantUML 代码块
2. 图表渲染完成后：
   - **双击** 图表即可打开全屏预览
   - **鼠标悬停** 在图表上，右上角会出现放大按钮
   - 当图表块获得焦点时，使用 **Alt+Shift+Z** 快捷键
3. 在预览弹窗中：
   - 使用工具栏按钮放大/缩小或重置
   - 滚动鼠标滚轮进行缩放
   - 点击并拖拽进行平移
   - 点击"导出 PNG"将图表下载为图片

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发模式（监听文件变化）
pnpm run dev

# 构建生产版本
pnpm run build
```

## 许可证

[MIT](LICENSE)
