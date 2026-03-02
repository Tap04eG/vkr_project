import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, role }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar role={role} />
            <main style={{
                flex: 1,
                marginLeft: '260px',
                padding: '2rem',
                minHeight: '100vh',
                background: 'var(--bg-soft)'
            }}>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
