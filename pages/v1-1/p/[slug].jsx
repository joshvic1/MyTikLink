import PublicPage from '@/V1.1/landing/PublicPage';
export default PublicPage;
export async function getServerSideProps(context){const {loadPublicLandingPage}=await import('@/V1.1/lib/publicPageSSR');return loadPublicLandingPage(context,true);}
