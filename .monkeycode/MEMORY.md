# 用户指令记忆

本文件记录了用户的指令、偏好和教导，用于在未来的交互中提供参考。

## 格式

### 用户指令条目
用户指令条目应遵循以下格式：

[用户指令摘要]
- Date: [YYYY-MM-DD]
- Context: [提及的场景或时间]
- Instructions:
  - [用户教导或指示的内容，逐行描述]

### 项目知识条目
Agent 在任务执行过程中发现的条目应遵循以下格式：

[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [代码结构|代码模式|代码生成|构建方法|测试方法|依赖关系|环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

## 去重策略
- 添加新条目前，检查是否存在相似或相同的指令
- 若发现重复，跳过新条目或与已有条目合并
- 合并时，更新上下文或日期信息
- 这有助于避免冗余条目，保持记忆文件整洁

## 条目

[电商ERP项目初始化]
- Date: 2026-04-23
- Context: 用户需要构建一个类似电商ERP的长期项目
- Instructions:
  - 核心功能：采购/供应链管理、销售/订单管理、财务管理、仓储/物流、数据分析看板
  - 技术栈：Node.js全栈 (NestJS + React + PostgreSQL)
  - 数据来源：混合模式（API优先，API不可用时使用爬虫补充）
  - 项目类型：长期项目，需要持续扩展

[电商ERP项目架构决策]
- Date: 2026-04-23
- Context: 初始化电商ERP项目
- Category: 代码结构
- Instructions:
  - 后端框架：NestJS + TypeORM + PostgreSQL
  - 前端框架：React 18 + Ant Design 5 + Zustand
  - 认证方式：JWT + Passport + RBAC
  - 项目结构：monorepo风格，分为backend和frontend目录
  - 文档目录：erp-system/docs/下包含architecture、api、deployment子目录
