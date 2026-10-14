'use client';
import {useEffect} from 'react';
import {trackVisit} from '../state/trackVisit';
export default function VisitTracker(){
 useEffect(()=>{trackVisit(process.env.NEXT_PUBLIC_TRACKING_ENDPOINT, process.env.NEXT_PUBLIC_TRACK_LOCAL === '1')},[]);
 return null;
}
