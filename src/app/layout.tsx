import './globals.css';
import VisitTracker from '../components/VisitTracker';
export const metadata = {title:'Baby Swish AI Demo', description:'A mortgage operations simulator exploring AI recommendations and deterministic financial workflows.'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body><VisitTracker/>{children}</body></html>}
