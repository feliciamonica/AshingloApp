import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom';
import './login.css';

const PageConnexion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [elementsLoaded, setElementsLoaded] = useState({
    leftPane: false,
    logo: false,
    form: false,
    particles: false,
    content: false
  });
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const typingInterval = useRef(null);
  const particlesCreated = useRef(false);
  const navigate = useNavigate();

  // Simulation du chargement progressif de la page
  useEffect(() => {
    // Preloader initial
    const preloaderTimer = setTimeout(() => {
      setPageLoaded(true);
      document.querySelector('.preloader')?.classList.add('hidden');
    }, 2500);

    // Chargement séquentiel des éléments
    const loadElementsSequentially = async () => {
      // Attendre la fin du preloader
      await new Promise(resolve => setTimeout(resolve, 2800));
      
      // Afficher le container principal
      const container = document.querySelector('.container');
      if (container) {
        container.classList.add('loaded');
      }

      // Charger le panneau gauche
      await new Promise(resolve => setTimeout(resolve, 200));
      setElementsLoaded(prev => ({ ...prev, leftPane: true }));
      document.querySelector('.left-pane')?.classList.add('loaded');
      
      // Charger l'icône de recyclage
      await new Promise(resolve => setTimeout(resolve, 400));
      document.querySelector('.recycle-icon')?.classList.add('loaded');
      
      // Charger le contenu gauche
      await new Promise(resolve => setTimeout(resolve, 300));
      document.querySelector('.left-content')?.classList.add('loaded');
      
      // Charger le logo
      await new Promise(resolve => setTimeout(resolve, 200));
      setElementsLoaded(prev => ({ ...prev, logo: true }));
      document.querySelector('.logo-container')?.classList.add('loaded');
      
      // Charger le panneau droit
      await new Promise(resolve => setTimeout(resolve, 300));
      document.querySelector('.right-pane')?.classList.add('loaded');
      
      // Charger le formulaire
      await new Promise(resolve => setTimeout(resolve, 400));
      setElementsLoaded(prev => ({ ...prev, form: true }));
      document.querySelector('.login-container')?.classList.add('loaded');
      
      // Charger progressivement les éléments du formulaire
      await new Promise(resolve => setTimeout(resolve, 200));
      const inputGroups = document.querySelectorAll('.input-group');
      inputGroups.forEach((group, index) => {
        setTimeout(() => {
          group.classList.add('loaded');
        }, index * 150);
      });
      
      // Charger le bouton
      await new Promise(resolve => setTimeout(resolve, 400));
      document.querySelector('.login-btn')?.classList.add('loaded');
      
      // Charger le lien mot de passe oublié
      await new Promise(resolve => setTimeout(resolve, 200));
      document.querySelector('.forgot-password')?.classList.add('loaded');
      
      // Charger les particules
      await new Promise(resolve => setTimeout(resolve, 300));
      setElementsLoaded(prev => ({ ...prev, particles: true }));
      document.querySelector('.particles')?.classList.add('loaded');
      
      // Marquer le contenu comme entièrement chargé
      await new Promise(resolve => setTimeout(resolve, 200));
      setElementsLoaded(prev => ({ ...prev, content: true }));
    };

    loadElementsSequentially();

    return () => {
      clearTimeout(preloaderTimer);
    };
  }, []);

  // Créer les particules après le chargement
  useEffect(() => {
    if (elementsLoaded.particles && !particlesCreated.current) {
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
  }, [elementsLoaded.particles]);

  // Animation de frappe en boucle après le chargement complet
  useEffect(() => {
    if (elementsLoaded.content) {
      // Effet de parallaxe au survol
      const handleMouseMove = (e) => {
        const cursor = e.clientX / window.innerWidth;
        const leftPane = document.querySelector('.left-pane');
        if (leftPane) {
          leftPane.style.transform = `perspective(1000px) rotateY(${cursor * 2}deg)`;
        }
      };

      document.addEventListener('mousemove', handleMouseMove);

      // Démarrer l'animation de frappe en boucle
      startTypingLoop();

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (typingInterval.current) {
          clearInterval(typingInterval.current);
        }
      };
    }
  }, [elementsLoaded.content]);

  const startTypingLoop = () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (usernameInput && passwordInput) {
      const startFirstAnimation = () => {
        setTimeout(() => {
          typeEffect(usernameInput, "entrez votre email", 100, () => {
            setTimeout(() => {
              typeEffect(passwordInput, 'entrez votre mot de passe', 100, () => {
                // Attendre 3 secondes puis recommencer le cycle
                setTimeout(() => {
                  clearPlaceholders();
                  setTimeout(startFirstAnimation, 500);
                }, 3000);
              });
            }, 2000);
          });
        }, 1000);
      };

      startFirstAnimation();
    }
  };

  const clearPlaceholders = () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) usernameInput.placeholder = '';
    if (passwordInput) passwordInput.placeholder = '';
  };

  const typeEffect = (element, text, speed = 100, callback) => {
    let i = 0;
    element.placeholder = '';
    
    const type = () => {
      if (i < text.length) {
        element.placeholder += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else if (callback) {
        callback();
      }
    };
    
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
          
          // Redirection vers la page accueil
          navigate('/acceuil');
        }, 2000);
      }, 2000);
    }
  };

  const showForgotPassword = () => {
    alert('Fonctionnalité de récupération de mot de passe à venir !');
  };

  return (
    <div>
      {/* Preloader amélioré */}
      <div className="preloader">
        <div className="loader"></div>
        <div className="loader-text">Chargement de BinTech...</div>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>

      {/* Contenu principal */}
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
              <img src="./images/logo3.png" alt="BinTech Logo" />
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
                <label htmlFor="username">Email</label>
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
    </div>
  );
};

export default PageConnexion;