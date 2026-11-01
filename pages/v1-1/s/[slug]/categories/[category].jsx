import Storefront,{getServerSideProps as loadStorefront} from '../../[slug]';
export default Storefront;
export async function getServerSideProps(context){return loadStorefront({...context,categoryPage:true,query:{...context.query,category:context.params.category}});}
