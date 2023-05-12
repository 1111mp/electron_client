import { useState, useEffect } from 'react';
import request from 'App/renderer/services';
import { useI18n } from 'Renderer/utils/i18n';

import { Theme } from 'App/types';
import type { AxiosError } from 'axios';

enum Type {
  SignIn = 1,
  SingUp,
}

const defaultTheme = Theme.system;

const Login: React.FC = () => {
  const [type, setType] = useState<Type>(Type.SignIn); // 1 sign in   2 sign up
  const [account, setAccount] = useState('');
  const [pwd, setPwd] = useState('');
  const [aerror, setArrror] = useState<boolean>(false);
  const [perror, setPrrror] = useState<boolean>(false);

  const i18n = useI18n();

  const closeLogin = () => {
    window.Context.closeLogin();
  };

  const accountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAccount = event.target.value;
    setArrror(!/^1[3-9](\d{9})$/i.test(newAccount));

    setAccount(newAccount);
  };

  const pwdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPwd = event.target.value;

    setPrrror(
      !/(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{6,16}$/i.test(
        newPwd
      )
    );
    setPwd(newPwd);
  };

  const disabled = !account || !pwd || aerror || perror;

  const submit = async () => {
    if (!account || !pwd || aerror || perror) return;
    request('users')(type === Type.SignIn ? '/login' : '/create', {
      method: 'POST',
      data: { account, pwd },
    })
      .then(async (res) => {
        if (res.statusCode === 200) {
          /** login 成功之后 更新数据库 user信息 */
          const { id, account, avatar, email, regisTime, updateTime } =
            res.data;

          const userInfo = {
            token: res.token!,
            userId: id,
            account,
            avatar,
            email,
            theme: defaultTheme,
            regisTime,
            updateTime,
          };
          try {
            await window.Context.sqlClient.updateOrCreateUser(userInfo);

            window.Context.loginSuccessed(userInfo);
          } catch (error) {
            console.log(error);
          }
        }
      })
      .catch((err: AxiosError) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      event.key === 'Enter' && submit();
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [submit]);

  const checkType = () => {
    setType(type === Type.SignIn ? Type.SingUp : Type.SignIn);
  };

  return (
    <div className="module-login">
      <p className="module-login-header">
        <span className="module-login-header-title"></span>
        <span className="iconfont icontop-close" onClick={closeLogin}></span>
      </p>
      <h3 className="module-login-welcome">
        Hi, <span className="module-login-welcome-highlight">Good Day!</span>
      </h3>
      <p className="module-login-tip">{`Please ${
        type === Type.SignIn ? 'sign in' : 'sign up'
      } to continue`}</p>
      <ul className="module-login-form">
        <li className={'module-login-form-username' + (aerror ? ' err' : '')}>
          <label htmlFor="account">Account</label>
          <input
            type="text"
            name="account"
            placeholder="account"
            value={account}
            maxLength={11}
            onChange={accountChange}
          />
        </li>
        <li className={'module-login-form-pwd' + (perror ? ' err' : '')}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            placeholder="password"
            value={pwd}
            onChange={pwdChange}
          />
        </li>
      </ul>
      <footer className="module-login-footer">
        <p className="module-login-footer__tip">
          Or{' '}
          <span onClick={checkType}>
            {type === Type.SignIn ? 'Sign up' : 'Sign in'}
          </span>
        </p>
        <button
          disabled={disabled}
          className="module-login-footer__button"
          onClick={submit}
        >
          {type === Type.SignIn ? i18n('signIn') : i18n('signUp')}
        </button>
      </footer>
    </div>
  );
};

export default Login;
