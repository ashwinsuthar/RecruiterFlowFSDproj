import { NavLink } from 'react-router-dom';
import type { ReactElement } from 'react';

export function Navbar(): ReactElement {
  return <header className="topbar"><a className="brand" href="/" aria-label="Goa Trip Splitter home"><span className="brand-mark">G</span><span>Goa trip <strong>splitter</strong></span></a>
    <nav aria-label="Main navigation"><NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Expenses</NavLink><NavLink to="/expenses/new" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Add expense <span aria-hidden="true">＋</span></NavLink></nav>
  </header>;
}
