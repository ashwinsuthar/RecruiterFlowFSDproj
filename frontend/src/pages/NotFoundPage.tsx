import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';

export function NotFoundPage(): ReactElement { return <section className="not-found"><div className="section-eyebrow">404 · WRONG TURN</div><h1>Page not found</h1><p className="muted">Looks like this page took a detour. Your trip expenses are still right here.</p><Link className="button primary" to="/">Back to expenses</Link></section>; }
