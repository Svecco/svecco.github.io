# Layout 重排优化指南

## 🎯 问题诊断

根据 Firefox 性能分析，**Layout 开销占 94%** 是当前卡顿的主要原因。根本原因是**强制同步布局**（Forced Synchronous Layouts）。

### 强制同步布局的典型模式：
```javascript
// ❌ 错误示例 - 触发强制同步布局
function badExample() {
    const element = document.querySelector('.item');
    const currentTop = element.offsetTop;    // 读取布局属性 - 触发布局计算
    element.style.top = `${currentTop + 10}px`; // 立即修改样式 - 强制重新布局
}
```

## 🛠️ 实施的优化方案

### 1. 分离读写操作（核心优化）

**原理**：将 DOM 读取操作和写入操作分离到不同的渲染帧中

```javascript
// ✅ 正确做法 - 使用 LayoutBatcher
import { layoutBatcher } from '@utils/layout-optimizer';

// 读取操作批次
const scrollTop = await layoutBatcher.read(() => 
    Math.max(document.body.scrollTop, document.documentElement.scrollTop)
);

// 写入操作批次
await layoutBatcher.write(() => {
    if (scrollTop > threshold) {
        element.classList.add('visible');
    }
});
```

### 2. 布局缓存机制

**原理**：缓存昂贵的布局属性读取结果，避免重复计算

```javascript
// ✅ 使用 LayoutCache
import { layoutCache } from '@utils/layout-optimizer';

const bannerHeight = layoutCache.get('bannerHeight', () => 
    window.innerHeight * (BANNER_HEIGHT / 100)
);
```

### 3. Transform 替代 Layout 属性

**原理**：使用 `transform` 和 `opacity` 等复合属性替代会触发布局的属性

```css
/* ❌ 会触发布局的属性 */
.item {
    top: 20px;
    left: 10px;
    margin: 5px;
    width: 100px;
}

/* ✅ 只触发合成的属性 */
.item {
    transform: translate(10px, 20px);
    width: 100px; /* 静态宽度不触发布局 */
}
```

### 4. 布局隔离

**原理**：使用 `contain` 属性限制布局变化的影响范围

```css
.optimized-container {
    contain: layout style paint;
    transform: translateZ(0);
}
```

## 📊 性能提升预期

| 优化项 | 预期效果 | 实现难度 |
|--------|----------|----------|
| 分离读写操作 | Layout 开销降低 60-80% | ⭐⭐ |
| 布局缓存 | 减少重复计算 40-60% | ⭐⭐ |
| Transform 替代 | 消除特定 Layout 开销 | ⭐⭐⭐ |
| 布局隔离 | 减少级联布局计算 | ⭐⭐ |

## 🔧 实施步骤

### 第一步：部署基础工具
```bash
# 已创建的工具文件
src/utils/layout-optimizer.ts      # 布局批处理和缓存
src/utils/css-transform-optimizer.ts # Transform 优化工具
```

### 第二步：更新组件
- ✅ TOC 组件已集成 `OptimizedTOCScroller`
- ✅ Layout 组件已移除强制同步布局代码
- ✅ 添加了必要的 CSS 优化

### 第三步：验证效果
```bash
# 运行性能检查
pnpm run check

# 在 Firefox DevTools 中重新录制性能分析
# 预期 Layout 占比从 94% 降至 10% 以下
```

## 🚀 进阶优化建议

### 1. IntersectionObserver 优化
```javascript
// 使用更精确的阈值配置
const observer = new IntersectionObserver(callback, {
    threshold: [0, 0.1, 0.5, 1.0],
    rootMargin: '0px 0px -20% 0px'
});
```

### 2. 滚动事件优化
```javascript
// 使用 passive 事件监听器
window.addEventListener('scroll', handler, { passive: true });

// 实现更智能的节流
const scrollHandler = new OptimizedScrollHandler();
```

### 3. 动画帧优化
```javascript
// 批量 DOM 操作
requestAnimationFrame(() => {
    // 所有读操作
    const measurements = readMeasurements();
    
    requestAnimationFrame(() => {
        // 所有写操作
        applyChanges(measurements);
    });
});
```

## 📈 验证指标

监控以下关键指标的变化：

1. **Layout 时间占比**：< 10%
2. **FPS**：稳定在 60fps
3. **首次输入延迟**：< 100ms
4. **长任务数量**：显著减少

## ⚠️ 注意事项

1. **渐进式实施**：先优化最关键的部分
2. **兼容性测试**：确保在不同浏览器中正常工作
3. **性能回归监控**：定期检查性能指标
4. **用户体验优先**：优化不应影响功能正确性

这套优化方案针对您项目中的具体问题进行了定制，应该能够显著改善 Layout 重排导致的卡顿问题。