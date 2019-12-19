import * as React from 'react';
import { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';
import CustomWin from 'components/customWin';

export default class UserCenter extends BasicComponent {
  $render() {
    return (
      <Fragment>
        <CustomWin title="个人中心">
          UserCenter
        </CustomWin>
      </Fragment>
    )
  }
}
