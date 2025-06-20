import React, { useState, useEffect, useRef } from 'react';
import './login.css';

const PageConnexion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const typedOnce = useRef(false);
  const particlesCreated = useRef(false);

  useEffect(() => {
    if (!particlesCreated.current) {
      const particlesContainer = document.getElementById('particles');
      if (particlesContainer) {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.animationDelay = Math.random() * 8 + 's';
          particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
          particlesContainer.appendChild(particle);
        }
        particlesCreated.current = true;
      }
    }

    const handleMouseMove = (e) => {
      const cursor = e.clientX / window.innerWidth;
      const leftPane = document.querySelector('.left-pane');
      if (leftPane) {
        leftPane.style.transform = `perspective(1000px) rotateY(${cursor * 2}deg)`;
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    if (!typedOnce.current) {
      typedOnce.current = true;

      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');

      if (usernameInput && passwordInput) {
        typeEffect(usernameInput, "entrez votre nom d'utilisateur", 100);
        setTimeout(() => {
          typeEffect(passwordInput, 'entrez votre mot de passe', 100);
        }, 2500);
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const typeEffect = (element, text, speed = 100) => {
    let i = 0;
    element.placeholder = '';
    function type() {
      if (i < text.length) {
        element.placeholder += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  };

  const animateRecycle = () => {
    const icon = document.querySelector('.recycle-icon');
    if (icon) {
      icon.style.animation = 'none';
      setTimeout(() => {
        icon.style.animation = 'float 4s ease-in-out infinite';
      }, 10);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.username && formData.password) {
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          setFormData({ username: '', password: '' });
        }, 3000);
      }, 2000);
    }
  };

  const showForgotPassword = () => {
    alert('Fonctionnalité de récupération de mot de passe à venir !');
  };

  return (
    <div className="container">
      <div className="left-pane">
        <div className="particles" id="particles"></div>
        <div className="recycle-icon" onClick={animateRecycle}>
          ♻
        </div>
        <div className="left-content">
          <h1>BinTech</h1>
          <p>Ensemble agissons pour un environnement sain</p>
        </div>
      </div>

     
      <div className="right-pane">
        <div className="logo-container">
        <div className="logo">
          <img src="/images/logo3.png" alt="Logo Ashinglo" />
      </div>
    </div>

        <div className="login-container">
          {showSuccess && (
            <div className="success-message">
              ✓ Connexion réussie ! Redirection en cours...
            </div>
          )}

          <div className="welcome-text">
            <h2>Bienvenue</h2>
            <p>Connectez-vous à votre espace</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
              <div className="show-password-option">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                />
                <label htmlFor="showPassword">Afficher le mot de passe</label>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              <span>{isLoading ? 'Connexion...' : 'Connexion'}</span>
              {isLoading && <div className="loading"></div>}
            </button>
          </form>

          <div className="forgot-password">
            <a href="#" onClick={showForgotPassword}>Mot de passe oublié ?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageConnexion;