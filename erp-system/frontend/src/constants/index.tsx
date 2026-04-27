/* eslint-disable react-refresh/only-export-components */
import { Tag } from 'antd';

export const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'orange', text: '待审批' },
  approved: { color: 'blue', text: '已审批' },
  rejected: { color: 'red', text: '已拒绝' },
  in_progress: { color: 'processing', text: '进行中' },
  completed: { color: 'green', text: '已完成' },
  cancelled: { color: 'default', text: '已取消' },
};

export const formatMoney = (v: number | string | null | undefined): string => {
  return `¥${Number(v || 0).toFixed(2)}`;
};

export const formatDate = (date: string | undefined): string => {
  if (!date) return '-';
  return date.split('T')[0];
};

export const isActiveTag = (v: boolean) => (
  <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag>
);

export const StatusTag = ({ status }: { status: string }) => {
  const s = statusMap[status] || { color: 'default', text: status };
  return <Tag color={s.color}>{s.text}</Tag>;
};
