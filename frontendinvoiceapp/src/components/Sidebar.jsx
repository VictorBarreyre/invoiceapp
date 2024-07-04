import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  Box,
  Link as Chakralink,
}
  from '@chakra-ui/react'



//definir une logique active en fonction du root car bug sur la couleur violet 
const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const { user, logout } = useAuth();
  const [redirectOnLogout, setRedirectOnLogout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  if (!user) {
    return null; // Ne rien afficher si l'utilisateur n'est pas connecté
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active-dashboard' : '';
  };

  if (redirectOnLogout) {
    return <Navigate to="/" />;
  }

  return (
    <Box as="nav" >
    <div className="sidebar neue-up" style={{ display: 'flex', flexDirection: 'column', height: '69.7vh', borderWidth:'1px' }}>
      <ul className="tab-list-dashboard">
        <li className={`tab ${getActiveClass('/profil')}`}>
          <Link to="/profil" onClick={() => handleTabClick('tab1')}>Profil</Link>
        </li>
        <li className={`tab ${getActiveClass('/factures')}`}>
          <Link to="/factures" onClick={() => handleTabClick('tab2')}> Vos Factures</Link>
        </li>
        <li className={`tab ${getActiveClass('/paiements')}`}>
          <Link to="/paiements" onClick={() => handleTabClick('tab3')}>Abonnement</Link>
        </li>

        <li className={`tab ${getActiveClass('/parametres')}`}>
          <Link to="/parametres" onClick={() => handleTabClick('tab4')}>Paramètres</Link>
        </li>


      </ul>
      <Chakralink onClick={handleLogout} type="submit" color='red' borderRadius='30px' mb='1.5rem' mt="4" w='100%' colorScheme="gray">
        Déconnexion
      </Chakralink>
    </div>
    </Box>
  );
};

export default Sidebar;