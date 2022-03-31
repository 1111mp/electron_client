import './styles.scss';

import { Divider, Radio, RadioGroupProps } from 'antd';
import { Theme } from 'App/types';

const Setting: React.ComponentType = () => {
  const onThemeSettin: RadioGroupProps['onChange'] = (evt) => {
    const theme = evt.target.value as Theme;

    window.ThemeContext.nativeThemeListener.theme_setting(theme);
  };

  return (
    <>
      <div className="module-setting-drag"></div>
      <div className="module-setting">
        <Divider orientation="left" style={{ marginTop: 0 }}>
          主题
        </Divider>
        <Radio.Group onChange={onThemeSettin} defaultValue={window.systemTheme}>
          <Radio value={Theme.system}>跟随系统</Radio>
          <Radio value={Theme.light}>亮色</Radio>
          <Radio value={Theme.dark}>暗黑</Radio>
        </Radio.Group>
      </div>
    </>
  );
};

export default Setting;
