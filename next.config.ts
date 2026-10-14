import type { NextConfig } from 'next';
const config: NextConfig = {devIndicators:false,turbopack:{root:process.cwd()},output:'export', trailingSlash:true, images:{unoptimized:true}, basePath: process.env.PAGES_BUILD === '1' ? '/mortgage-ops-lab' : ''};
export default config;
