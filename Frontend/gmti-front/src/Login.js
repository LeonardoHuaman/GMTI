import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';



function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password) {
      setError('Username and password are required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formDetails = new URLSearchParams();
    formDetails.append('username', username);
    formDetails.append('password', password);

    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDetails,
      });

      setLoading(false);

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        navigate('/protected');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Authentication failed!');
      }
    } catch (error) {
      setLoading(false);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <img 
          src="/images/logo.png" 
          alt="Logo" 
          style={styles.logo} 
        />
        <div style={styles.inputField}>
          <label style={styles.label}>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputField}>
          <label style={styles.label}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
  },
  form: {
    backgroundColor: 'rgb(255, 255, 255)',
    padding: '30px 40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center',
    color: '#fff',
    width: '300px',
  },
  logo: {
    width: '250px',
    height: '100px',
    marginBottom: '20px',
  },
  inputField: {
    marginBottom: '15px',
    textAlign: 'left',
    color: 'black',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    background: 'rgba(147, 171, 226, 0.2)',
    color: '#fff',
    fontSize: '16px',
  },
  button: {
    width: '320px',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    background: 'rgba(0,146,228,255)',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
  options: {
    marginTop: '10px',
    fontSize: '14px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
  },
  separator: {
    color: '#fff',
    margin: '0 5px',
  },
};

export default Login;
