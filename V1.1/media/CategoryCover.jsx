import {getCategoryCover,coverSources} from './categoryImages';
export default function CategoryCover({categoryId,asset:given,src,alt,className,style,sizes='(max-width: 600px) 100vw, 50vw',priority=false,baseUrl='',allowParent=false,onError}){
 const asset=given||getCategoryCover(categoryId,{allowParent});const sources=coverSources(asset,baseUrl);
 const common={className,style:{aspectRatio:'2 / 1',objectFit:'cover',...style},width:1600,height:800,loading:priority?'eager':'lazy',fetchPriority:priority?'high':'auto',decoding:'async',onError};
 // Owner-provided images always win. A missing category never silently shows another business.
 if(src)return <img {...common} src={src} alt={alt||''}/>;
 if(!sources)return <div className={className} style={{aspectRatio:'2 / 1',background:'#eceeea',...style}} role="img" aria-label={alt||'Category cover not yet available'}/>;
 return <picture style={{display:'contents'}}><source type="image/avif" srcSet={sources.avif} sizes={sizes}/><source type="image/webp" srcSet={sources.webp} sizes={sizes}/><img {...common} src={sources.src} srcSet={sources.webp} sizes={sizes} alt={alt??asset.alt} style={{...common.style,objectPosition:`${asset.focalPoint.x*100}% ${asset.focalPoint.y*100}%`,...style}}/></picture>;
}
