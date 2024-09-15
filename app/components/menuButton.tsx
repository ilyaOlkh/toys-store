'use client'

import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { toggleMenu } from '../redux/headerSlice';
import { Menu } from "@mui/icons-material";

export default function MenuButton() {
    const dispatch = useDispatch<AppDispatch>();
    return <div className='cursor-pointer' onClick={() => dispatch(toggleMenu())}>
        <Menu fontSize="large" />
    </div>
}