import Storefront,{getServerSideProps as loadStorefront} from '../../[slug]';
export default Storefront;
export async function getServerSideProps(context){return loadStorefront({...context,productPage:true,query:{...context.query,product:context.params.product}});}
