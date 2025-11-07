import React, { useEffect } from 'react';
import axios from './config';

export function Starter() {
    useEffect(() => {
        const checkAuth = async () => {
            const isValid = await validateToken();

            if (!isValid || isValid.status !== 200) {
                console.log('Token is invalid or expired');
                localStorage.removeItem('token');
                localStorage.removeItem('roles');
                localStorage.removeItem('username');
                window.location.href = '/login';
                return;
            }
            console.log('Is token valid?', isValid.data.data.roles);

            if (isValid.data.data.roles.includes('ADMIN')) {
                window.location.href = '/dashboard';
            } else if (isValid.data.data.roles.includes('DRIVER')) {
                window.location.href = '/driver-dashboard';
            }else{
                window.location.href = '/login';
            }
        };
        checkAuth();
        
    });

    const validateToken = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return false;
        }
        try {
            const response = await axios.get('user/verify-token', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Token validation response:', response);
            return response;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }
    
    return ;
}