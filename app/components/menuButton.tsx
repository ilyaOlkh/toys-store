'use client'

import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { toggleMenu } from '../redux/headerSlice';
import { Menu } from "@mui/icons-material";

export default function MenuButton() {
    const dispatch = useDispatch<AppDispatch>();
    return <div className='cursor-pointer' onClick={() => dispatch(toggleMenu())}>
        <Menu fontSize="large" />
    </div>
}