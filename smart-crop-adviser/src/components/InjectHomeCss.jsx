// src/components/InjectHomeCss.jsx
'use client';

import { useEffect } from 'react';
import cssText from '../app/home.module.css'; // raw-loader returns the file contents as string

export default function InjectHomeCss() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const ID = 'injected-home-module-css';
    if (document.getElementById(ID)) return;

    const style = document.createElement('style');
    style.id = ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(cssText));
    document.head.appendChild(style);
  }, []);

  return null;
}
