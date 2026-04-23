# 电商ERP系统 - 开发规范

## 1. 代码规范

### 1.1 Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具
```

提交格式：`类型(模块): 描述`

示例：
- `feat(auth): 添加用户注册功能`
- `fix(inventory): 修复库存计算错误`
- `docs(readme): 更新项目文档`

### 1.2 分支命名规范

```
YYMMDD-(feat|fix|chore|refactor)-xxxxx-xxxx-xxxx
```

示例：
- `260423-feat-add-user-auth`
- `260425-fix-inventory-calculation`

### 1.3 命名规范

#### 后端 (NestJS + TypeScript)
- **类名**: PascalCase (e.g., `UserService`, `CreateUserDto`)
- **接口名**: PascalCase (e.g., `UserInterface`)
- **变量/函数**: camelCase (e.g., `getUserById`, `userName`)
- **常量**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **文件**: kebab-case (e.g., `user.service.ts`, `create-user.dto.ts`)

#### 前端 (React + TypeScript)
- **组件名**: PascalCase (e.g., `UserList.tsx`, `UserForm`)
- **函数组件**: PascalCase (e.g., `function UserProfile()`)
- **Hook**: camelCase，以use开头 (e.g., `useAuth`, `useFetchData`)
- **样式文件**: 与组件同名 (e.g., `UserList.less`)
- **文件**: kebab-case

## 2. API规范

### 2.1 RESTful设计

| 操作 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 创建 | POST | /resource | 创建资源 |
| 查询 | GET | /resource | 列表查询 |
| 查询 | GET | /resource/:id | 单个查询 |
| 更新 | PUT | /resource/:id | 完整更新 |
| 更新 | PATCH | /resource/:id | 部分更新 |
| 删除 | DELETE | /resource/:id | 删除资源 |

### 2.2 响应格式

```typescript
// 成功
{
  "code": 200,
  "message": "success",
  "data": T
}

// 分页
{
  "code": 200,
  "message": "success",
  "data": {
    "list": T[],
    "total": number,
    "page": number,
    "pageSize": number
  }
}

// 错误
{
  "code": number,
  "message": "error description",
  "errors": []
}
```

### 2.3 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

## 3. 数据库规范

### 3.1 表命名

- 使用复数名词 (e.g., `users`, `products`, `orders`)
- 小写字母 + 下划线 (e.g., `user_roles`, `order_items`)

### 3.2 字段命名

- `id`: 主键 (使用UUID或自增ID)
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 软删除时间 (nullable)
- `created_by`: 创建人ID
- `updated_by`: 更新人ID

### 3.3 索引规范

- 主键索引: `pk_<table_name>`
- 唯一索引: `uk_<table_name>_<column>`
- 普通索引: `idx_<table_name>_<column>`

## 4. 模块开发流程

1. **创建分支**: `git checkout -b YYMMDD-feat-xxx`
2. **编写文档**: 先编写 `requirements.md` 和 `design.md`
3. **实现代码**: 按照 模块 -> 服务 -> 控制器 顺序开发
4. **编写测试**: 核心逻辑需要单元测试
5. **提交代码**: 按照提交规范
6. **创建MR**: 提交PR/MR到主分支

---

*最后更新: 2026-04-23*
