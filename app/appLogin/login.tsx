import React from 'react';
import request from 'app/requests';
import { ipcRenderer } from 'electron';
import listener from 'app/constants/listener.json';

const Login: React.FC = React.memo(() => {
  const [username, setUsername] = React.useState('');
  const [pwd, setPwd] = React.useState('');

  const usernameChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(event.target.value);
    },
    [setUsername]
  );

  const pwdChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPwd(event.target.value);
    },
    [setPwd]
  );

  const submit = React.useCallback(() => {
    if (!username || !pwd) return;
    request('/login', {
      method: 'POST',
      data: { username, pwd },
    })
      .then((res: any) => {
        console.log(res);
        if (res.code === 200) {
          ipcRenderer.send(
            listener.LOGIN_SUCCESSFUL,
            JSON.stringify({
              token: res.token,
              ...res.data,
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [username, pwd]);

  return (
    <div className="module-login">
      <p className="module-login-header">
        <span className="module-login-header-title"></span>
        <span className="iconfont icontop-close"></span>
      </p>
      <h3 className="module-login-welcome">
        Hi, <span className="module-login-welcome-highlight">Good Day!</span>
      </h3>
      <p className="module-login-tip">Please sign in to continue</p>
      <ul className="module-login-form">
        <li className="module-login-form-username">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            placeholder="username"
            value={username}
            onChange={usernameChange}
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
