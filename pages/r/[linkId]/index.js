import {useRouter} from 'next/router';
import RedirectPage from '../../../V1.1/pages/RedirectPage';
import {LoadingState} from '../../../V1.1/components/UI';

// Existing shared /r URLs use the same resolver and designs as V1.1 links.
export default function PublicRedirect(){
 const router=useRouter();
 const linkId=typeof router.query.linkId==='string'?router.query.linkId:null;
 if(!router.isReady||!linkId)return <LoadingState label="Opening destination"/>;
 return <RedirectPage key={linkId} linkId={linkId}/>;
}
