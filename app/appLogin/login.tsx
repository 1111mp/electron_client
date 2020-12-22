import React from 'react';
import request from 'app/requests';
import { ipcRenderer } from 'electron';
import listener from 'app/constants/listener.json';

const Login: React.FC = () => {
  const [type, setType] = React.useState<1 | 2>(1);
  const [account, setAccount] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  const [aerror, setArrror] = React.useState<boolean>(false);
  const [perror, setPrrror] = React.useState<boolean>(false);

  const closeLogin = () => {
    (window as any).closeLogin();
  };

  const accountChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!/^1[3-9](\d{9})$/i.test(event.target.value)) {
        !aerror && setArrror(true);
      } else {
        aerror && setArrror(false);
      }
      setAccount(event.target.value);
    },
    [aerror, setAccount, setArrror]
  );

  const pwdChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (
        !/(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{6,16}$/i.test(
          event.target.value
        )
      ) {
        !perror && setPrrror(true);
      } else {
        perror && setPrrror(false);
      }
      setPwd(event.target.value);
    },
    [perror, setPwd, setPrrror]
  );

  const submit = React.useCallback(async () => {
    if (!account || !pwd || aerror || perror) return;
    request(type === 1 ? '/login' : '/users/register', {
      method: 'POST',
      data: { account, pwd },
    })
      .then(async (res: any) => {
        console.log(res);
        if (res.code === 200) {
          /** login 成功之后 更新数据库 user信息 */
          (window as any).Signal.sqlClient
            .upsertUser({
              token: res.token,
              ...res.data,
            })
            .then(() => {
              ipcRenderer.send(
                listener.LOGIN_SUCCESSFUL,
                JSON.stringify({
                  token: res.token,
                  ...res.data,
                })
              );
            })
            .catch((error: any) => {
              console.log(error);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [account, pwd]);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        submit();
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [submit]);

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
          {type === 1 ? 'Sign in' : 'Sign up'}
        </button>
      </footer>
    </div>
  );
};

export default Login;
