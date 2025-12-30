// src/utils/adminHelpers.js - GÜNCEL VE DÜZELTİLMİŞ

export const handleEditUserClick = (user, setEditingUser, setEditUsername, setEditFullName, setEditCity, setError) => {
  setEditingUser(user);
  setEditUsername(user.username || '');
  setEditFullName(user.fullName || '');
  setEditCity(user.city || ''); 
  setError('');
};