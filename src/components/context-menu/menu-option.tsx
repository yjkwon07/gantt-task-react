import {
  useCallback,
} from 'react';
import type {
  ReactElement,
} from 'react';

import type { ContextMenuOptionType } from '../../types/public-types';

import styles from './menu-option.module.css';

type MenuOptionProps = {
  handleAction: (option: ContextMenuOptionType) => void;
  option: ContextMenuOptionType;
};

export function MenuOption({
  handleAction,

  option,
  option: {
    icon,
    label,
  },
}: MenuOptionProps): ReactElement {
  const onClick = useCallback(() => {
    handleAction(option);
  }, [handleAction, option]);

  return (
    <div
      className={styles.menuOption}
      onClick={onClick}
    >
      <div
        className={styles.icon}
      >
        {icon}
      </div>

      <div
        className={styles.label}
      >
        {label}
      </div>
    </div>
  );
}
