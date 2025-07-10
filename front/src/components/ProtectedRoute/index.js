import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../appContext';

const ProtectedRoute = ({ element: Component, ...rest }) => {
    const { isLoggedIn } = useAppContext();

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }
    return <Component {...rest} />;
}

export default ProtectedRoute;