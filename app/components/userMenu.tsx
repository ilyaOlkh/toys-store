'use client'

import React, { useState } from 'react';
import { Menu, MenuItem, IconButton, Divider, Typography, paperClasses, Paper } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface UserMenuProps {
    username: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ username }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton onClick={handleClick} color="inherit" className='rounded-lg'>
                <AccountCircleIcon />
                <div className='text-base pl-1'>
                    {username}
                </div>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        className: "border border-gray-300 rounded-lg shadow-lg z-10 p-0"
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleClose}>
                    Сторінка аккаунту
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose} sx={{ color: 'gray' }}>
                    <a className='size-full' href='/api/auth/logout'>Вийти</a>
                </MenuItem>
            </Menu >
        </>
    );
};

export default UserMenu;