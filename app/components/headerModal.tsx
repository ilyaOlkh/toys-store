'use client'

import React from 'react';
import { Drawer, List, ListItem, ListItemText, Button, Divider, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { closeMenu, toggleMenu } from '../redux/headerSlice';

export default function HeaderModal() {
    const dispatch = useDispatch<AppDispatch>();
    const menuOpen = useSelector((state: RootState) => state.header.menuOpen);

    return (
        <Drawer
            anchor='right'
            open={menuOpen}
            onClose={() => dispatch(closeMenu())}
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                },
            }}
            className='block md:hidden'
        >
            <Box>

                <Box className="flex flex-row p-4 gap-3">
                    <Box className="flex-grow flex justify-start">
                        <a href='/login' className=' h-full w-full'>
                            <button className="px-4 py-2 bg-blue1 text-white rounded h-full w-full">
                                Login
                            </button>
                        </a>
                    </Box>
                    <Box className="flex-grow flex justify-end">
                        <a href='/register'>
                            <button className="px-4 py-2 border-2 border-blue1 text-blue1 rounded hover:bg-blue1/10">
                                Register
                            </button>
                        </a>
                    </Box>
                </Box>
                <Divider />
                <nav className="mb-4 font-bold text-xl p-4">
                    <a href='/' className="block mb-2">Home</a>
                    <a href='/shop' className="block  mb-2">Shop</a>
                    <a href='/pages' className="block mb-2">Pages</a>
                    <a href='/blog' className="block mb-2">Blog</a>
                    <a href='/contact' className="block mb-2">Contact</a>
                </nav>
            </Box>
        </Drawer>
    );
}