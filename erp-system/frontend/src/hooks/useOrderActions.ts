import { useCallback, useState } from 'react';
import { Modal, message } from 'antd';

interface OrderActionsOptions<T> {
  fetchOrder: () => Promise<void>;
  actions: Array<{
    status: string;
    actionKey: string;
    actionName: string;
    confirmTitle: string;
    confirmContent: (order: T) => string;
    execute: (id: string) => Promise<any>;
    successMessage: string;
  }>;
}

export function useOrderActions<T extends { id: string; status: string }>(
  options: OrderActionsOptions<T>
) {
  const { fetchOrder, actions } = options;
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(
    (order: T, action: (typeof actions)[number]) => {
      Modal.confirm({
        title: action.confirmTitle,
        content: action.confirmContent(order),
        onOk: async () => {
          setLoading(true);
          try {
            await action.execute(order.id);
            message.success(action.successMessage);
            fetchOrder();
          } catch (error: any) {
            message.error(error.response?.data?.message || `${action.successMessage}失败`);
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [fetchOrder, actions]
  );

  const getAvailableActions = useCallback(
    (order: T) => {
      return actions
        .filter((a) => a.status === order.status)
        .map((action) => ({
          key: action.actionKey,
          name: action.actionName,
          onClick: () => handleAction(order, action),
        }));
    },
    [actions, handleAction]
  );

  return { loading, getAvailableActions };
}
