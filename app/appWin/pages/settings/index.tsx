import './styles.scss';

import React, { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';

import { List, Typography, Divider, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import listener from 'constants/listener.json';

type State = {
  theme: string;
};

export default class Settings extends BasicComponent<IAnyObject> {
  state: State;

  constructor(props: IAnyObject) {
    super(props);
    this.state = {
      theme: '',
    };
  }

  didMount() {
    this.$invoke(listener.GET_DATA_FROM_MAIN_WINDOW_ASYNC, ['settings']).then(
      (data) => {
        console.log(data);
        this.setState({
          theme: data.settings.theme,
        });
      }
    );
  }

  handleChange = (event: RadioChangeEvent) => {
    const theme = event.target.value;
    this.setState(
      {
        theme,
      },
      () => {
        this.$send(listener.INVOKE_MAIN_WINDOW_FUNC, {
          funcname: 'setAppTheme',
          args: theme,
        });
      }
    );
  };

  $render() {
    const { theme } = this.state;
    return (
      <Fragment>
        <div className="module-settings">
          <Divider className="module-settings-divider" orientation="left">
            主题
          </Divider>
          <Radio.Group onChange={this.handleChange} value={theme}>
            <Radio value="system">跟随系统</Radio>
            <Radio value="light">亮色</Radio>
            <Radio value="dark">暗黑</Radio>
          </Radio.Group>
        </div>
      </Fragment>
    );
  }
}

// const Settings: React.FC = React.memo(() => {
//   const { theme: realTheme } = queryParse(location.search);
//   const [theme, setTheme] = React.useState(realTheme);

//   const handleChange = React.useCallback(
//     (event: RadioChangeEvent) => {
//       setTheme(event.target.value);
//     },
//     [theme, setTheme]
//   );

//   return (
//     <Fragment>
//       <div className="module-settings">
//         <Divider className="module-settings-divider" orientation="left">
//           主题
//         </Divider>
//         <Radio.Group onChange={handleChange} value={theme}>
//           <Radio value="system">跟随系统</Radio>
//           <Radio value="light">亮色</Radio>
//           <Radio value="dark">暗黑</Radio>
//         </Radio.Group>
//       </div>
//     </Fragment>
//   );
// });

// export default Settings;
