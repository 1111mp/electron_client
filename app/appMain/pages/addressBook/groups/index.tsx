import './styles.scss';

import React from 'react';
import { Collapse } from 'antd';

type Props = {};

const { Panel } = Collapse;

const Groups: React.ComponentType<Props> = () => {
  return (
    <div className="module-friends">
      <Collapse ghost>
        <Panel header="This is panel header 1" key="1">
          <p>
            A dog is a type of domesticated animal. Known for its loyalty and
            faithfulness, it can be found as a welcome guest in many households
            across the world.
          </p>
        </Panel>
      </Collapse>
    </div>
  );
};

export default Groups;
