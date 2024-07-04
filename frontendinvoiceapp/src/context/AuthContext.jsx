import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null); // Utiliser null pour une valeur initiale claire

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      // Complétez l'utilisateur stocké avec les valeurs par défaut si certaines valeurs sont manquantes
      const completeUser = {
        _id: storedUser._id || '',
        email: storedUser.email || '',
        name: storedUser.name || '',
        adresse: storedUser.adresse || '',
        siret: storedUser.siret || '',
        iban: storedUser.iban || '',
        ...storedUser // Cela garantit que les valeurs non spécifiées seront prises depuis le localStorage
      };
      console.log('User Loaded from Local Storage:', completeUser);
      setUser(completeUser);
    }
  }, []);

  const login = (userData) => {
    // Assurez-vous que toutes les propriétés nécessaires sont incluses lors du login
    const completeUser = {
      _id: userData._id,
      email: userData.email || '',
      name: userData.name || '',
      adresse: userData.adresse || '',
      siret: userData.siret || '',
      iban: userData.iban || '',
      ...userData
    };
    setUser(completeUser);
    console.log('User Logged in:', completeUser);
    localStorage.setItem('user', JSON.stringify(completeUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  function cleanObject(obj, cache = new WeakSet()) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    if (cache.has(obj)) {
      return {};
    }
    cache.add(obj);
    const newObj = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      newObj[key] = typeof value === 'object' ? cleanObject(value, cache) : value;
    }
    return newObj;
  }

  const fetchUserInvoices = async () => {
    if (!user) {
      return { invoices: [], message: 'Aucun utilisateur connecté.' };
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id}/invoices`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const invoices = response.data;
      return { invoices, message: '' };
    } catch (error) {
      return { invoices: [], message: error.response?.data?.message || 'Erreur lors de la récupération des factures.' };
    }
  };
  
  const updateUserProfile = async (userData) => {
    const cleanUpdates = cleanObject(userData);  // Nettoyer les données de l'utilisateur
  
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userData._id}`, cleanUpdates, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
  
      const updatedUser = response.data;
      const newUser = {
        ...user,
        ...updatedUser,
        token: user.token  // Assurez-vous de conserver le token actuel
      };
      setUser(newUser);  // Mettre à jour l'utilisateur dans l'état de l'application
      localStorage.setItem('user', JSON.stringify(newUser));  // Mettre à jour le localStorage avec les nouvelles données utilisateur
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const deleteAccount = async (password) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}` // Assurez-vous que l'authentification est correctement gérée
        },
        data: { password } // Ajoutez le mot de passe au corps de la requête
      });
  
      if (response.status !== 200) {
        throw new Error('Could not delete the account.');
      }
  
      // Log out user after account deletion
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, updateUserProfile, deleteAccount, fetchUserInvoices }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
