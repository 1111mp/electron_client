import React from 'react';
import request from 'app/requests';
import { ipcRenderer } from 'electron';
import listener from 'app/constants/listener.json';

const Login: React.FC = React.memo(() => {
  const [account, setAccount] = React.useState('');
  const [pwd, setPwd] = React.useState('');

  const closeLogin = () => {
    (window as any).closeLogin();
  };

  const accountChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAccount(event.target.value);
    },
    [setAccount]
  );

  const pwdChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPwd(event.target.value);
    },
    [setPwd]
  );

  const submit = React.useCallback(async () => {
    if (!account || !pwd) return;
    request('/login', {
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

  return (
    <div className="module-login">
      <p className="module-login-header">
        <span className="module-login-header-title"></span>
        <span className="iconfont icontop-close" onClick={closeLogin}></span>
      </p>
      <h3 className="module-login-welcome">
        Hi, <span className="module-login-welcome-highlight">Good Day!</span>
      </h3>
      <p className="module-login-tip">Please sign in to continue</p>
      <ul className="module-login-form">
        <li className="module-login-form-username">
          <label htmlFor="account">Account</label>
          <input
            type="text"
            name="account"
            placeholder="account"
            value={account}
            onChange={accountChange}
          />
        </li>
        <li className="module-login-form-pwd">
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
      <button className="module-login-button" onClick={submit}>
        Sign in
      </button>
    </div>
  );
});

export default Login;
