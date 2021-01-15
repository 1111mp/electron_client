import './styles.scss';

import React, { Fragment } from 'react';

import { Divider, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import listener from 'constants/listener.json';
import { invoke, send } from 'app/utils/rendererapi';

const Settings: React.FC = () => {
  const [theme, setTheme] = React.useState<'system' | 'light' | 'dark' | ''>(
    ''
  );

  const handleChange = React.useCallback(
    (event: RadioChangeEvent) => {
      setTheme(event.target.value);
      send(listener.INVOKE_MAIN_WINDOW_FUNC, {
        funcname: 'setAppTheme',
        args: event.target.value,
      });
    },
    [theme, setTheme]
  );

  React.useEffect(() => {
    invoke(listener.GET_DATA_FROM_MAIN_WINDOW_ASYNC, ['UserInfo']).then(
      (data) => {
        console.log(data);
        setTheme(data.UserInfo.theme);
      }
    );
  }, [setTheme]);

  return (
    <Fragment>
      <div className="module-settings">
        <Divider className="module-settings-divider" orientation="left">
          主题
        </Divider>
        <Radio.Group onChange={handleChange} value={theme}>
          <Radio value="system">跟随系统</Radio>
          <Radio value="light">亮色</Radio>
          <Radio value="dark">暗黑</Radio>
        </Radio.Group>
      </div>
    </Fragment>
  );
};

export default Settings;
