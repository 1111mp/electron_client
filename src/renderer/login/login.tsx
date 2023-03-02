import { useState, useEffect } from 'react';
import request from 'Renderer/requests';
import { useI18n } from 'Renderer/utils/i18n';

import type { AxiosError } from 'axios';

const Login: React.FC = () => {
  const [type, setType] = useState<1 | 2>(1); // 1 sign in   2 sign up
  const [account, setAccount] = useState('');
  const [pwd, setPwd] = useState('');
  const [aerror, setArrror] = useState<boolean>(false);
  const [perror, setPrrror] = useState<boolean>(false);

  const i18n = useI18n();

  const closeLogin = () => {
    window.Context.closeLogin();
  };

  const accountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 2) {
      if (!/^1[3-9](\d{9})$/i.test(event.target.value)) {
        !aerror && setArrror(true);
      } else {
        aerror && setArrror(false);
      }
    }
    setAccount(event.target.value);
  };

  const pwdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 2) {
      if (
        !/(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{6,16}$/i.test(
          event.target.value
        )
      ) {
        !perror && setPrrror(true);
      } else {
        perror && setPrrror(false);
      }
    }
    setPwd(event.target.value);
  };

  const submit = async () => {
    if (!account || !pwd || aerror || perror) return;
    request(type === 1 ? '/users/login' : '/users/create', {
      method: 'POST',
      data: { account, pwd },
    })
      .then(async (res) => {
        if (res.statusCode === 200) {
          /** login 成功之后 更新数据库 user信息 */
          const { id, account, avatar, email, regisTime, updateTime } =
            res.data;
          try {
            await window.Context.sqlClient.updateOrCreateUser({
              token: res.token,
              userId: id,
              account,
              avatar,
              email,
              regisTime,
              updateTime,
            });

            window.Context.loginSuccessed(
              JSON.stringify({
                token: res.token,
                ...res.data,
              })
            );
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
      if (event.key === 'Enter') {
        submit();
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, []);

  const checkType = () => {
    setType(type === 1 ? 2 : 1);
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
        type === 1 ? 'sign in' : 'sign up'
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
          <span onClick={checkType}>{type === 1 ? 'Sign up' : 'Sign in'}</span>
        </p>
        <button className="module-login-footer__button" onClick={submit}>
          {type === 1 ? i18n('signIn') : i18n('signUp')}
        </button>
      </footer>
    </div>
  );
};

export default Login;
