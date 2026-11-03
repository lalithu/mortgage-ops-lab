import './globals.css';
import './theme.css';
import VisitTracker from '../components/VisitTracker';
export const metadata = {title:'Baby Swish AI Demo', description:'A mortgage operations simulator exploring AI recommendations and deterministic financial workflows.'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{document.documentElement.dataset.theme=localStorage.getItem('baby-swish-theme')==='light'?'light':'dark'}catch{}"}}/></head><body><VisitTracker/>{children}</body></html>}
