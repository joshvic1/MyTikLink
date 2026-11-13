import Head from 'next/head';
import {examples,exampleInstance} from '../../../components/marketing/examples';
import ThemeRenderer from '../../../V1.1/landing/ThemeRenderer';
export default function Example({id}){const item=examples.find(e=>e.id===id);return <><Head><title>{item.brand} · MyTikLink design example</title><meta name="robots" content="noindex,follow"/></Head><div data-example-cover style={{background:'#fff',width:'100%',minHeight:'100vh'}}><ThemeRenderer instance={exampleInstance(item)} preview/></div></>}
export function getStaticPaths(){return {paths:examples.map(e=>({params:{id:e.id}})),fallback:false}}
export function getStaticProps({params}){return {props:{id:params.id}}}
