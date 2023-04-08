import React, { Fragment } from "react";

import { ColumnProps } from "../../../types/public-types";

export const DependenciesColumn: React.FC<ColumnProps> = ({
  data: {
    dependencies,
  },
}) => {
  return (
    <Fragment>
      {dependencies.map(({ name }) => name).join(', ')}
    </Fragment>
  );
};
