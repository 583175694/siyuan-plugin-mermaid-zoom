import {
  Plugin,
  showMessage,
  getFrontend,
} from "siyuan";
import "./index.scss";
import { openZoomDialog } from "./zoom-dialog";

/**
 * 支持放大预览的图表类型
 * 思源中的代码块 data-subtype 属性值
 */
const SUPPORTED_SUBTYPES = ["mermaid", "graphviz", "plantuml"];

/**
 * 用于匹配图表渲染容器的 CSS 选择器
 * 思源渲染后的 DOM 结构：
 *   div[data-node-id][data-type="NodeCodeBlock"][data-subtype="mermaid"]
 *     └── div.protyle-action (工具栏，包含铅笔等图标 SVG)
 *     └── div.hljs (代码高亮区域，编辑时可见)
 *     └── div[spin="1"] (渲染后的图表容器)
 *         └── svg (Mermaid 渲染出来的 SVG)
 */
const CHART_BLOCK_SELECTOR = SUPPORTED_SUBTYPES.map(
  (t) => `.protyle-wysiwyg [data-subtype="${t}"]`
).join(", ");

/**
 * 从图表块中查找真正的图表 SVG（排除工具栏中的图标 SVG）
 * 思源的图表渲染结果在 div[spin="1"] 容器内，
 * 或者至少不在 .protyle-action 工具栏内。
 */
function findChartSvg(block: Element): SVGElement | null {
  // 优先从渲染容器 div[spin="1"] 中查找
  const renderContainer = block.querySelector('div[spin="1"]');
  if (renderContainer) {
    const svg = renderContainer.querySelector("svg");
    if (svg) return svg;
  }
  // 兜底：遍历所有 SVG，排除 .protyle-action 内的
  const allSvgs = block.querySelectorAll("svg");
  for (const svg of allSvgs) {
    if (!svg.closest(".protyle-action") && !svg.closest(".mermaid-zoom-btn")) {
      return svg;
    }
  }
  return null;
}

export default class MermaidZoomPlugin extends Plugin {
  private handleDblClick!: (e: MouseEvent) => void;
  private observer: MutationObserver | null = null;
  private isMobile: boolean = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onload() {
    const frontEnd = getFrontend();
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

    // 注册自定义 SVG 图标
    this.addIcons(`
      <symbol id="iconMermaidZoom" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
      </symbol>
    `);

    // ---- 方式1: 双击打开预览 ----
    this.handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 判断双击目标是否在图表渲染区域内
      const chartBlock = target.closest(CHART_BLOCK_SELECTOR);
      if (!chartBlock) return;

      // 排除点击在代码编辑区域上（hljs区域）
      if (target.closest(".hljs") || target.closest(".protyle-action")) return;

      const svg = findChartSvg(chartBlock);
      if (!svg) return;

      e.preventDefault();
      e.stopPropagation();
      openZoomDialog(svg, this.i18n);
    };
    document.addEventListener("dblclick", this.handleDblClick, true);

    // ---- 方式2: 注入放大按钮到图表块 ----
    this.setupObserver();

    // ---- 右键菜单集成 ----
    this.eventBus.on("click-blockicon", ({ detail }: any) => {
      const { menu, blockElements } = detail;

      // 判断是否包含图表块
      const chartBlock = blockElements.find((el: HTMLElement) =>
        SUPPORTED_SUBTYPES.includes(el.dataset.subtype || "")
      );

      if (chartBlock) {
        menu.addItem({
          icon: "iconMermaidZoom",
          label: this.i18n.openPreview,
          click: () => {
            const svg = findChartSvg(chartBlock);
            if (svg) openZoomDialog(svg, this.i18n);
          },
        });
      }
    });

    // ---- 注册快捷键 ----
    this.addCommand({
      langKey: "openPreview",
      hotkey: "⌥⇧Z",
      editorCallback: (protyle: any) => {
        // 找到当前聚焦的图表块
        const chartBlocks = protyle.wysiwyg.element.querySelectorAll(
          SUPPORTED_SUBTYPES.map(
            (t) => `[data-subtype="${t}"]`
          ).join(", ")
        );
        let targetSvg: SVGElement | null = null;
        for (const block of chartBlocks) {
          targetSvg = findChartSvg(block);
          if (targetSvg) break;
        }
        if (targetSvg) {
          openZoomDialog(targetSvg, this.i18n);
        } else {
          showMessage(this.i18n.dblclickTip || "Double-click a diagram to zoom in");
        }
      },
    });

    console.log(`[mermaid-zoom] Plugin loaded`);
  }

  onunload() {
    // 移除双击事件
    if (this.handleDblClick) {
      document.removeEventListener("dblclick", this.handleDblClick, true);
    }
    // 断开 Observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    // 清除防抖定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    // 移除所有已注入的放大按钮
    document.querySelectorAll(".mermaid-zoom-btn").forEach((btn) => btn.remove());

    console.log(`[mermaid-zoom] Plugin unloaded`);
  }

  /**
   * 使用 MutationObserver 监听 DOM 变化，
   * 当新的图表块渲染出来时，自动注入放大按钮
   */
  private setupObserver() {
    // 初始化：为已有的图表块注入按钮
    this.injectZoomButtons();

    // 监听 DOM 变化（带防抖）
    this.observer = new MutationObserver(() => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.injectZoomButtons();
      }, 300);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 为所有图表块注入放大按钮
   */
  private injectZoomButtons() {
    const blocks = document.querySelectorAll(CHART_BLOCK_SELECTOR);
    blocks.forEach((block) => {
      // 避免重复注入
      if (block.querySelector(".mermaid-zoom-btn")) return;

      // 确保有渲染出的 SVG（排除工具栏图标）
      const svg = findChartSvg(block);
      if (!svg) return;

      // 确保图表块有 position: relative
      const el = block as HTMLElement;
      const computedPos = window.getComputedStyle(el).position;
      if (computedPos === "static") {
        el.style.position = "relative";
      }

      // 创建放大按钮
      const btn = document.createElement("button");
      btn.className = "mermaid-zoom-btn";
      btn.title = this.i18n.zoomIn || "Zoom In";
      btn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
        </svg>
      `;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentSvg = findChartSvg(block);
        if (currentSvg) {
          openZoomDialog(currentSvg, this.i18n);
        }
      });

      el.appendChild(btn);
    });
  }
}
